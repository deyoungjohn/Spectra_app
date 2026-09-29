import type { MarketRegime, RwaQuote, TradFiQuote } from "../market-types";

export type MarketStatus = {
  ticker: string;
  regime: MarketRegime;
  source: string;
  observedAt: string | null;
};

export interface RwaQuoteAdapter { getQuotes(): Promise<RwaQuote[]>; }
export interface TradFiPriceAdapter { getPrices(tickers: string[]): Promise<TradFiQuote[]>; }
export interface MarketStatusAdapter { getStatuses(tickers: string[]): Promise<MarketStatus[]>; }

export type MarketAdapters = {
  rwa: RwaQuoteAdapter;
  tradfi: TradFiPriceAdapter;
  status: MarketStatusAdapter;
};
