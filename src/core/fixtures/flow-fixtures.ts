export const DEMO_POOL = "0x1111111111111111111111111111111111111111" as const;

export const flowTransferFixtures = [
  { ticker: "AAPL", transactionHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", logIndex: 0, blockNumber: 43100001, from: DEMO_POOL, to: "0x1000000000000000000000000000000000000001", amount: "24", tokenPriceUsd: "253.40", minutesAgo: 205 },
  { ticker: "AAPL", transactionHash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", logIndex: 1, blockNumber: 43100009, from: DEMO_POOL, to: "0x2000000000000000000000000000000000000002", amount: "11", tokenPriceUsd: "253.55", minutesAgo: 142 },
  { ticker: "MSFT", transactionHash: "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc", logIndex: 0, blockNumber: 43100021, from: "0x3000000000000000000000000000000000000003", to: DEMO_POOL, amount: "7", tokenPriceUsd: "515.68", minutesAgo: 91 },
  { ticker: "NVDA", transactionHash: "0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd", logIndex: 2, blockNumber: 43100038, from: "0x4000000000000000000000000000000000000004", to: "0x5000000000000000000000000000000000000005", amount: "18", tokenPriceUsd: "180.20", minutesAgo: 44 },
  { ticker: "TSLA", transactionHash: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", logIndex: 0, blockNumber: 43100044, from: DEMO_POOL, to: "0x1000000000000000000000000000000000000001", amount: "9", tokenPriceUsd: "440.12", minutesAgo: 18 },
] as const;
