"use client";
import { useMemo, useState } from "react";
import type { MarketDataset, MarketRow } from "@/core/market-types";

type Sort = "ticker" | "price" | "spread" | "liquidity";
const number = (value: string | null) => value == null ? Number.NEGATIVE_INFINITY : Number(value);
const money = (value: string | null, digits = 2) => value == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: digits, minimumFractionDigits: digits }).format(Number(value));
const time = (value: string | null) => value ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(value)) : "Unavailable";

export function MarketDashboard({ dataset }: { dataset: MarketDataset }) {
  const [query, setQuery] = useState(""); const [regime, setRegime] = useState("ALL"); const [sort, setSort] = useState<Sort>("ticker");
  const rows = useMemo(() => dataset.rows.filter((row) => `${row.ticker} ${row.name} ${row.token}`.toLowerCase().includes(query.toLowerCase()) && (regime === "ALL" || row.regime === regime)).sort((a, b) => sort === "ticker" ? a.ticker.localeCompare(b.ticker) : number(sort === "price" ? b.perShare : sort === "spread" ? b.spreadBps : b.liquidityUsd) - number(sort === "price" ? a.perShare : sort === "spread" ? a.spreadBps : a.liquidityUsd)), [dataset.rows, query, regime, sort]);
  return <>
    <div className="filters" aria-label="Market filters"><label><span>Find an asset</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ticker or token" /></label><label><span>Market regime</span><select value={regime} onChange={(event) => setRegime(event.target.value)}><option>ALL</option><option>OPEN</option><option>CLOSED</option><option>HALTED</option></select></label><label><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="ticker">Ticker</option><option value="price">Per-share price</option><option value="spread">Spread</option><option value="liquidity">Liquidity</option></select></label></div>
    <div className="tableWrap"><table><thead><tr><th>Asset</th><th>Per-share / TradFi</th><th>Spread</th><th>Liquidity</th><th>Regime</th><th>Provenance</th></tr></thead><tbody>{rows.map((row) => <MarketTableRow key={`${row.chainId}:${row.address}`} row={row} />)}</tbody></table>{rows.length === 0 && <p className="empty">No assets match these filters.</p>}</div>
  </>;
}
function MarketTableRow({ row }: { row: MarketRow }) {
  const spread = row.spreadBps == null ? null : Number(row.spreadBps);
  return <tr><td><span className="ticker">{row.ticker}</span><small>{row.name} · {row.token}</small></td><td className="mono"><strong>{money(row.perShare)}</strong><small>{money(row.tradfi)} independent</small></td><td className={`mono ${spread != null && Math.abs(spread) > 10 ? "alert" : ""}`}>{spread == null ? "—" : `${spread > 0 ? "+" : ""}${spread} bps`}<small>{row.state === "fresh" ? "Research only" : "Not actionable"}</small></td><td className="mono">{money(row.liquidityUsd, 0)}</td><td><span className={`status ${row.regime.toLowerCase()}`}>{row.regime}</span><small className={`data-state ${row.state}`}>{row.state}</small></td><td><span className="source">{row.source}</span><small>{time(row.observedAt)}</small><small>{row.tradfiSource ?? row.error ?? "Anchor unavailable"}</small></td></tr>;
}
