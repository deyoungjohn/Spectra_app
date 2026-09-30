import type { AssetIdentity, RecordState } from "./market-types";

export type FlowDirection = "inflow" | "outflow" | "neutral";
export type FlowInference = "buy" | "sell" | "transfer";
export type FlowConfidence = "high" | "medium" | "low" | "none";

export type IndexedTransfer = AssetIdentity & {
  transactionHash: `0x${string}`;
  logIndex: number;
  blockNumber: number;
  from: `0x${string}`;
  to: `0x${string}`;
  fromEntity: "liquidity_venue" | null;
  toEntity: "liquidity_venue" | null;
  amount: bigint;
  tokenPriceUsd: bigint;
  observedAt: string;
  source: string;
};

export type TransferPage = {
  transfers: IndexedTransfer[];
  nextCursor: string | null;
  source: string;
  observedAt: string | null;
  gap: string | null;
};

export interface TransferAdapter {
  getTransfers(cursor: string | null, from: Date, to: Date): Promise<TransferPage>;
}

export type WalletFlow = {
  wallet: `0x${string}`;
  ticker: string;
  platform: string;
  netUsd: string;
  transferCount: number;
  direction: FlowDirection;
  inference: FlowInference;
  confidence: FlowConfidence;
  basis: string;
  lastObservedAt: string;
};

export type TickerFlow = {
  ticker: string;
  platform: string;
  netUsd: string;
  grossUsd: string;
  transferCount: number;
  direction: FlowDirection;
};

export type FlowDataset = {
  mode: "demo" | "live";
  generatedAt: string;
  windowStart: string;
  windowEnd: string;
  state: RecordState;
  message: string;
  source: string;
  observedAt: string | null;
  pagesRead: number;
  transferCount: number;
  gaps: string[];
  tickers: TickerFlow[];
  wallets: WalletFlow[];
};
