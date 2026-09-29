import "server-only";
import { createDemoAdapters } from "./adapters/demo";
import { createLiveAdapters } from "./adapters/live";
import { getCachedMarketDataset } from "./market-service";
import type { MarketDataset } from "./market-types";

export async function getMarketDataset(): Promise<MarketDataset> {
  const mode = process.env.MARKET_DATA_MODE === "live" ? "live" : "demo";
  if (mode === "demo") return getCachedMarketDataset(createDemoAdapters(), mode);
  try { return getCachedMarketDataset(createLiveAdapters(), mode); }
  catch (error) {
    const message = error instanceof Error ? error.message : "Live adapter configuration error";
    return { mode, generatedAt: new Date().toISOString(), state: "error", message: `Market data unavailable: ${message}`, rows: [] };
  }
}
