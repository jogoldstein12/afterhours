# After Hours — working notes

An explicit pass-the-phone party game for adults. Next.js 15 App Router, React
18, Tailwind + shadcn/ui, deployed to Firebase App Hosting.

## Commands

```bash
npm run dev         # dev server on :9002
npm run build       # production build
npm test            # unit tests (vitest), under a second
npm run test:watch  # the same, in watch mode
npm run test:e2e    # browser suite — needs a build and Playwright, ~2 minutes
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run export:deck # regenerate docs/prompts.csv from src/lib/prompts.ts
npm run build:icons # regenerate every app icon from assets/afterhours-icon.png
```

`npm run dev` and `npm run build` share `.next/`, so do not run a build while a
dev server is up — the build pulls the manifests out from under it and the dev
server starts 404ing until it is restarted. `npm run test:e2e` runs a build's
output, so the same applies to it.

## When to run which tests

The suite is in two halves on purpose, because they cost very different things.

- **`npm test` is free.** Pure logic, no DOM, no browser, under a second. Run it
  as often as you like; CI runs it on every push. If you have changed anything
  under `src/lib/`, run it before you say you are done.
- **`npm run test:e2e` is not.** It needs a production build and a real browser
  and takes a couple of minutes. **Do not run it after every small change** — a
  copy tweak, a spacing fix, a one-line guard. Run it when a change is
  structural or could plausibly break something you are not looking at:
  - the game loop, the saved game, or routing
  - anything that changes colours, opacity or the theme tokens (it checks WCAG
    AA contrast on every screen, in every mode)
  - a dependency or Next upgrade
  - before opening or updating a PR that touches any of the above

  It is deliberately not in CI, and Playwright is deliberately not a dependency
  — `npm run test:e2e` prints the one-line install if it is missing.

Adding a `vitest` dependency once tripped an npm 10.9.7 bug
(`Cannot read properties of null (reading 'edgesOut')`) while resolving
vitest's optional peers. `npm install --legacy-peer-deps` gets past it once;
plain `npm install` and `npm ci` work normally afterwards, from the lockfile.

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
- **A game lives in `localStorage`, not in the URL.** `/game` takes no query
  string. `src/lib/session.ts` is the only reader and writer of the saved game,
  and everything it returns has been validated — storage is editable by hand,
  shared with older builds, and outlives deck edits, so a record read back is
  treated as untrusted input. A legacy `/game?player=...` link is honoured for
  one read and then scrubbed from the address bar; that path is why `/game`
  keeps `Referrer-Policy: no-referrer` and stays disallowed in `robots.txt`.
- **Player names go through `src/lib/roster.ts`.** Every entry point — both name
  inputs, the storage reader, the legacy query reader — calls
  `normalisePlayerName` / `normaliseRoster`. That is what bounds name length,
  strips bidi and zero-width characters, enforces `MAX_PLAYERS`, and rejects
  duplicates (the turn tally is keyed by name, so a second "Sam" would share one
  count). Do not add a fourth entry point that skips it.
- **Restoring a game must claim `deckLevelRef` before the deck effect runs**, or
  the restore reads as a mid-game level change and wipes the progress it just
  loaded. If the saved card's id no longer resolves, a recovery effect deals a
  replacement rather than leaving an empty card.
- **Contrast is enforced, not eyeballed.** `e2e/contrast.js` composites what
  the browser actually computed — translucent white over a translucent panel
  over the near-black page — and fails any text run under WCAG AA. Text on a
  solid brand fill takes the app's near-black ink (`--primary-foreground` and
  friends), because white on the neon violet is only 3.7:1; the palette itself
  is never darkened, so the glows keep their colour. `--destructive-bright`
  exists because `--destructive` is tuned for white-on-red and is too dark for
  small red text on a dark tint.
- **Sentry is behind a dynamic import** in `src/lib/monitoring.ts` and only
  loads when `NEXT_PUBLIC_SENTRY_DSN` is set. `beforeSend` still strips
  everything after `?` or `#` from URLs — belt and braces now that names have
  left the query string, and it still covers a legacy link.

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
- `scope` decides who a card is talking to. Absent means `'player'` — the game
  screen prepends the current player's name. `scope: 'room'` is called out to
  everybody and is never personalised. Mark a new prompt `'room'` if it reads
  wrong with one name in front of it; NHIE cards and anything whose subject is
  the group always are.
- The opt-out ladder is driven by what the card asks, not by its tier. Four
  rungs: `— or take a drink` is the default (say, show, answer, confess),
  `— or take 2 drinks` for physical contact, `— or take 3 drinks` for oral or
  clothing-removal play, and `— or take a shot` at the top for nudity,
  genital or underwear contact, a simulated or real sex act, and sustained
  mouth-to-mouth. The two body-shot cards (370, 1024) sit on the shot rung
  against that rule, because "or take a shot yourself" is the joke.
- Prompts that ask you to drink a counted amount for something you have done
  are deliberately uncapped — the number is the punchline.
- Anything directing physical contact should offer a way out — the house
  pattern is `— or take 3 drinks` for a solo dare, and explicit two-way
  language (`if either of you passes`) when a second player is involved.
- A prompt starting with "Never have I ever" is picked up by `NHIE_PATTERN` and
  appears in the Never Have I Ever mode regardless of its tier.

## Open work

`docs/public-release-audit-2026-09.md` is the standing list of what is left
before and after public launch, with a resolution log at the top.
