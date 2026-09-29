export const assetRegistry = [
  { ticker: "AAPL", name: "Apple", platform: "Ondo", token: "AAPLon", chainId: 56, address: "0x390a684ef9cade28a7ad0dfa61ab1eb3842618c4" },
  { ticker: "NVDA", name: "NVIDIA", platform: "Ondo", token: "NVDAon", chainId: 56, address: "0x7f1f2d3c4b5a69788776655443322110aabbccdd" },
  { ticker: "TSLA", name: "Tesla", platform: "Ondo", token: "TSLAon", chainId: 56, address: "0x8a2b3c4d5e6f7081928374655647382910abcdef" },
  { ticker: "MSFT", name: "Microsoft", platform: "Ondo", token: "MSFTon", chainId: 56, address: "0x9b3c4d5e6f7081928374655647382910abcdef12" },
] as const;

export const demoQuoteFixtures = [
  { ticker: "AAPL", tokenPrice: "254.26", ratio: "1.003376073740221058", liquidity: "1482500", regime: "OPEN" },
  { ticker: "NVDA", tokenPrice: "184.90", ratio: "1.0012", liquidity: "912400", regime: "OPEN" },
  { ticker: "TSLA", tokenPrice: "442.20", ratio: "1.0015", liquidity: "638100", regime: "CLOSED" },
  { ticker: "MSFT", tokenPrice: "516.10", ratio: "1.0008", liquidity: "774800", regime: "OPEN" },
] as const;

export const demoTradFiFixtures = [
  { ticker: "AAPL", price: "253.40" }, { ticker: "NVDA", price: "184.50" },
  { ticker: "TSLA", price: "440.80" }, { ticker: "MSFT", price: "515.30" },
] as const;
