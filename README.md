# Spectra

A read-only foundation for a tokenized equities intelligence terminal on BNB Smart Chain. See [the product architecture](docs/Spectra.md) and [the phased delivery plan](docs/ROADMAP.md).

## Run

Node 22 recommended. From a clean checkout:

```bash
bash scripts/setup.sh
npm run dev
```

Open `http://localhost:3000`. The screen displays **illustrative demo data**, not market quotes. No wallet, database, external data feed, payment, or trading execution is connected.

```bash
npm run verify
```

`/api/health` reports demo mode and disabled execution. CI runs the same checks on pushes and pull requests.

## Codex Cloud environment

1. Connect GitHub and select `deyoungjohn/spectra_app` in Codex Cloud.
2. Create an environment on `main`; choose Node 22. Set its setup script to `bash scripts/setup.sh` and maintenance script to `bash scripts/setup.sh` (or use automatic npm install). The script uses the committed lockfile.
3. The current demo needs **no secrets**. Optional ordinary variable: `NEXT_PUBLIC_APP_MODE=demo`. Keep `LIVE_TRADING=false` and `WEEKEND_PREMIUM_ENABLED=false`. These values are documented for future integrations; this preview does not read them to enable execution.
4. Agent internet access can remain off for this phase. Enable narrowly scoped access for future live API work only when required.
5. Start with the phase 1 task in `docs/ROADMAP.md`; review its diff and `npm run verify` output before merging.

Cloud environment variables persist into the agent phase; Cloud secrets are setup-only. For live runtime services, put credentials in the hosting provider's runtime secret store. Do not commit `.env` or secrets to this repository. Set up dedicated test credentials only when a phase requires them.

## Status

The prototype proves the repository can install, test and build cleanly. The full architecture is a multi-phase project, and the source document's sample APIs, vendor integrations and market findings require live validation before production use.
