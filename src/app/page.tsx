import { AnimatedStatus } from "@/components/spectrum/animated-status";
import { MarketDashboard } from "@/components/market-dashboard";
import { getMarketDataset } from "@/core/market-data";

export const dynamic = "force-dynamic";
export default async function Home() {
  const dataset = await getMarketDataset();
  const modeTone = dataset.state === "fresh" ? "success" : dataset.state === "error" || dataset.state === "stale" ? "warning" : "neutral";
  return <div className="shell">
    <aside className="sidebar"><div className="brand"><span className="brandmark">✦</span> SPECTRA</div><p className="eyebrow">INTELLIGENCE TERMINAL</p><nav aria-label="Main navigation"><a className="active" href="#market">Market intelligence</a><a href="#flow">Flow Radar</a><a href="#forge">Strategy Forge</a></nav><div className="sidebarFoot">BSC · READ-ONLY RESEARCH<br/>No wallet or trading connected</div></aside>
    <main><header className="hero"><div><p className="eyebrow">SPECTRA / MARKET INTELLIGENCE</p><h1>Markets, with context.</h1><p className="sub">Tokenized equities normalized per share and checked against an independent market source.</p></div><AnimatedStatus label={`${dataset.mode.toUpperCase()} · ${dataset.state.toUpperCase()}`} tone={modeTone} /></header>
      <section className={`notice notice--${dataset.state}`} aria-live="polite"><strong>{dataset.mode === "demo" ? "Research preview" : dataset.state === "fresh" ? "Live read-only data" : "Data degraded"}</strong><span>{dataset.message}</span></section>
      <section id="market"><div className="sectionHeading"><div><p className="eyebrow">01 / DISCOVER</p><h2>Market intelligence</h2></div><span className="muted">Per-share normalized · provenance attached</span></div>
        <div className="stats"><div><span>Assets returned</span><strong>{String(dataset.rows.length).padStart(2,"0")}</strong></div><div><span>Data mode</span><strong>{dataset.mode}</strong></div><div><span>Dataset state</span><strong>{dataset.state}</strong></div><div><span>Execution</span><strong>Off</strong></div></div>
        <MarketDashboard dataset={dataset} />
        <p className="footnote">Token quotes are divided by the ratio observed with that quote. Spread compares the normalized price only with an independent TradFi source. API reference prices are never treated as independent evidence.</p>
      </section>
      <section className="cards"><article id="flow"><p className="eyebrow">02 / READ</p><h2>Flow Radar</h2><p>Wallet accumulation will appear after indexed transfers are integrated and reconciled.</p><span className="badge">PLANNED</span></article><article id="forge"><p className="eyebrow">03 / FORGE</p><h2>Strategy Forge</h2><p>Deterministic strategy simulation follows provenance work. Mainnet execution remains gated.</p><span className="badge">PLANNED</span></article></section>
      <footer>SPECTRA · Data provenance before execution</footer>
    </main>
  </div>;
}
