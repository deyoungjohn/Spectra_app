# Spectra

A read-only foundation for a tokenized equities intelligence terminal on BNB Smart Chain. See [the product architecture](docs/Spectra.md) and [the phased delivery plan](docs/ROADMAP.md).

## Run

Node 22 recommended. From a clean checkout:

```bash
bash scripts/setup.sh
npm run dev
```

Open `http://localhost:3000`. The default screen displays **illustrative demo data**, not market quotes. No wallet, payment, or trading execution is connected.

```bash
npm run verify
```

`/api/health` reports the selected market-data mode and disabled execution. `/api/market` exposes the same read-only, provenance-bearing dataset used by the server-rendered dashboard. CI runs the same checks on pushes and pull requests.

## Market data modes

`MARKET_DATA_MODE` defaults to `demo`, which uses deterministic adapters and requires no credentials. To exercise the server-only live adapter, set `MARKET_DATA_MODE=live` together with `RWA_QUOTES_URL`, `TRADFI_PRICES_URL`, and `MARKET_STATUS_URL`. Each endpoint must return JSON arrays with source and ISO `observedAt` fields; quote records also include ticker, chain ID, contract address, token price, current token-to-share ratio, liquidity, and regime. Credentials embedded in provider URLs must remain in the runtime secret store.

Live mode never falls back to demo records. Missing configuration, invalid mappings, stale observations, absent independent anchors, and upstream errors produce explicit non-actionable degraded states.

## Codex Cloud environment

1. Connect GitHub and select `deyoungjohn/spectra_app` in Codex Cloud.
2. Create an environment on `main`; choose Node 22. Set its setup script to `bash scripts/setup.sh` and maintenance script to `bash scripts/setup.sh` (or use automatic npm install). The script uses the committed lockfile.
3. The current demo needs **no secrets**. Optional ordinary variable: `NEXT_PUBLIC_APP_MODE=demo`. Keep `LIVE_TRADING=false` and `WEEKEND_PREMIUM_ENABLED=false`. These values are documented for future integrations; this preview does not read them to enable execution.
4. Agent internet access can remain off for this phase. Enable narrowly scoped access for future live API work only when required.
5. Review `docs/ROADMAP.md` before beginning the next delivery phase and run `npm run verify` before merging.

Cloud environment variables persist into the agent phase; Cloud secrets are setup-only. For live runtime services, put credentials in the hosting provider's runtime secret store. Do not commit `.env` or secrets to this repository. Set up dedicated test credentials only when a phase requires them.

## Status

Phase 1 provides typed server-side market adapters, recorded demo fixtures, provenance, explicit degraded states, and a read-only screener. Vendor-specific payload mappings and the source document's empirical findings still require live validation before production use.
