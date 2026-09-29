import assert from "node:assert/strict";
import test from "node:test";
import { formatUtcTime } from "../src/lib/format";

test("formats timestamps in a deterministic UTC representation", () => {
  assert.equal(formatUtcTime("2026-09-29T18:53:00.000Z"), "6:53 PM UTC");
  assert.equal(formatUtcTime("2026-09-29T00:04:00.000Z"), "12:04 AM UTC");
});

test("returns an explicit fallback for missing or invalid timestamps", () => {
  assert.equal(formatUtcTime(null), "Unavailable");
  assert.equal(formatUtcTime("not-a-date"), "Unavailable");
});
