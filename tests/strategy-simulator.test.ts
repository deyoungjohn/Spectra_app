import assert from "node:assert/strict";
import test from "node:test";
import { strategyFrames } from "../src/core/fixtures/strategy-fixtures";
import { simulateStrategy, validateStrategy } from "../src/core/strategy-simulator";
import { getStrategyDefinition } from "../src/core/strategy-templates";
import type { StrategyDefinition } from "../src/core/strategy-types";

function template(id: string): StrategyDefinition {
  const strategy = getStrategyDefinition(id);
  assert.ok(strategy);
  return strategy;
}

test("replays the recorded fixture deterministically with stable receipts", () => {
  const first = simulateStrategy(template("accumulation-entry"), strategyFrames);
  const second = simulateStrategy(template("accumulation-entry"), strategyFrames);
  assert.deepEqual(first, second);
  assert.equal(first.transactionSubmissionEnabled, false);
  assert.equal(first.counts.simulated, 1);
  assert.equal(first.counts.blocked, 1);
  assert.equal(first.decisions.length, 4);
  assert.match(first.decisions[1].receiptHash, /^[0-9a-f]{64}$/);
});

test("enforces notional and slippage policy without executing", () => {
  const result = simulateStrategy(template("conflict-drill"), strategyFrames);
  const blocked = result.decisions.find((decision) => decision.status === "blocked");
  assert.match(blocked?.reason ?? "", /notional exceeds/);
  assert.equal(result.counts.simulated, 1);
  assert.equal(result.counts.blocked, 1);
});

test("resolves matching rules by priority and records losing conflicts", () => {
  const result = simulateStrategy(template("conflict-drill"), strategyFrames);
  const conflict = result.decisions.find((decision) => decision.status === "conflict");
  assert.equal(conflict?.ruleId, "flow-buy");
  assert.match(conflict?.reason ?? "", /protective-sell/);
});

test("kill switch halts all remaining frames", () => {
  const result = simulateStrategy(template("accumulation-entry"), strategyFrames, { haltAfterFrame: 2 });
  assert.equal(result.killSwitchEngaged, true);
  assert.equal(result.counts.halted, 2);
  assert.ok(result.decisions.slice(-2).every((decision) => decision.action === null && decision.status === "halted"));
});

test("rejects unsupported DSL versions", () => {
  const invalid = { ...template("accumulation-entry"), version: 2 } as unknown as StrategyDefinition;
  assert.throws(() => validateStrategy(invalid), /Unsupported strategy DSL version/);
});
