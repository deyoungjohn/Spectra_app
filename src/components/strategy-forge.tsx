"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Metric, SectionTitle } from "@/components/ui/surface";
import type { SimulationResult, StrategyDefinition } from "@/core/strategy-types";
import { formatUtcTime } from "@/lib/format";
import { Ban, CircleCheck, GitMerge, OctagonX } from "lucide-react";

export function StrategyForge({ strategies, initialResult }: { strategies: StrategyDefinition[]; initialResult: SimulationResult }) {
  const [selectedId, setSelectedId] = useState(strategies[0].id);
  const [reviewed, setReviewed] = useState(false);
  const [result, setResult] = useState<SimulationResult>(initialResult);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const strategy = useMemo(() => strategies.find((item) => item.id === selectedId) ?? strategies[0], [selectedId, strategies]);

  async function replay(halt: boolean) {
    setBusy(true); setError(null);
    try {
      const response = await fetch("/api/strategy/simulate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ templateId: strategy.id, ...(halt ? { haltAfterFrame: 2 } : {}) }) });
      const payload = await response.json() as SimulationResult | { error: string };
      if (!response.ok || "error" in payload) throw new Error("error" in payload ? payload.error : "Simulation request failed.");
      setResult(payload);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Simulation request failed."); }
    finally { setBusy(false); }
  }

  return <section>
    <SectionTitle eyebrow="Build & review" title="Simulation workspace" meta="Deterministic replay · execution permanently off" />
    <div className="forge-layout">
      <div className="forge-templates" aria-label="Strategy templates">
        <p className="eyebrow">SELECT A TEMPLATE</p>
        {strategies.map((item) => <Button type="button" variant="outline" key={item.id} className={item.id === strategy.id ? "template-card template-card--active" : "template-card"} onClick={() => { setSelectedId(item.id); setReviewed(false); setError(null); }}><strong>{item.name}</strong><span>{item.description}</span></Button>)}
      </div>
      <div className="forge-review">
        <div className="forge-review__heading"><div><p className="eyebrow">REVIEW VERSIONED DSL</p><h3>{strategy.name}</h3></div><span className="version-badge">DSL v{strategy.version}</span></div>
        <pre>{JSON.stringify(strategy, null, 2)}</pre>
        <label className="review-check"><input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} /> I reviewed the exact rules and policy used for this replay.</label>
        <div className="forge-actions"><Button type="button" size="lg" disabled={!reviewed || busy} onClick={() => replay(false)}>{busy ? "Replaying…" : "Replay fixture"}</Button><Button type="button" size="lg" variant="destructive" className="halt-button" disabled={!reviewed || busy} onClick={() => replay(true)}>Engage kill switch</Button></div>
        {error && <p className="forge-error" role="alert">{error}</p>}
      </div>
    </div>
    <div className="simulation-heading"><div><p className="eyebrow">AUDIT REPLAY</p><h3>{result.simulationId}</h3></div><div className="simulation-flags"><span className={result.killSwitchEngaged ? "flag flag--halted" : "flag"}>{result.killSwitchEngaged ? "KILL SWITCH ENGAGED" : "REPLAY COMPLETE"}</span><span className="flag">TRANSACTIONS OFF</span></div></div>
    <div className="metric-grid"><Metric label="Simulated" value={result.counts.simulated} icon={CircleCheck} detail="Policy approved"/><Metric label="Policy blocked" value={result.counts.blocked} icon={Ban} detail="No action taken"/><Metric label="Conflicts" value={result.counts.conflict} icon={GitMerge} detail="Priority resolved"/><Metric label="Halted frames" value={result.counts.halted} icon={OctagonX} detail="Kill switch"/></div>
    <div className="tableWrap"><table><thead><tr><th>Frame</th><th>Rule / action</th><th>Decision</th><th>Reason</th><th>Audit receipt</th></tr></thead><tbody>{result.decisions.map((decision) => <tr key={decision.receiptId}><td className="mono"><strong>{decision.frameId}</strong><small>{formatUtcTime(decision.observedAt)}</small></td><td><span className="source">{decision.ruleId ?? "Evaluator"}</span><small>{decision.action ? `${decision.action.type}${"ticker" in decision.action ? ` · ${decision.action.ticker}` : ""}` : "No proposed action"}</small></td><td><span className={`decision decision--${decision.status}`}>{decision.status}</span></td><td>{decision.reason}</td><td><details><summary className="mono">{decision.receiptId}</summary><code>{decision.receiptHash}</code></details></td></tr>)}</tbody></table></div>
    <p className="footnote">Every result is produced from the named recorded fixture. “Simulated” means a policy-approved hypothetical decision only; the simulator has no wallet, RPC submission, signing, or transaction code path.</p>
  </section>;
}
