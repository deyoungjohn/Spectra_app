# Spectra repository guidance

Read `docs/Spectra.md` for the full product vision and `docs/ROADMAP.md` for the staged delivery contract. The current application is a read-only research preview using explicitly illustrative data.

## Commands
- Setup: `bash scripts/setup.sh` (Node 22 preferred)
- Development: `npm run dev`
- Verification: `npm run verify` (lint, types, tests, production build)

## Architecture and safety
- Implement all data source access behind a shared server-side adapter in `src/core`; UI modules never call Binance, TradFi, BscScan, or RPC directly.
- Use 18-decimal BigInt fixed point for prices and ratios. Normalize token prices using the ratio fetched with that quote; compare to an independent TradFi source only. Do not treat `referencePrice` as an independent oracle.
- Preserve source, observed-at time, market regime, and stale/error state in every live-data record. Never silently substitute mock prices for a failed live feed.
- `LIVE_TRADING` and `WEEKEND_PREMIUM_ENABLED` default to false. No live order path, signing key, or mainnet deployment until the gates in `docs/ROADMAP.md` are documented and exercised. Simulation must never submit transactions.
- Sensitive variables are server-only and never committed or prefixed `NEXT_PUBLIC_`. Avoid logging values.
- Keep feature work in reviewable increments; add focused tests for financial arithmetic and execution policy changes. Run `npm run verify` before completion. Report any skipped checks or missing credentials.
