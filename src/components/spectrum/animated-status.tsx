/**
 * Animated Status — local, dependency-free fallback for the Spectrum UI proof.
 * Intended registry: https://spectrumui.dev (registry access was blocked in this environment).
 * Dependencies: React and CSS only. Confirm upstream source and license before merging.
 */
export function AnimatedStatus({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" }) {
  return <span className={`animated-status animated-status--${tone}`}><span aria-hidden="true" className="animated-status__dot" />{label}</span>;
}
