import assert from "node:assert/strict";
import test from "node:test";
import { createLiveTransferAdapter } from "../src/core/adapters/flow-live";

const transfer = {
  ticker: "AAPL",
  chainId: 56,
  address: "0x390a684ef9cade28a7ad0dfa61ab1eb3842618c4",
  transactionHash: `0x${"a".repeat(64)}`,
  logIndex: 0,
  blockNumber: 100,
  from: "0x1000000000000000000000000000000000000001",
  to: "0x2000000000000000000000000000000000000002",
  fromEntity: null,
  toEntity: "liquidity_venue",
  amount: "1.25",
  tokenPriceUsd: "250",
  observedAt: "2026-09-29T11:00:00.000Z",
  source: "Test indexer",
};

test("live transfer adapter validates identity and sends pagination bounds", async () => {
  const originalFetch = globalThis.fetch;
  let requested = "";
  globalThis.fetch = async (input) => {
    requested = String(input);
    return Response.json({ transfers: [transfer], nextCursor: "next-page", source: "Test indexer", observedAt: transfer.observedAt, gap: null });
  };
  try {
    const adapter = createLiveTransferAdapter({ BSC_TRANSFERS_URL: "https://indexer.test/transfers" });
    const page = await adapter.getTransfers("page-1", new Date("2026-09-29T08:00:00Z"), new Date("2026-09-29T12:00:00Z"));
    assert.equal(page.transfers[0].amount, 1_250_000_000_000_000_000n);
    assert.equal(page.transfers[0].toEntity, "liquidity_venue");
    assert.equal(page.nextCursor, "next-page");
    assert.match(requested, /cursor=page-1/);
    assert.match(requested, /from=/);
    assert.match(requested, /to=/);
  } finally { globalThis.fetch = originalFetch; }
});

test("live transfer adapter rejects an unregistered chain/address mapping", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ transfers: [{ ...transfer, chainId: 1 }], nextCursor: null, source: "Test indexer", observedAt: transfer.observedAt, gap: null });
  try {
    const adapter = createLiveTransferAdapter({ BSC_TRANSFERS_URL: "https://indexer.test/transfers" });
    await assert.rejects(() => adapter.getTransfers(null, new Date("2026-09-29T08:00:00Z"), new Date("2026-09-29T12:00:00Z")), /chain\/address mapping/);
  } finally { globalThis.fetch = originalFetch; }
});
