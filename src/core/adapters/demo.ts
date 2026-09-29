import { parseFixed18 } from "../fixed-point";
import { assetRegistry, demoQuoteFixtures, demoTradFiFixtures } from "../fixtures/market-fixtures";
import type { MarketAdapters } from "./types";

export function createDemoAdapters(now = new Date()): MarketAdapters {
  const observedAt = now.toISOString();
  return {
    rwa: { async getQuotes() {
      return demoQuoteFixtures.map((fixture) => {
        const asset = assetRegistry.find((item) => item.ticker === fixture.ticker)!;
        return { ...asset, address: asset.address as `0x${string}`, tokenPrice: parseFixed18(fixture.tokenPrice), tokenToShareRatio: parseFixed18(fixture.ratio), liquidityUsd: parseFixed18(fixture.liquidity), source: "Illustrative fixture", observedAt, regime: fixture.regime, state: "demo" as const };
      });
    } },
    tradfi: { async getPrices(tickers) {
      return demoTradFiFixtures.filter((item) => tickers.includes(item.ticker)).map((item) => ({ ticker: item.ticker, price: parseFixed18(item.price), source: "Illustrative TradFi fixture", observedAt, regime: "OPEN" as const, state: "demo" as const }));
    } },
    status: { async getStatuses(tickers) {
      return demoQuoteFixtures.filter((item) => tickers.includes(item.ticker)).map((item) => ({ ticker: item.ticker, regime: item.regime, source: "Illustrative status fixture", observedAt }));
    } },
  };
}
