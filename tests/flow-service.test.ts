import assert from "node:assert/strict";
import test from "node:test";
import { createDemoTransferAdapter } from "../src/core/adapters/flow-demo";
import { buildFlowDataset, FLOW_MAX_PAGES } from "../src/core/flow-service";
import type { TransferAdapter } from "../src/core/flow-types";

const now = new Date("2026-09-29T12:00:00.000Z");

test("reconciles every known fixture across all pagination pages", async () => {
  const dataset = await buildFlowDataset(createDemoTransferAdapter(now), "demo", now);
  assert.equal(dataset.transferCount, 5);
  assert.equal(dataset.pagesRead, 3);
  assert.deepEqual(dataset.gaps, []);
  assert.deepEqual(dataset.tickers.map(({ ticker, netUsd, grossUsd, transferCount }) => ({ ticker, netUsd, grossUsd, transferCount })), [
    { ticker: "AAPL", netUsd: "8870.65", grossUsd: "8870.65", transferCount: 2 },
    { ticker: "TSLA", netUsd: "3961.08", grossUsd: "3961.08", transferCount: 1 },
    { ticker: "MSFT", netUsd: "-3609.76", grossUsd: "3609.76", transferCount: 1 },
    { ticker: "NVDA", netUsd: "0.00", grossUsd: "3243.60", transferCount: 1 },
  ]);
});

test("keeps transfers distinct from inferred trade intent", async () => {
  const dataset = await buildFlowDataset(createDemoTransferAdapter(now), "demo", now);
  const inferredBuy = dataset.wallets.find((row) => row.ticker === "AAPL" && row.wallet.endsWith("0001"));
  const plainTransfer = dataset.wallets.find((row) => row.ticker === "NVDA" && row.wallet.endsWith("0005"));
  assert.equal(inferredBuy?.inference, "buy");
  assert.equal(inferredBuy?.confidence, "medium");
  assert.match(inferredBuy?.basis ?? "", /inferred/);
  assert.equal(plainTransfer?.inference, "transfer");
  assert.equal(plainTransfer?.confidence, "none");
});

test("surfaces pagination gaps and stops repeated cursors", async () => {
  const adapter: TransferAdapter = { async getTransfers() { return { transfers: [], nextCursor: "repeat", source: "Test indexer", observedAt: now.toISOString(), gap: "Blocks 10–12 unavailable" }; } };
  const dataset = await buildFlowDataset(adapter, "live", now);
  assert.equal(dataset.pagesRead, 2);
  assert.equal(dataset.state, "stale");
  assert.ok(dataset.gaps.some((gap) => gap.includes("Blocks 10–12")));
  assert.ok(dataset.gaps.some((gap) => gap.includes("repeated cursor")));
});

test("caps pagination and reports potentially missing events", async () => {
  let page = 0;
  const adapter: TransferAdapter = { async getTransfers() { page += 1; return { transfers: [], nextCursor: String(page), source: "Test indexer", observedAt: now.toISOString(), gap: null }; } };
  const dataset = await buildFlowDataset(adapter, "live", now);
  assert.equal(dataset.pagesRead, FLOW_MAX_PAGES);
  assert.match(dataset.gaps.at(-1) ?? "", /Pagination stopped/);
});

test("does not substitute fixtures when the indexer fails", async () => {
  const adapter: TransferAdapter = { async getTransfers() { throw new Error("Indexer offline"); } };
  const dataset = await buildFlowDataset(adapter, "live", now);
  assert.equal(dataset.state, "error");
  assert.equal(dataset.transferCount, 0);
  assert.deepEqual(dataset.wallets, []);
  assert.match(dataset.message, /Indexer offline/);
});
