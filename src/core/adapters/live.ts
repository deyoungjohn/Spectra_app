import { parseFixed18 } from "../fixed-point";
import { assetRegistry } from "../fixtures/market-fixtures";
import type { MarketRegime, RwaQuote, TradFiQuote } from "../market-types";
import type { MarketAdapters, MarketStatus } from "./types";

const regimes = new Set<MarketRegime>(["OPEN", "CLOSED", "HALTED", "UNKNOWN"]);
function object(value: unknown): Record<string, unknown> { if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected an object"); return value as Record<string, unknown>; }
function text(value: unknown, field: string): string { if (typeof value !== "string" || !value) throw new Error(`Invalid ${field}`); return value; }
function observed(value: unknown): string { const result = text(value, "observedAt"); if (Number.isNaN(Date.parse(result))) throw new Error("Invalid observedAt"); return result; }
function regime(value: unknown): MarketRegime { return typeof value === "string" && regimes.has(value as MarketRegime) ? value as MarketRegime : "UNKNOWN"; }
async function fetchJson(url: string): Promise<unknown> { const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8_000) }); if (!response.ok) throw new Error(`Upstream returned ${response.status}`); return response.json(); }
function list(value: unknown): unknown[] { if (!Array.isArray(value)) throw new Error("Expected an array"); return value; }

export function createLiveAdapters(env: NodeJS.ProcessEnv = process.env): MarketAdapters {
  const rwaUrl = env.RWA_QUOTES_URL;
  const tradfiUrl = env.TRADFI_PRICES_URL;
  const statusUrl = env.MARKET_STATUS_URL;
  if (!rwaUrl || !tradfiUrl || !statusUrl) throw new Error("Live mode requires RWA_QUOTES_URL, TRADFI_PRICES_URL, and MARKET_STATUS_URL");
  return {
    rwa: { async getQuotes(): Promise<RwaQuote[]> { return list(await fetchJson(rwaUrl)).map((raw) => { const item = object(raw); const ticker = text(item.ticker, "ticker"); const identity = assetRegistry.find((asset) => asset.ticker === ticker); if (!identity || item.chainId !== identity.chainId || String(item.address).toLowerCase() !== identity.address.toLowerCase()) throw new Error(`Unknown ticker or chain/address mapping: ${ticker}`); const ratio = parseFixed18(text(item.tokenToShareRatio, "tokenToShareRatio")); if (ratio <= 0n) throw new Error("Ratio must be positive"); return { ...identity, address: identity.address as `0x${string}`, tokenPrice: parseFixed18(text(item.tokenPrice, "tokenPrice")), tokenToShareRatio: ratio, liquidityUsd: item.liquidityUsd == null ? null : parseFixed18(text(item.liquidityUsd, "liquidityUsd")), source: text(item.source, "source"), observedAt: observed(item.observedAt), regime: regime(item.regime), state: "fresh" }; }); } },
    tradfi: { async getPrices(tickers): Promise<TradFiQuote[]> { const url = new URL(tradfiUrl); url.searchParams.set("tickers", tickers.join(",")); return list(await fetchJson(url.toString())).map((raw) => { const item = object(raw); const ticker = text(item.ticker, "ticker"); if (!tickers.includes(ticker)) throw new Error(`Unexpected TradFi ticker: ${ticker}`); return { ticker, price: parseFixed18(text(item.price, "price")), source: text(item.source, "source"), observedAt: observed(item.observedAt), regime: regime(item.regime), state: "fresh" }; }); } },
    status: { async getStatuses(tickers): Promise<MarketStatus[]> { const url = new URL(statusUrl); url.searchParams.set("tickers", tickers.join(",")); return list(await fetchJson(url.toString())).map((raw) => { const item = object(raw); const ticker = text(item.ticker, "ticker"); if (!tickers.includes(ticker)) throw new Error(`Unexpected status ticker: ${ticker}`); return { ticker, regime: regime(item.regime), source: text(item.source, "source"), observedAt: observed(item.observedAt) }; }); } },
  };
}
