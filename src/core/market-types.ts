export type MarketRegime = "OPEN" | "CLOSED" | "HALTED" | "UNKNOWN";
export type RecordState = "fresh" | "stale" | "error" | "demo";

export type Provenance = {
  source: string;
  observedAt: string | null;
  regime: MarketRegime;
  state: RecordState;
  error?: string;
};

export type AssetIdentity = {
  ticker: string;
  name: string;
  platform: string;
  token: string;
  chainId: number;
  address: `0x${string}`;
};

export type RwaQuote = Provenance & AssetIdentity & {
  tokenPrice: bigint;
  tokenToShareRatio: bigint;
  liquidityUsd: bigint | null;
};

export type TradFiQuote = Provenance & {
  ticker: string;
  price: bigint;
};

export type MarketRow = AssetIdentity & Provenance & {
  perShare: string | null;
  tradfi: string | null;
  spreadBps: string | null;
  liquidityUsd: string | null;
  tradfiSource: string | null;
  tradfiObservedAt: string | null;
  actionable: false;
};

export type MarketDataset = {
  mode: "demo" | "live";
  generatedAt: string;
  state: RecordState;
  message: string;
  rows: MarketRow[];
};
