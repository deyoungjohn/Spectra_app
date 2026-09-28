export const PRECISION = 10n ** 18n;
const BPS = 10_000n;

export function parseFixed18(value: string): bigint {
  if (!/^(0|[1-9]\d*)(\.\d{1,18})?$/.test(value)) throw new Error("Invalid positive decimal");
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * PRECISION + BigInt(fraction.padEnd(18, "0") || "0");
}

export function formatFixed18(value: bigint, decimals = 2): string {
  if (decimals < 0 || decimals > 18) throw new Error("Invalid precision");
  const sign = value < 0n ? "-" : "";
  const abs = value < 0n ? -value : value;
  const fraction = (abs % PRECISION).toString().padStart(18, "0").slice(0, decimals);
  return `${sign}${abs / PRECISION}${decimals ? `.${fraction}` : ""}`;
}

export function divFixed(a: bigint, b: bigint): bigint {
  if (b <= 0n) throw new Error("Invalid divisor");
  return a * PRECISION / b;
}

export function toPerShare(tokenPrice: bigint, tokenToShareRatio: bigint): bigint {
  return divFixed(tokenPrice, tokenToShareRatio);
}

export function spreadBps(price: bigint, independentAnchor: bigint): bigint {
  if (independentAnchor <= 0n) throw new Error("Invalid anchor");
  return price * BPS / independentAnchor - BPS;
}
