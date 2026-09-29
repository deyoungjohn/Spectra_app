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

`/api/health` reports the selected market-data mode and disabled execution. `/api/market` and `/api/flow` expose the same read-only, provenance-bearing datasets used by the server-rendered dashboard. CI runs the same checks on pushes and pull requests.

## Market data modes

`MARKET_DATA_MODE` defaults to `demo`, which uses deterministic adapters and requires no credentials. To exercise the server-only live adapter, set `MARKET_DATA_MODE=live` together with `RWA_QUOTES_URL`, `TRADFI_PRICES_URL`, and `MARKET_STATUS_URL`. Each endpoint must return JSON arrays with source and ISO `observedAt` fields; quote records also include ticker, chain ID, contract address, token price, current token-to-share ratio, liquidity, and regime. Credentials embedded in provider URLs must remain in the runtime secret store.

Live mode never falls back to demo records. Missing configuration, invalid mappings, stale observations, absent independent anchors, and upstream errors produce explicit non-actionable degraded states.

## Flow Radar

Flow Radar defaults to paginated illustrative BSC transfer fixtures and reconciles a trailing four-hour window. In live mode, configure the server-only `BSC_TRANSFERS_URL`. The endpoint receives `from`, `to`, and (after the first page) `cursor` query parameters and returns:

```json
{
  "transfers": [{
    "ticker": "AAPL", "chainId": 56, "address": "0x...",
    "transactionHash": "0x...", "logIndex": 0, "blockNumber": 1,
    "from": "0x...", "to": "0x...", "amount": "1.25",
    "tokenPriceUsd": "250.00", "observedAt": "2026-09-29T12:00:00Z",
    "source": "Indexer name", "fromEntity": null, "toEntity": "liquidity_venue"
  }],
  "nextCursor": null, "source": "Indexer name",
  "observedAt": "2026-09-29T12:00:00Z", "gap": null
}
```

Token identity is checked against the registry, event IDs are deduplicated, pagination is bounded, and gaps remain visible. Transfers are always reported as transfers. A buy or sell classification is only a medium-confidence inference when the indexer explicitly labels one side `liquidity_venue`; unlabeled wallet-to-wallet movements retain `transfer`/`none` classification.

## Strategy Forge simulation

Strategy Forge contains reviewed, versioned DSL templates and replays them against a named recorded fixture. Select a template, inspect its exact JSON, acknowledge the review, and then replay it normally or engage the deterministic kill switch. Policy limits cover ticker allowlists, maximum hypothetical notional, estimated slippage, and decision count. Simultaneously matching rules resolve by explicit priority, and every outcome receives a stable SHA-256 audit receipt.

`POST /api/strategy/simulate` accepts a registered `templateId` and an optional non-negative `haltAfterFrame`. It does not accept arbitrary actions. The response always reports `transactionSubmissionEnabled: false`; this phase contains no RPC, wallet, signing, or transaction-submission path.

## Codex Cloud environment

1. Connect GitHub and select `deyoungjohn/spectra_app` in Codex Cloud.
2. Create an environment on `main`; choose Node 22. Set its setup script to `bash scripts/setup.sh` and maintenance script to `bash scripts/setup.sh` (or use automatic npm install). The script uses the committed lockfile.
3. The current demo needs **no secrets**. Optional ordinary variable: `NEXT_PUBLIC_APP_MODE=demo`. Keep `LIVE_TRADING=false` and `WEEKEND_PREMIUM_ENABLED=false`. These values are documented for future integrations; this preview does not read them to enable execution.
4. Agent internet access can remain off for this phase. Enable narrowly scoped access for future live API work only when required.
5. Review `docs/ROADMAP.md` before beginning the next delivery phase and run `npm run verify` before merging.

Cloud environment variables persist into the agent phase; Cloud secrets are setup-only. For live runtime services, put credentials in the hosting provider's runtime secret store. Do not commit `.env` or secrets to this repository. Set up dedicated test credentials only when a phase requires them.

## Status

Phases 1–3 provide typed server-side market and transfer adapters, paginated demo fixtures, provenance, explicit degraded states, a read-only screener, four-hour wallet-flow aggregation, and deterministic strategy simulation with audit receipts and a kill switch. Vendor-specific payload mappings, venue labels, and the source document's empirical findings still require live validation before production use.
