import { parseFixed18 } from "../fixed-point";
import { assetRegistry } from "../fixtures/market-fixtures";
import { DEMO_POOL, flowTransferFixtures } from "../fixtures/flow-fixtures";
import type { IndexedTransfer, TransferAdapter } from "../flow-types";

const PAGE_SIZE = 2;

export function createDemoTransferAdapter(now = new Date()): TransferAdapter {
  const transfers: IndexedTransfer[] = flowTransferFixtures.map((fixture) => {
    const asset = assetRegistry.find((candidate) => candidate.ticker === fixture.ticker);
    if (!asset) throw new Error(`Missing demo asset: ${fixture.ticker}`);
    return {
      ...asset,
      address: asset.address as `0x${string}`,
      transactionHash: fixture.transactionHash,
      logIndex: fixture.logIndex,
      blockNumber: fixture.blockNumber,
      from: fixture.from,
      to: fixture.to,
      fromEntity: fixture.from === DEMO_POOL ? "liquidity_venue" : null,
      toEntity: fixture.to === DEMO_POOL ? "liquidity_venue" : null,
      amount: parseFixed18(fixture.amount),
      tokenPriceUsd: parseFixed18(fixture.tokenPriceUsd),
      observedAt: new Date(now.getTime() - fixture.minutesAgo * 60_000).toISOString(),
      source: "Illustrative indexed BSC fixture",
    };
  });
  return { async getTransfers(cursor, from, to) {
    const offset = cursor === null ? 0 : Number(cursor);
    if (!Number.isSafeInteger(offset) || offset < 0) throw new Error("Invalid demo pagination cursor");
    const window = transfers.filter((item) => Date.parse(item.observedAt) >= from.getTime() && Date.parse(item.observedAt) <= to.getTime());
    const page = window.slice(offset, offset + PAGE_SIZE);
    const next = offset + PAGE_SIZE < window.length ? String(offset + PAGE_SIZE) : null;
    return { transfers: page, nextCursor: next, source: "Illustrative indexed BSC fixture", observedAt: now.toISOString(), gap: null };
  } };
}
