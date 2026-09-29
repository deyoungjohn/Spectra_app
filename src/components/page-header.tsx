import type { LucideIcon } from "lucide-react";
import { AnimatedStatus } from "@/components/spectrum/animated-status";

export function PageHeader({ eyebrow, title, description, icon: Icon, status, tone = "neutral" }: { eyebrow: string; title: string; description: string; icon: LucideIcon; status: string; tone?: "neutral" | "success" | "warning" }) {
  return <header className="page-hero"><div className="hero-copy"><div className="hero-icon"><Icon size={21} /></div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="sub">{description}</p></div><AnimatedStatus label={status} tone={tone} /></header>;
}
