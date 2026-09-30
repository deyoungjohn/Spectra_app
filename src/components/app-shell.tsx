"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ChartNoAxesCombined, FlaskConical, ShieldCheck, Sparkles } from "lucide-react";

const navigation = [
  { href: "/market", label: "Market intelligence", caption: "Prices & provenance", icon: ChartNoAxesCombined },
  { href: "/flow", label: "Flow Radar", caption: "Wallet movements", icon: Activity },
  { href: "/forge", label: "Strategy Forge", caption: "Simulation lab", icon: FlaskConical },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className="app-shell">
    <aside className="app-sidebar">
      <Link className="brand" href="/market"><span className="brand-icon"><Sparkles size={16} strokeWidth={2.2} /></span><span>SPECTRA</span></Link>
      <div className="nav-label">Intelligence terminal</div>
      <nav className="app-nav" aria-label="Main navigation">
        {navigation.map(({ href, label, caption, icon: Icon }) => <Link key={href} href={href} className={pathname === href ? "nav-item nav-item--active" : "nav-item"} aria-current={pathname === href ? "page" : undefined}><span className="nav-icon"><Icon size={17} /></span><span><strong>{label}</strong><small>{caption}</small></span></Link>)}
      </nav>
      <div className="sidebar-safety"><ShieldCheck size={17} /><div><strong>Research mode</strong><span>Execution disabled</span></div></div>
      <div className="sidebar-meta">BNB SMART CHAIN<br/>ILLUSTRATIVE DATA</div>
    </aside>
    <main className="app-main">{children}</main>
  </div>;
}
