# Spectra delivery plan for Codex Cloud

The original architecture is in [Spectra.md](Spectra.md). Its empirical AAPL finding is a starting hypothesis tied to a small, open-market sample, not proof for all tickers or market regimes. Revalidate with recorded fixtures before production use. The sample UI is illustrative.

## 0. Cloud foundation (this commit)
- Next.js App Router, a clearly labeled demo screener, fixed-point normalization, `/api/health`, CI, deterministic setup and verification.
- Acceptance: clean checkout; `npm ci && npm run verify`; page displays demo warning and no execution controls; health endpoint reports `execution: false`.

## 1. Data provenance and market intelligence
- Define typed source adapters and fixtures for RWA quotes, market status, and independent TradFi prices. Validate schema, ratio > 0, ticker and chain/address mapping, timestamps and stale thresholds. Cache with bounded age and visible degraded states.
- Add a server-side live adapter behind `MARKET_DATA_MODE=live`; retain demo mode for offline tests. Make no client-side calls to credentialed sources.
- Implement filters, sorting, per-share spread, liquidity and source/time labels. Test ratio drift, missing anchors, closed/halted markets, stale data, and API failure.
- Acceptance: read-only live-data journey works with configured sources; when data is absent or stale, UI says so and cannot suggest an actionable signal.

## 2. Flow Radar
- Ingest indexed BSC transfers with pagination and token identity checks. Separate transfers from inferred buys/sells; label confidence, provenance and gaps. Add wallet aggregation and a 4-hour view.
- Acceptance: known fixture transactions reconcile exactly; unavailable indexer is explicit in the UI.

## 3. Strategy Forge simulation
- Implement a versioned, typed rule DSL and deterministic simulator using recorded inputs. Add templates, policy limits, conflict resolution, audit receipts and kill switch. Keep NLP optional and require user review of parsed rules.
- Acceptance: a user can select a template, replay a fixture, inspect each decision and receipt, and halt a simulation. No real wallet transaction occurs.

## 4. Testnet integration
- Confirm current BNB Agent Studio, wallet, b402 and chain interfaces against primary vendor docs before integration. Verify contract access control, signatures, nonce replay protection, policy enforcement and failure modes. No shadow payment may be represented as a settled real payment.
- Acceptance: testnet transaction receipts match simulator decisions; expired/replayed plans and kill switch prevent submission; independent CI and security review pass.

## 5. Mainnet gate (separate, explicit decision)
- Capture open, closed/weekend, halted, and corporate-action data for supported assets. Document source agreements, costs, liquidity, price tolerance calibration and independent TradFi quality. Exercise the kill switch and key rotation. Audit contracts and wallet permissions. Verify production hosting secrets, monitoring, rate limits and incident response.
- Only then consider enabling `WEEKEND_PREMIUM_ENABLED` or `LIVE_TRADING` in a dedicated deployment. Neither flag alone may bypass policy checks.

## Cloud task sequence
Ask Codex for one phase at a time. Suggested first task: “Implement phase 1 of `docs/ROADMAP.md`. Preserve demo mode, build typed server-side adapters with recorded fixtures, and demonstrate stale/error states. Run `npm run verify` and report live-feed requirements separately.”
