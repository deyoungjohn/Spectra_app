import type { LucideIcon } from "lucide-react";

export function Metric({ label, value, detail, icon: Icon, tone }: { label: string; value: React.ReactNode; detail?: string; icon?: LucideIcon; tone?: "positive" | "negative" }) {
  return <div className="metric"><div className="metric-label">{Icon && <Icon size={15} />}<span>{label}</span></div><strong className={tone === "positive" ? "metric-value positive" : tone === "negative" ? "metric-value negative" : "metric-value"}>{value}</strong>{detail && <small>{detail}</small>}</div>;
}

export function Notice({ title, children, tone = "neutral" }: { title: string; children: React.ReactNode; tone?: "neutral" | "warning" | "success" }) {
  return <div className={`callout callout--${tone}`} role="status"><span className="callout-mark" /><strong>{title}</strong><span>{children}</span></div>;
}

export function SectionTitle({ eyebrow, title, meta }: { eyebrow: string; title: string; meta?: string }) {
  return <div className="section-title"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{meta && <span>{meta}</span>}</div>;
}
