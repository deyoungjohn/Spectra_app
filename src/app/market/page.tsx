import { Database, Layers3, Radio, ShieldOff } from "lucide-react";
import { MarketDashboard } from "@/components/market-dashboard";
import { PageHeader } from "@/components/page-header";
import { Metric, Notice, SectionTitle } from "@/components/ui/surface";
import { getMarketDataset } from "@/core/market-data";

export const dynamic = "force-dynamic";
export default async function MarketPage() {
  const dataset = await getMarketDataset();
  const tone = dataset.state === "fresh" ? "success" : dataset.state === "error" || dataset.state === "stale" ? "warning" : "neutral";
  return <>
    <PageHeader eyebrow="01 / Market intelligence" title="Markets, with context." description="Tokenized equities normalized per share and checked against an independent market source." icon={Layers3} status={`${dataset.mode.toUpperCase()} · ${dataset.state.toUpperCase()}`} tone={tone} />
    <div className="page-content">
      <Notice title={dataset.mode === "demo" ? "Research preview" : dataset.state === "fresh" ? "Live read-only data" : "Data degraded"} tone={tone}>{dataset.message}</Notice>
      <SectionTitle eyebrow="Discover" title="Market intelligence" meta="Per-share normalized · provenance attached" />
      <div className="metric-grid"><Metric label="Assets returned" value={String(dataset.rows.length).padStart(2, "0")} icon={Database} detail="Tracked instruments"/><Metric label="Data mode" value={dataset.mode} icon={Radio} detail="Server-side adapter"/><Metric label="Dataset state" value={dataset.state} icon={Layers3} detail="Provenance preserved"/><Metric label="Execution" value="Off" icon={ShieldOff} detail="Research only"/></div>
      <MarketDashboard dataset={dataset} />
      <p className="footnote">Token quotes are divided by the ratio observed with that quote. Spread compares the normalized price only with an independent TradFi source. API reference prices are never treated as independent evidence.</p>
    </div>
  </>;
}
