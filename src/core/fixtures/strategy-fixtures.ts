import type { SimulationFrame } from "../strategy-types";

export const STRATEGY_FIXTURE_ID = "recorded-aapl-session-v1";
export const STRATEGY_FIXTURE_SOURCE = "Recorded illustrative market + flow fixture";

export const strategyFrames: SimulationFrame[] = [
  { id: "frame-001", observedAt: "2026-09-25T13:30:00.000Z", ticker: "AAPL", priceUsd: "252.80", divergenceBps: 4, flowAccumulationUsd: "2200", estimatedSlippageBps: 18, source: STRATEGY_FIXTURE_SOURCE },
  { id: "frame-002", observedAt: "2026-09-25T14:00:00.000Z", ticker: "AAPL", priceUsd: "249.75", divergenceBps: 9, flowAccumulationUsd: "6100", estimatedSlippageBps: 24, source: STRATEGY_FIXTURE_SOURCE },
  { id: "frame-003", observedAt: "2026-09-25T14:30:00.000Z", ticker: "AAPL", priceUsd: "248.90", divergenceBps: 31, flowAccumulationUsd: "8400", estimatedSlippageBps: 42, source: STRATEGY_FIXTURE_SOURCE },
  { id: "frame-004", observedAt: "2026-09-25T15:00:00.000Z", ticker: "AAPL", priceUsd: "251.10", divergenceBps: 12, flowAccumulationUsd: "3900", estimatedSlippageBps: 20, source: STRATEGY_FIXTURE_SOURCE },
];
