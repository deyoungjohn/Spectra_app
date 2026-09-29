import { STRATEGY_DSL_VERSION, type StrategyDefinition, type StrategyTemplate } from "./strategy-types";

const definitions: StrategyDefinition[] = [
  {
    version: STRATEGY_DSL_VERSION,
    id: "accumulation-entry",
    name: "Flow-confirmed entry",
    description: "Simulate an AAPL entry when price is below $250 and four-hour accumulation exceeds $5,000.",
    rules: [{
      id: "flow-entry",
      priority: 50,
      conditions: [
        { type: "PRICE_BELOW", ticker: "AAPL", priceUsd: "250" },
        { type: "FLOW_ACCUMULATION_ABOVE", ticker: "AAPL", usdAmount: "5000" },
      ],
      action: { type: "BUY", ticker: "AAPL", platform: "Ondo", amountUsd: "10" },
    }],
    policy: { maxTradeNotionalUsd: "10", maxSlippageBps: 35, allowedTickers: ["AAPL"], maxDecisions: 2 },
  },
  {
    version: STRATEGY_DSL_VERSION,
    id: "divergence-guard",
    name: "Oracle divergence guard",
    description: "Emit a dashboard alert when independent-price divergence exceeds 25 bps.",
    rules: [{
      id: "divergence-alert",
      priority: 100,
      conditions: [{ type: "ORACLE_DIVERGENCE_ABOVE", ticker: "AAPL", divergenceBps: 25 }],
      action: { type: "ALERT", channel: "dashboard", message: "Independent price divergence exceeded policy threshold." },
    }],
    policy: { maxTradeNotionalUsd: "0", maxSlippageBps: 0, allowedTickers: ["AAPL"], maxDecisions: 4 },
  },
  {
    version: STRATEGY_DSL_VERSION,
    id: "conflict-drill",
    name: "Conflict resolution drill",
    description: "Replay opposing AAPL actions to demonstrate deterministic priority resolution and policy blocking.",
    rules: [
      { id: "protective-sell", priority: 90, conditions: [{ type: "ORACLE_DIVERGENCE_ABOVE", ticker: "AAPL", divergenceBps: 25 }], action: { type: "SELL", ticker: "AAPL", platform: "Ondo", amountUsd: "12" } },
      { id: "flow-buy", priority: 40, conditions: [{ type: "FLOW_ACCUMULATION_ABOVE", ticker: "AAPL", usdAmount: "5000" }], action: { type: "BUY", ticker: "AAPL", platform: "Ondo", amountUsd: "8" } },
    ],
    policy: { maxTradeNotionalUsd: "10", maxSlippageBps: 35, allowedTickers: ["AAPL"], maxDecisions: 3 },
  },
];

export const strategyTemplates: StrategyTemplate[] = definitions.map(({ id, name, description }) => ({ id, name, description }));

export function getStrategyDefinition(id: string): StrategyDefinition | null {
  return definitions.find((definition) => definition.id === id) ?? null;
}
