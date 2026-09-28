import { formatFixed18, parseFixed18, spreadBps, toPerShare } from "./fixed-point";

type DemoQuote = {
  ticker: string; name: string; platform: string; token: string;
  tokenPrice: string; ratio: string; tradfi: string; status: "OPEN" | "CLOSED";
};

const quotes: DemoQuote[] = [
  { ticker: "AAPL", name: "Apple", platform: "Ondo", token: "AAPLon", tokenPrice: "254.26", ratio: "1.003376073740221058", tradfi: "253.40", status: "OPEN" },
  { ticker: "NVDA", name: "NVIDIA", platform: "Ondo", token: "NVDAon", tokenPrice: "184.90", ratio: "1.0012", tradfi: "184.50", status: "OPEN" },
  { ticker: "TSLA", name: "Tesla", platform: "Ondo", token: "TSLAon", tokenPrice: "442.20", ratio: "1.0015", tradfi: "440.80", status: "CLOSED" },
  { ticker: "MSFT", name: "Microsoft", platform: "Ondo", token: "MSFTon", tokenPrice: "516.10", ratio: "1.0008", tradfi: "515.30", status: "OPEN" }
];

export const demoRows = quotes.map((quote) => {
  const perShare = toPerShare(parseFixed18(quote.tokenPrice), parseFixed18(quote.ratio));
  const basis = spreadBps(perShare, parseFixed18(quote.tradfi));
  return { ...quote, perShare: formatFixed18(perShare), basis: `${basis > 0n ? "+" : ""}${basis}`, alert: quote.status === "OPEN" && (basis > 10n || basis < -10n) };
});
