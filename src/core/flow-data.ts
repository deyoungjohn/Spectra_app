import "server-only";
import { createDemoTransferAdapter } from "./adapters/flow-demo";
import { createLiveTransferAdapter } from "./adapters/flow-live";
import { buildFlowDataset } from "./flow-service";
import type { FlowDataset } from "./flow-types";

export async function getFlowDataset(now = new Date()): Promise<FlowDataset> {
  const mode = process.env.MARKET_DATA_MODE === "live" ? "live" : "demo";
  try { return buildFlowDataset(mode === "live" ? createLiveTransferAdapter() : createDemoTransferAdapter(now), mode, now); }
  catch (error) {
    const message = error instanceof Error ? error.message : "Flow adapter configuration error";
    return { mode, generatedAt: now.toISOString(), windowStart: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), windowEnd: now.toISOString(), state: "error", message: `Flow data unavailable: ${message}`, source: mode === "live" ? "BSC transfer indexer" : "Illustrative indexed BSC fixture", observedAt: null, pagesRead: 0, transferCount: 0, gaps: [message], tickers: [], wallets: [] };
  }
}
