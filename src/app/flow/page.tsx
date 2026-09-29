import { Activity } from "lucide-react";
import { FlowRadar } from "@/components/flow-radar";
import { PageHeader } from "@/components/page-header";
import { getFlowDataset } from "@/core/flow-data";

export const dynamic = "force-dynamic";
export default async function FlowPage() {
  const dataset = await getFlowDataset();
  const tone = dataset.state === "fresh" ? "success" : dataset.state === "error" || dataset.state === "stale" ? "warning" : "neutral";
  return <><PageHeader eyebrow="02 / Flow Radar" title="Follow the movement." description="Reconciled wallet activity over a trailing four-hour window, with provenance and inference confidence attached." icon={Activity} status={`${dataset.mode.toUpperCase()} · ${dataset.state.toUpperCase()}`} tone={tone} /><div className="page-content"><FlowRadar dataset={dataset} /></div></>;
}
