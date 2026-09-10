# After Hours — working notes

An explicit pass-the-phone party game for adults. Next.js 15 App Router, React
18, Tailwind + shadcn/ui, deployed to Firebase App Hosting.

## Commands

```bash
npm run dev         # dev server on :9002
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run export:deck # regenerate docs/prompts.csv from src/lib/prompts.ts
npm run build:icons # regenerate every app icon from assets/afterhours-icon.png
```

`npm run dev` and `npm run build` share `.next/`, so do not run a build while a
dev server is up — the build pulls the manifests out from under it and the dev
server starts 404ing until it is restarted.

## Things that will bite you

- **Every route is statically prerendered** (`○ Static` on all five). Calling
  `useSearchParams()` during render silently opts a route out of that and ships
  an empty body to crawlers. Read the query string inside an effect instead.
  Check `.next/server/app/*.html` after any change to a page's data flow.
- **The CSP has no nonce** (`next.config.ts`). Nonces force dynamic rendering,
  which would cost the static prerendering above, so `script-src` keeps
  `'unsafe-inline'`. Do not "fix" this without deciding to give up static.
- **`AgeGate` wraps every route** in `src/app/layout.tsx`. It keeps children
  mounted under `display: none` rather than returning null, so pages still
  prerender. `/terms` and `/privacy` bypass it via `ALWAYS_READABLE` — the gate
  asks you to agree to those documents, so gating them would be circular.
- **The play URL carries player names in its query string**, which is why
  `/game` gets `Referrer-Policy: no-referrer` and is disallowed in
  `robots.txt`.
- **Sentry is behind a dynamic import** in `src/lib/monitoring.ts` and only
  loads when `NEXT_PUBLIC_SENTRY_DSN` is set. `beforeSend` strips everything
  after `?` or `#` from URLs, because that is where the player names are.

## Icons

`assets/afterhours-icon.png` is the source art and is deliberately *not* in
`public/` — nothing should serve the 1.4MB original. `npm run build:icons`
derives everything from it: the PWA icons, an Android maskable variant, the
apple-touch icon, and `src/app/favicon.ico`. The reasoning behind each crop is
in `tools/build-icons.js`; the short version is that iOS masks and flattens on
its own, Android crops to a circle, and the wordmark is unreadable below about
64px so the favicon uses the glass alone.

## Deck conventions (`src/lib/prompts.ts`)

- Prompts have a stable numeric `id`. **Never renumber**; saved state and the
  CSV export key off these.
- `docs/prompts.csv` is a generated view of the deck and CI fails if it drifts,
  so run `npm run export:deck` after any deck edit.
- `{{randomOtherPlayer}}` is substituted at draw time.
- Anything directing physical contact should offer a way out — the house
  pattern is `— or take 3 drinks` for a solo dare, and explicit two-way
  language (`if either of you passes`) when a second player is involved.
- A prompt starting with "Never have I ever" is picked up by `NHIE_PATTERN` and
  appears in the Never Have I Ever mode regardless of its tier.

## Open work

`docs/public-release-audit-2026-09.md` is the standing list of what is left
before and after public launch, with a resolution log at the top.
