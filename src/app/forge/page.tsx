import { FlaskConical } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StrategyForge } from "@/components/strategy-forge";
import { getStrategy, getStrategyCatalog, replayStrategy } from "@/core/strategy-data";

export default function ForgePage() {
  const strategies = getStrategyCatalog().map(({ id }) => getStrategy(id)).filter((strategy) => strategy !== null);
  const initialResult = replayStrategy(strategies[0].id);
  return <><PageHeader eyebrow="03 / Strategy Forge" title="Test the thesis." description="Review versioned strategy rules, replay recorded evidence, and inspect every policy decision before execution exists." icon={FlaskConical} status="SIMULATION · SAFE" tone="success" /><div className="page-content"><StrategyForge strategies={strategies} initialResult={initialResult} /></div></>;
}
