import type { FlowDataset } from "@/core/flow-types";

const usd = (value: string, signed = false) => {
  const amount = Number(value); const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Math.abs(amount));
  return `${signed && amount > 0 ? "+" : amount < 0 ? "−" : ""}${formatted}`;
};
const short = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;
const time = (value: string | null) => value ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(value)) : "Unavailable";

export function FlowRadar({ dataset }: { dataset: FlowDataset }) {
  const net = dataset.tickers.reduce((sum, ticker) => sum + Number(ticker.netUsd), 0);
  return <section id="flow" className="flow-section">
    <div className="sectionHeading"><div><p className="eyebrow">02 / READ</p><h2>Flow Radar</h2></div><span className="muted">Trailing 4 hours · indexed transfers</span></div>
    <div className={`notice flow-notice notice--${dataset.state}`} aria-live="polite"><strong>{dataset.state === "demo" ? "Illustrative flow" : dataset.state === "fresh" ? "Indexer current" : "Flow degraded"}</strong><span>{dataset.message}</span></div>
    <div className="stats flow-stats"><div><span>Net venue flow</span><strong className={net < 0 ? "alert" : "positive"}>{usd(String(net), true)}</strong></div><div><span>Transfers reconciled</span><strong>{dataset.transferCount}</strong></div><div><span>Pages read</span><strong>{dataset.pagesRead}</strong></div><div><span>Coverage gaps</span><strong>{dataset.gaps.length}</strong></div></div>
    <div className="flow-grid">
      <div className="tableWrap"><table className="flow-table"><thead><tr><th>Asset</th><th>Net venue flow</th><th>Gross moved</th><th>Events</th></tr></thead><tbody>{dataset.tickers.map((ticker) => <tr key={`${ticker.platform}:${ticker.ticker}`}><td><span className="ticker">{ticker.ticker}</span><small>{ticker.platform}</small></td><td className={`mono ${ticker.direction === "outflow" ? "alert" : "positive"}`}>{usd(ticker.netUsd, true)}</td><td className="mono">{usd(ticker.grossUsd)}</td><td className="mono">{ticker.transferCount}</td></tr>)}</tbody></table>{dataset.tickers.length === 0 && <p className="empty">No indexed transfers are available for this window.</p>}</div>
      <aside className="flow-provenance"><p className="eyebrow">WINDOW PROVENANCE</p><dl><div><dt>Source</dt><dd>{dataset.source}</dd></div><div><dt>Observed</dt><dd>{time(dataset.observedAt)}</dd></div><div><dt>Window</dt><dd>{time(dataset.windowStart)} — {time(dataset.windowEnd)}</dd></div><div><dt>State</dt><dd><span className={`data-state ${dataset.state}`}>{dataset.state}</span></dd></div></dl>{dataset.gaps.length > 0 && <ul>{dataset.gaps.map((gap) => <li key={gap}>{gap}</li>)}</ul>}</aside>
    </div>
    <div className="sectionHeading wallet-heading"><div><p className="eyebrow">WALLET BREAKDOWN</p><h2>Largest movements</h2></div><span className="muted">Intent is inferred only for labeled venue interactions</span></div>
    <div className="tableWrap"><table><thead><tr><th>Wallet</th><th>Asset</th><th>Net movement</th><th>Classification</th><th>Confidence</th><th>Last observed</th></tr></thead><tbody>{dataset.wallets.map((wallet) => <tr key={`${wallet.wallet}:${wallet.platform}:${wallet.ticker}`}><td className="mono"><strong title={wallet.wallet}>{short(wallet.wallet)}</strong></td><td><span className="ticker">{wallet.ticker}</span><small>{wallet.platform}</small></td><td className={`mono ${wallet.direction === "outflow" ? "alert" : "positive"}`}>{usd(wallet.netUsd, true)}<small>{wallet.transferCount} transfer{wallet.transferCount === 1 ? "" : "s"}</small></td><td><span className={`flow-kind flow-kind--${wallet.inference}`}>{wallet.inference}</span><small>{wallet.basis}</small></td><td><span className={`confidence confidence--${wallet.confidence}`}>{wallet.confidence}</span></td><td>{time(wallet.lastObservedAt)}</td></tr>)}</tbody></table></div>
    <p className="footnote">Flow Radar reports token movements, not confirmed trades. A buy or sell label is an inference based on interaction with a labeled liquidity venue and never changes the underlying transfer record.</p>
  </section>;
}
