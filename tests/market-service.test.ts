import assert from "node:assert/strict";
import test from "node:test";
import { parseFixed18 } from "../src/core/fixed-point";
import { buildMarketDataset } from "../src/core/market-service";
import type { MarketAdapters } from "../src/core/adapters/types";

const identity = { ticker: "AAPL", name: "Apple", platform: "Ondo", token: "AAPLon", chainId: 56, address: "0x390a684ef9cade28a7ad0dfa61ab1eb3842618c4" as const };
function adapters(overrides: { ratio?: string; anchor?: boolean; regime?: "OPEN" | "CLOSED" | "HALTED"; observedAt?: string; fail?: boolean } = {}): MarketAdapters {
  const observedAt = overrides.observedAt ?? "2026-09-28T12:00:00.000Z";
  return {
    rwa: { async getQuotes() { if (overrides.fail) throw new Error("RWA offline"); return [{ ...identity, tokenPrice: parseFixed18("101"), tokenToShareRatio: parseFixed18(overrides.ratio ?? "1.01"), liquidityUsd: parseFixed18("500000"), source: "RWA fixture", observedAt, regime: overrides.regime ?? "OPEN", state: "fresh" }]; } },
    tradfi: { async getPrices() { return overrides.anchor === false ? [] : [{ ticker: "AAPL", price: parseFixed18("100"), source: "TradFi fixture", observedAt, regime: overrides.regime ?? "OPEN", state: "fresh" }]; } },
    status: { async getStatuses() { return [{ ticker: "AAPL", regime: overrides.regime ?? "OPEN", source: "Status fixture", observedAt }]; } },
  };
}

test("normalizes with the ratio fetched beside each quote", async () => {
  const first = await buildMarketDataset(adapters(), "live", new Date("2026-09-28T12:01:00Z"));
  const drifted = await buildMarketDataset(adapters({ ratio: "1.02" }), "live", new Date("2026-09-28T12:01:00Z"));
  assert.equal(first.rows[0].perShare, "100.00");
  assert.equal(drifted.rows[0].perShare, "99.01");
});

test("missing independent anchor is explicit and never actionable", async () => {
  const dataset = await buildMarketDataset(adapters({ anchor: false }), "live", new Date("2026-09-28T12:01:00Z"));
  assert.equal(dataset.state, "error"); assert.equal(dataset.rows[0].tradfi, null); assert.equal(dataset.rows[0].actionable, false); assert.match(dataset.rows[0].error ?? "", /anchor unavailable/);
});

test("closed and halted regimes remain labelled", async () => {
  for (const regime of ["CLOSED", "HALTED"] as const) { const dataset = await buildMarketDataset(adapters({ regime }), "live", new Date("2026-09-28T12:01:00Z")); assert.equal(dataset.rows[0].regime, regime); }
});

test("stale observations degrade the complete dataset", async () => {
  const dataset = await buildMarketDataset(adapters({ observedAt: "2026-09-28T11:00:00Z" }), "live", new Date("2026-09-28T12:00:00Z"));
  assert.equal(dataset.state, "stale"); assert.equal(dataset.rows[0].state, "stale"); assert.equal(dataset.rows[0].actionable, false);
});

test("adapter failure is shown without substituting demo values", async () => {
  const dataset = await buildMarketDataset(adapters({ fail: true }), "live", new Date("2026-09-28T12:00:00Z"));
  assert.equal(dataset.state, "error"); assert.match(dataset.message, /RWA offline/); assert.ok(dataset.rows.every((row) => row.perShare === null));
});
