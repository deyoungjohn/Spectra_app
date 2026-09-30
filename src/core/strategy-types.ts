export const STRATEGY_DSL_VERSION = 1 as const;

export type StrategyCondition =
  | { type: "PRICE_BELOW"; ticker: string; priceUsd: string }
  | { type: "ORACLE_DIVERGENCE_ABOVE"; ticker: string; divergenceBps: number }
  | { type: "FLOW_ACCUMULATION_ABOVE"; ticker: string; usdAmount: string };

export type StrategyAction =
  | { type: "BUY" | "SELL"; ticker: string; platform: string; amountUsd: string }
  | { type: "ALERT"; channel: "dashboard"; message: string };

export type StrategyRule = {
  id: string;
  priority: number;
  conditions: StrategyCondition[];
  action: StrategyAction;
};

export type StrategyPolicy = {
  maxTradeNotionalUsd: string;
  maxSlippageBps: number;
  allowedTickers: string[];
  maxDecisions: number;
};

export type StrategyDefinition = {
  version: typeof STRATEGY_DSL_VERSION;
  id: string;
  name: string;
  description: string;
  rules: StrategyRule[];
  policy: StrategyPolicy;
};

export type StrategyTemplate = Pick<StrategyDefinition, "id" | "name" | "description">;

export type SimulationFrame = {
  id: string;
  observedAt: string;
  ticker: string;
  priceUsd: string;
  divergenceBps: number;
  flowAccumulationUsd: string;
  estimatedSlippageBps: number;
  source: string;
};

export type DecisionStatus = "simulated" | "blocked" | "conflict" | "not-triggered" | "halted";

export type SimulationDecision = {
  sequence: number;
  frameId: string;
  observedAt: string;
  ruleId: string | null;
  ticker: string;
  status: DecisionStatus;
  reason: string;
  action: StrategyAction | null;
  receiptId: string;
  receiptHash: string;
};

export type SimulationResult = {
  simulationId: string;
  strategyId: string;
  strategyVersion: number;
  fixtureId: string;
  fixtureSource: string;
  generatedAt: string;
  killSwitchEngaged: boolean;
  transactionSubmissionEnabled: false;
  decisions: SimulationDecision[];
  counts: Record<DecisionStatus, number>;
};
