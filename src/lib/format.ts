/** Formats an ISO timestamp identically during server rendering and hydration. */
export function formatUtcTime(value: string | null): string {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  const hour24 = date.getUTCHours();
  const hour12 = hour24 % 12 || 12;
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const period = hour24 < 12 ? "AM" : "PM";
  return `${hour12}:${minutes} ${period} UTC`;
}
