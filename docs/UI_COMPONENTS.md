# UI component provenance

Component source is vendored so the interface does not depend on a third-party runtime or CDN.

> Environment note: the official sites and npm registry returned HTTP 401/403 through the available proxy. The URLs below are the requested official sources, but their current catalog and license text could not be independently retrieved in this environment. Confirm both before merging.

| Library | Official source requested | Candidate | Expected dependencies | License status | Decision |
| --- | --- | --- | --- | --- | --- |
| beUI | https://beui.dev | Animated text treatments | Varies by component; animation options may add Motion | Requires confirmation | Not installed: additional motion was unnecessary for a dense financial table. |
| Spectrum UI | https://spectrumui.dev | Animated status treatment | React and CSS | Requires confirmation | A small local implementation is installed at `src/components/spectrum/animated-status.tsx`; replace it from the official registry after access is restored. |

The local component uses a single decorative opacity/scale animation. `prefers-reduced-motion: reduce` disables that animation. Data values themselves never animate, which keeps prices and provenance stable and readable.
