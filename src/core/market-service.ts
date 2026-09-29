import { formatFixed18, spreadBps, toPerShare } from "./fixed-point";
import { assetRegistry } from "./fixtures/market-fixtures";
import type { MarketAdapters } from "./adapters/types";
import type { MarketDataset, MarketRow, RecordState } from "./market-types";

export const STALE_AFTER_MS = 5 * 60 * 1000;
export const CACHE_MAX_AGE_MS = 30 * 1000;

type CacheEntry = { expiresAt: number; value: MarketDataset };
let cache: CacheEntry | null = null;
export function clearMarketCache() { cache = null; }

function stale(observedAt: string | null, now: Date): boolean {
  return !observedAt || now.getTime() - Date.parse(observedAt) > STALE_AFTER_MS;
}

export async function buildMarketDataset(adapters: MarketAdapters, mode: "demo" | "live", now = new Date()): Promise<MarketDataset> {
  const tickers = assetRegistry.map((asset) => asset.ticker);
  try {
    const [quotes, prices, statuses] = await Promise.all([adapters.rwa.getQuotes(), adapters.tradfi.getPrices([...tickers]), adapters.status.getStatuses([...tickers])]);
    const rows: MarketRow[] = quotes.map((quote) => {
      const anchor = prices.find((item) => item.ticker === quote.ticker);
      const status = statuses.find((item) => item.ticker === quote.ticker);
      const isStale = mode === "live" && (stale(quote.observedAt, now) || !anchor || stale(anchor.observedAt, now) || !status || stale(status.observedAt, now));
      const state: RecordState = mode === "demo" ? "demo" : !anchor || !status ? "error" : isStale ? "stale" : "fresh";
      const perShare = toPerShare(quote.tokenPrice, quote.tokenToShareRatio);
      return { ticker: quote.ticker, name: quote.name, platform: quote.platform, token: quote.token, chainId: quote.chainId, address: quote.address, source: quote.source, observedAt: quote.observedAt, regime: status?.regime ?? quote.regime, state, error: !anchor ? "Independent TradFi anchor unavailable" : !status ? "Market status unavailable" : undefined, perShare: formatFixed18(perShare), tradfi: anchor ? formatFixed18(anchor.price) : null, spreadBps: anchor ? spreadBps(perShare, anchor.price).toString() : null, liquidityUsd: quote.liquidityUsd == null ? null : formatFixed18(quote.liquidityUsd, 0), tradfiSource: anchor?.source ?? null, tradfiObservedAt: anchor?.observedAt ?? null, actionable: false };
    });
    const state: RecordState = mode === "demo" ? "demo" : rows.some((row) => row.state === "error") ? "error" : rows.some((row) => row.state === "stale") ? "stale" : "fresh";
    return { mode, generatedAt: now.toISOString(), state, message: mode === "demo" ? "Illustrative fixtures — no live feed or execution." : state === "fresh" ? "Live sources connected. Read-only research view." : "Live data is incomplete or stale. No signal is actionable.", rows };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown live data error";
    return { mode, generatedAt: now.toISOString(), state: "error", message: `Market data unavailable: ${message}`, rows: assetRegistry.map((asset) => ({ ...asset, address: asset.address as `0x${string}`, source: mode === "live" ? "Live adapter" : "Illustrative fixture", observedAt: null, regime: "UNKNOWN", state: "error", error: message, perShare: null, tradfi: null, spreadBps: null, liquidityUsd: null, tradfiSource: null, tradfiObservedAt: null, actionable: false })) };
  }
}

export async function getCachedMarketDataset(adapters: MarketAdapters, mode: "demo" | "live", now = new Date()): Promise<MarketDataset> {
  if (cache && cache.expiresAt > now.getTime() && cache.value.mode === mode) return cache.value;
  const value = await buildMarketDataset(adapters, mode, now);
  cache = { expiresAt: now.getTime() + CACHE_MAX_AGE_MS, value };
  return value;
}
