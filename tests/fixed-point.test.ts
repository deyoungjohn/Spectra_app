import assert from "node:assert/strict";
import test from "node:test";
import { formatFixed18, parseFixed18, spreadBps, toPerShare } from "../src/core/fixed-point";

test("normalizes a token quote using the current share ratio", () => {
  const ratio = parseFixed18("1.003376073740221058");
  const share = parseFixed18("250");
  const token = share * ratio / parseFixed18("1");
  const normalized = toPerShare(token, ratio);
  assert.ok(normalized >= share - 1n && normalized <= share);
  assert.equal(spreadBps(normalized, share), 0n);
});

test("rejects missing ratio or independent anchor", () => {
  assert.throws(() => toPerShare(parseFixed18("10"), 0n));
  assert.throws(() => spreadBps(parseFixed18("10"), 0n));
  assert.throws(() => parseFixed18("1.0000000000000000001"));
});

test("formats signed fixed point values", () => {
  assert.equal(formatFixed18(-parseFixed18("1.25")), "-1.25");
});
