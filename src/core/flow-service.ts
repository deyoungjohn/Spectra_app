import { formatFixed18, PRECISION } from "./fixed-point";
import type { FlowConfidence, FlowDataset, FlowDirection, FlowInference, IndexedTransfer, TransferAdapter, WalletFlow } from "./flow-types";
import type { RecordState } from "./market-types";

export const FLOW_WINDOW_MS = 4 * 60 * 60 * 1000;
export const FLOW_STALE_AFTER_MS = 5 * 60 * 1000;
export const FLOW_MAX_PAGES = 25;

type WalletAccumulator = { wallet: `0x${string}`; ticker: string; platform: string; net: bigint; count: number; inference: FlowInference; confidence: FlowConfidence; basis: string; lastObservedAt: string };
type TickerAccumulator = { ticker: string; platform: string; net: bigint; gross: bigint; count: number };

const direction = (amount: bigint): FlowDirection => amount > 0n ? "inflow" : amount < 0n ? "outflow" : "neutral";
const notional = (transfer: IndexedTransfer): bigint => transfer.amount * transfer.tokenPriceUsd / PRECISION;
const walletKey = (wallet: string, transfer: IndexedTransfer) => `${wallet}:${transfer.chainId}:${transfer.address}`;
const tickerKey = (transfer: IndexedTransfer) => `${transfer.chainId}:${transfer.address}`;

function classification(transfer: IndexedTransfer, wallet: string): Pick<WalletAccumulator, "inference" | "confidence" | "basis"> {
  const fromPool = transfer.fromEntity === "liquidity_venue"; const toPool = transfer.toEntity === "liquidity_venue";
  if (fromPool && wallet === transfer.to) return { inference: "buy", confidence: "medium", basis: "Inbound transfer from a labeled liquidity venue; transaction intent is inferred." };
  if (toPool && wallet === transfer.from) return { inference: "sell", confidence: "medium", basis: "Outbound transfer to a labeled liquidity venue; transaction intent is inferred." };
  return { inference: "transfer", confidence: "none", basis: "Token movement only; no buy or sell intent inferred." };
}

export async function buildFlowDataset(adapter: TransferAdapter, mode: "demo" | "live", now = new Date()): Promise<FlowDataset> {
  const from = new Date(now.getTime() - FLOW_WINDOW_MS); const gaps: string[] = []; const transfers: IndexedTransfer[] = [];
  const seenCursors = new Set<string>(); const seenEvents = new Set<string>();
  let cursor: string | null = null; let pagesRead = 0; let source = mode === "demo" ? "Illustrative indexed BSC fixture" : "BSC transfer indexer"; let observedAt: string | null = null;
  try {
    do {
      if (pagesRead >= FLOW_MAX_PAGES) { gaps.push(`Pagination stopped at ${FLOW_MAX_PAGES} pages; later events may be missing.`); break; }
      const page = await adapter.getTransfers(cursor, from, now); pagesRead += 1; source = page.source; observedAt = page.observedAt ?? observedAt;
      if (page.gap) gaps.push(page.gap);
      for (const transfer of page.transfers) {
        const eventId = `${transfer.transactionHash}:${transfer.logIndex}`;
        if (seenEvents.has(eventId)) { gaps.push(`Duplicate indexed event omitted: ${eventId}`); continue; }
        seenEvents.add(eventId);
        const time = Date.parse(transfer.observedAt);
        if (time < from.getTime() || time > now.getTime()) { gaps.push(`Out-of-window event omitted: ${eventId}`); continue; }
        transfers.push(transfer);
      }
      cursor = page.nextCursor;
      if (cursor && seenCursors.has(cursor)) { gaps.push("Indexer returned a repeated cursor; pagination stopped."); break; }
      if (cursor) seenCursors.add(cursor);
    } while (cursor);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown transfer indexer error";
    return { mode, generatedAt: now.toISOString(), windowStart: from.toISOString(), windowEnd: now.toISOString(), state: "error", message: `Flow data unavailable: ${message}`, source, observedAt, pagesRead, transferCount: 0, gaps: [message], tickers: [], wallets: [] };
  }

  const walletMap = new Map<string, WalletAccumulator>(); const tickerMap = new Map<string, TickerAccumulator>();
  for (const transfer of transfers) {
    const usd = notional(transfer); const fromPool = transfer.fromEntity === "liquidity_venue"; const toPool = transfer.toEntity === "liquidity_venue";
    const ticker = tickerMap.get(tickerKey(transfer)) ?? { ticker: transfer.ticker, platform: transfer.platform, net: 0n, gross: 0n, count: 0 };
    ticker.gross += usd; ticker.count += 1; if (fromPool) ticker.net += usd; if (toPool) ticker.net -= usd; tickerMap.set(tickerKey(transfer), ticker);
    for (const [wallet, sign] of [[transfer.from, -1n], [transfer.to, 1n]] as const) {
      if ((wallet === transfer.from && fromPool) || (wallet === transfer.to && toPool)) continue;
      const key = walletKey(wallet, transfer); const inferred = classification(transfer, wallet);
      const current = walletMap.get(key) ?? { wallet, ticker: transfer.ticker, platform: transfer.platform, net: 0n, count: 0, ...inferred, lastObservedAt: transfer.observedAt };
      current.net += sign * usd; current.count += 1;
      if (Date.parse(transfer.observedAt) >= Date.parse(current.lastObservedAt)) { current.lastObservedAt = transfer.observedAt; Object.assign(current, inferred); }
      walletMap.set(key, current);
    }
  }
  const wallets: WalletFlow[] = [...walletMap.values()].sort((a, b) => Number((b.net < 0n ? -b.net : b.net) - (a.net < 0n ? -a.net : a.net))).map((item) => ({ wallet: item.wallet, ticker: item.ticker, platform: item.platform, netUsd: formatFixed18(item.net), transferCount: item.count, direction: direction(item.net), inference: item.inference, confidence: item.confidence, basis: item.basis, lastObservedAt: item.lastObservedAt }));
  const tickers = [...tickerMap.values()].sort((a, b) => Number((b.net < 0n ? -b.net : b.net) - (a.net < 0n ? -a.net : a.net))).map((item) => ({ ticker: item.ticker, platform: item.platform, netUsd: formatFixed18(item.net), grossUsd: formatFixed18(item.gross), transferCount: item.count, direction: direction(item.net) }));
  const stale = mode === "live" && (!observedAt || now.getTime() - Date.parse(observedAt) > FLOW_STALE_AFTER_MS);
  const state: RecordState = mode === "demo" ? "demo" : stale || gaps.length > 0 ? "stale" : "fresh";
  const message = mode === "demo" ? "Illustrative transfer fixtures — movements are not trading signals." : state === "fresh" ? "Indexed BSC transfers reconciled for the trailing four hours." : "Flow data is stale or incomplete; gaps are shown below.";
  return { mode, generatedAt: now.toISOString(), windowStart: from.toISOString(), windowEnd: now.toISOString(), state, message, source, observedAt, pagesRead, transferCount: transfers.length, gaps, tickers, wallets };
}
