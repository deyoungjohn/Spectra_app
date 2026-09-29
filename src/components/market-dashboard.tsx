"use client";
import { useMemo, useState } from "react";
import { Input } from "@base-ui/react/input";
import type { MarketDataset, MarketRow } from "@/core/market-types";
import { formatUtcTime } from "@/lib/format";
import { SelectControl } from "@/components/ui/select-control";

type Sort = "ticker" | "price" | "spread" | "liquidity";
const number = (value: string | null) => value == null ? Number.NEGATIVE_INFINITY : Number(value);
const money = (value: string | null, digits = 2) => value == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: digits, minimumFractionDigits: digits }).format(Number(value));

export function MarketDashboard({ dataset }: { dataset: MarketDataset }) {
  const [query, setQuery] = useState(""); const [regime, setRegime] = useState("ALL"); const [sort, setSort] = useState<Sort>("ticker");
  const rows = useMemo(() => dataset.rows.filter((row) => `${row.ticker} ${row.name} ${row.token}`.toLowerCase().includes(query.toLowerCase()) && (regime === "ALL" || row.regime === regime)).sort((a, b) => sort === "ticker" ? a.ticker.localeCompare(b.ticker) : number(sort === "price" ? b.perShare : sort === "spread" ? b.spreadBps : b.liquidityUsd) - number(sort === "price" ? a.perShare : sort === "spread" ? a.spreadBps : a.liquidityUsd)), [dataset.rows, query, regime, sort]);
  return <>
    <div className="filters" aria-label="Market filters"><label><span>Find an asset</span><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ticker or token" className="text-input" /></label><label><span>Market regime</span><SelectControl label="Market regime" value={regime} onChange={setRegime} options={["ALL","OPEN","CLOSED","HALTED"].map((value) => ({ value, label: value }))} /></label><label><span>Sort by</span><SelectControl label="Sort by" value={sort} onChange={(value) => setSort(value as Sort)} options={[{value:"ticker",label:"Ticker"},{value:"price",label:"Per-share price"},{value:"spread",label:"Spread"},{value:"liquidity",label:"Liquidity"}]} /></label></div>
    <div className="tableWrap"><table><thead><tr><th>Asset</th><th>Per-share / TradFi</th><th>Spread</th><th>Liquidity</th><th>Regime</th><th>Provenance</th></tr></thead><tbody>{rows.map((row) => <MarketTableRow key={`${row.chainId}:${row.address}`} row={row} />)}</tbody></table>{rows.length === 0 && <p className="empty">No assets match these filters.</p>}</div>
  </>;
}
function MarketTableRow({ row }: { row: MarketRow }) {
  const spread = row.spreadBps == null ? null : Number(row.spreadBps);
  return <tr><td><span className="ticker">{row.ticker}</span><small>{row.name} · {row.token}</small></td><td className="mono"><strong>{money(row.perShare)}</strong><small>{money(row.tradfi)} independent</small></td><td className={`mono ${spread != null && Math.abs(spread) > 10 ? "alert" : ""}`}>{spread == null ? "—" : `${spread > 0 ? "+" : ""}${spread} bps`}<small>{row.state === "fresh" ? "Research only" : "Not actionable"}</small></td><td className="mono">{money(row.liquidityUsd, 0)}</td><td><span className={`status ${row.regime.toLowerCase()}`}>{row.regime}</span><small className={`data-state ${row.state}`}>{row.state}</small></td><td><span className="source">{row.source}</span><small>{formatUtcTime(row.observedAt)}</small><small>{row.tradfiSource ?? row.error ?? "Anchor unavailable"}</small></td></tr>;
}
