# UI component provenance

Interactive primitives are installed from npm and composed locally so the interface does not depend on a runtime CDN.

> Environment note: the official beUI and Spectrum UI sites still return HTTP 403 through the available proxy. The overhaul therefore uses the installed Base UI React package directly for interactive behavior rather than copying unverified source from inaccessible registries.

| Library | Official source requested | Candidate | Expected dependencies | License status | Decision |
| --- | --- | --- | --- | --- | --- |
| Base UI | https://base-ui.com | Button, Input, Select | `@base-ui/react` | MIT | Installed directly. Strategy controls use Base UI Button through the generated `ui/button` wrapper; market filters use Base UI Input and Select primitives. |
| Spectrum UI | https://spectrumui.dev | Animated status treatment | React and CSS | Requires confirmation | Existing local status treatment retained; the inaccessible registry was not represented as an upstream component. |

The status component uses a single decorative opacity/scale animation. `prefers-reduced-motion: reduce` disables it. Data values never animate, which keeps prices and provenance stable and readable.
