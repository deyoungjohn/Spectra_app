import { parseFixed18 } from "../fixed-point";
import { assetRegistry } from "../fixtures/market-fixtures";
import type { IndexedTransfer, TransferAdapter, TransferPage } from "../flow-types";

function record(value: unknown): Record<string, unknown> { if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected transfer object"); return value as Record<string, unknown>; }
function string(value: unknown, name: string): string { if (typeof value !== "string" || !value) throw new Error(`Invalid ${name}`); return value; }
function integer(value: unknown, name: string): number { const parsed = typeof value === "number" ? value : Number(value); if (!Number.isSafeInteger(parsed) || parsed < 0) throw new Error(`Invalid ${name}`); return parsed; }
function address(value: unknown, name: string): `0x${string}` { const parsed = string(value, name).toLowerCase(); if (!/^0x[0-9a-f]{40}$/.test(parsed)) throw new Error(`Invalid ${name}`); return parsed as `0x${string}`; }
function hash(value: unknown): `0x${string}` { const parsed = string(value, "transactionHash").toLowerCase(); if (!/^0x[0-9a-f]{64}$/.test(parsed)) throw new Error("Invalid transactionHash"); return parsed as `0x${string}`; }
function timestamp(value: unknown): string { const parsed = string(value, "observedAt"); if (Number.isNaN(Date.parse(parsed))) throw new Error("Invalid observedAt"); return parsed; }
function entity(value: unknown): "liquidity_venue" | null { if (value == null) return null; if (value !== "liquidity_venue") throw new Error("Invalid entity label"); return value; }

export function createLiveTransferAdapter(env: Record<string, string | undefined> = process.env): TransferAdapter {
  const endpoint = env.BSC_TRANSFERS_URL;
  if (!endpoint) throw new Error("Live Flow Radar requires BSC_TRANSFERS_URL");
  return { async getTransfers(cursor, from, to): Promise<TransferPage> {
    const url = new URL(endpoint);
    url.searchParams.set("from", from.toISOString()); url.searchParams.set("to", to.toISOString());
    if (cursor) url.searchParams.set("cursor", cursor);
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8_000) });
    if (!response.ok) throw new Error(`Transfer indexer returned ${response.status}`);
    const payload = record(await response.json());
    if (!Array.isArray(payload.transfers)) throw new Error("Transfer indexer response is missing transfers");
    const transfers: IndexedTransfer[] = payload.transfers.map((raw) => {
      const item = record(raw); const ticker = string(item.ticker, "ticker");
      const asset = assetRegistry.find((candidate) => candidate.ticker === ticker);
      const chainId = integer(item.chainId, "chainId"); const tokenAddress = address(item.address, "address");
      if (!asset || asset.chainId !== chainId || asset.address.toLowerCase() !== tokenAddress) throw new Error(`Unknown ticker or chain/address mapping: ${ticker}`);
      const amount = parseFixed18(string(item.amount, "amount")); const tokenPriceUsd = parseFixed18(string(item.tokenPriceUsd, "tokenPriceUsd"));
      if (amount <= 0n || tokenPriceUsd < 0n) throw new Error("Transfer amount must be positive and price cannot be negative");
      return { ...asset, address: asset.address as `0x${string}`, transactionHash: hash(item.transactionHash), logIndex: integer(item.logIndex, "logIndex"), blockNumber: integer(item.blockNumber, "blockNumber"), from: address(item.from, "from"), to: address(item.to, "to"), fromEntity: entity(item.fromEntity), toEntity: entity(item.toEntity), amount, tokenPriceUsd, observedAt: timestamp(item.observedAt), source: string(item.source, "source") };
    });
    return { transfers, nextCursor: payload.nextCursor == null ? null : string(payload.nextCursor, "nextCursor"), source: string(payload.source, "source"), observedAt: payload.observedAt == null ? null : timestamp(payload.observedAt), gap: payload.gap == null ? null : string(payload.gap, "gap") };
  } };
}
