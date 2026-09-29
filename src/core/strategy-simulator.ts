import { createHash } from "node:crypto";
import { parseFixed18 } from "./fixed-point";
import { STRATEGY_FIXTURE_ID, STRATEGY_FIXTURE_SOURCE } from "./fixtures/strategy-fixtures";
import { STRATEGY_DSL_VERSION, type DecisionStatus, type SimulationDecision, type SimulationFrame, type SimulationResult, type StrategyAction, type StrategyCondition, type StrategyDefinition, type StrategyRule } from "./strategy-types";

function hash(value: unknown): string { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function isTrade(action: StrategyAction): action is Extract<StrategyAction, { type: "BUY" | "SELL" }> { return action.type === "BUY" || action.type === "SELL"; }

export function validateStrategy(strategy: StrategyDefinition): void {
  if (strategy.version !== STRATEGY_DSL_VERSION) throw new Error(`Unsupported strategy DSL version: ${strategy.version}`);
  if (!strategy.id || !strategy.name || strategy.rules.length === 0) throw new Error("Strategy identity and at least one rule are required");
  if (new Set(strategy.rules.map((rule) => rule.id)).size !== strategy.rules.length) throw new Error("Rule IDs must be unique");
  parseFixed18(strategy.policy.maxTradeNotionalUsd);
  if (!Number.isSafeInteger(strategy.policy.maxSlippageBps) || strategy.policy.maxSlippageBps < 0 || !Number.isSafeInteger(strategy.policy.maxDecisions) || strategy.policy.maxDecisions < 1) throw new Error("Invalid strategy policy limits");
  for (const rule of strategy.rules) {
    if (!rule.id || !Number.isSafeInteger(rule.priority) || rule.conditions.length === 0) throw new Error("Invalid strategy rule");
    for (const condition of rule.conditions) {
      if (!strategy.policy.allowedTickers.includes(condition.ticker)) throw new Error(`Condition ticker is not allowed: ${condition.ticker}`);
      if (condition.type === "PRICE_BELOW") parseFixed18(condition.priceUsd);
      if (condition.type === "FLOW_ACCUMULATION_ABOVE") parseFixed18(condition.usdAmount);
    }
    if (isTrade(rule.action)) {
      if (!strategy.policy.allowedTickers.includes(rule.action.ticker)) throw new Error(`Action ticker is not allowed: ${rule.action.ticker}`);
      parseFixed18(rule.action.amountUsd);
    }
  }
}

function conditionMatches(condition: StrategyCondition, frame: SimulationFrame): boolean {
  if (condition.ticker !== frame.ticker) return false;
  if (condition.type === "PRICE_BELOW") return parseFixed18(frame.priceUsd) < parseFixed18(condition.priceUsd);
  if (condition.type === "FLOW_ACCUMULATION_ABOVE") return parseFixed18(frame.flowAccumulationUsd) > parseFixed18(condition.usdAmount);
  return frame.divergenceBps > condition.divergenceBps;
}

function policyReason(strategy: StrategyDefinition, rule: StrategyRule, frame: SimulationFrame, simulatedCount: number): string | null {
  if (!strategy.policy.allowedTickers.includes(frame.ticker)) return "Ticker is not permitted by policy.";
  if (simulatedCount >= strategy.policy.maxDecisions) return "Maximum simulated decision count reached.";
  if (!isTrade(rule.action)) return null;
  if (parseFixed18(rule.action.amountUsd) > parseFixed18(strategy.policy.maxTradeNotionalUsd)) return "Proposed notional exceeds the policy maximum.";
  if (frame.estimatedSlippageBps > strategy.policy.maxSlippageBps) return "Estimated slippage exceeds the policy maximum.";
  return null;
}

function receipt(strategy: StrategyDefinition, frame: SimulationFrame, sequence: number, rule: StrategyRule | null, status: DecisionStatus, reason: string): Pick<SimulationDecision, "receiptId" | "receiptHash"> {
  const body = { dslVersion: strategy.version, strategyId: strategy.id, fixtureId: STRATEGY_FIXTURE_ID, sequence, frameId: frame.id, ruleId: rule?.id ?? null, status, reason, action: rule?.action ?? null };
  const receiptHash = hash(body);
  return { receiptId: `sim-${sequence.toString().padStart(3, "0")}-${receiptHash.slice(0, 10)}`, receiptHash };
}

export function simulateStrategy(strategy: StrategyDefinition, frames: SimulationFrame[], options: { haltAfterFrame?: number } = {}): SimulationResult {
  validateStrategy(strategy);
  const decisions: SimulationDecision[] = []; let sequence = 0; let simulatedCount = 0;
  const add = (frame: SimulationFrame, rule: StrategyRule | null, status: DecisionStatus, reason: string) => {
    sequence += 1; decisions.push({ sequence, frameId: frame.id, observedAt: frame.observedAt, ruleId: rule?.id ?? null, ticker: frame.ticker, status, reason, action: rule?.action ?? null, ...receipt(strategy, frame, sequence, rule, status, reason) });
  };
  frames.forEach((frame, frameIndex) => {
    if (options.haltAfterFrame !== undefined && frameIndex >= options.haltAfterFrame) { add(frame, null, "halted", "Kill switch engaged; evaluation stopped and no action was simulated."); return; }
    const triggered = strategy.rules.filter((rule) => rule.conditions.every((condition) => conditionMatches(condition, frame))).sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
    if (triggered.length === 0) { add(frame, null, "not-triggered", "No rule conditions matched this recorded frame."); return; }
    const winner = triggered[0];
    for (const losingRule of triggered.slice(1)) add(frame, losingRule, "conflict", `Rule superseded by higher-priority rule ${winner.id}.`);
    const blocked = policyReason(strategy, winner, frame, simulatedCount);
    if (blocked) add(frame, winner, "blocked", blocked);
    else { add(frame, winner, "simulated", isTrade(winner.action) ? "Policy passed; action recorded as simulation only." : "Policy passed; alert recorded as simulation only."); simulatedCount += 1; }
  });
  const statuses: DecisionStatus[] = ["simulated", "blocked", "conflict", "not-triggered", "halted"];
  const counts = Object.fromEntries(statuses.map((status) => [status, decisions.filter((decision) => decision.status === status).length])) as Record<DecisionStatus, number>;
  const killSwitchEngaged = options.haltAfterFrame !== undefined;
  return { simulationId: `simulation-${hash({ strategy: strategy.id, fixture: STRATEGY_FIXTURE_ID, haltAfterFrame: options.haltAfterFrame ?? null }).slice(0, 16)}`, strategyId: strategy.id, strategyVersion: strategy.version, fixtureId: STRATEGY_FIXTURE_ID, fixtureSource: STRATEGY_FIXTURE_SOURCE, generatedAt: frames.at(-1)?.observedAt ?? "1970-01-01T00:00:00.000Z", killSwitchEngaged, transactionSubmissionEnabled: false, decisions, counts };
}
