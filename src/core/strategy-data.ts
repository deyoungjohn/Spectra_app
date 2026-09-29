import "server-only";
import { strategyFrames } from "./fixtures/strategy-fixtures";
import { simulateStrategy } from "./strategy-simulator";
import { getStrategyDefinition, strategyTemplates } from "./strategy-templates";
import type { SimulationResult, StrategyDefinition } from "./strategy-types";

export function getStrategyCatalog() { return strategyTemplates; }
export function getStrategy(id: string): StrategyDefinition | null { return getStrategyDefinition(id); }
export function replayStrategy(id: string, haltAfterFrame?: number): SimulationResult {
  const strategy = getStrategyDefinition(id);
  if (!strategy) throw new Error(`Unknown strategy template: ${id}`);
  return simulateStrategy(strategy, strategyFrames, { haltAfterFrame });
}
