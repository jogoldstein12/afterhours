# After Hours — working notes

An explicit pass-the-phone party game for adults. Next.js 15 App Router, React
18, Tailwind + shadcn/ui. Production (afterhoursgame.com) is served by
**Vercel**; a second, now-duplicate copy still runs on Firebase App Hosting and
is being retired. Firebase itself is kept for the backend (auth, database) that
the paywall will need. See "Where it deploys".

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

## Where it deploys

**Production is Vercel.** afterhoursgame.com is served by a Vercel project that
builds from `main`, so a merge to `main` is a release. This is the deploy that
matters; everything an end user hits goes here.

The environment variables that turn on error monitoring and source-map upload
live only in `apphosting.yaml`, which **Vercel does not read** — so as things
stand production has no Sentry. To fix that, set these in the Vercel project's
Environment Variables (values in `apphosting.yaml`):

- `NEXT_PUBLIC_SITE_URL` — `https://afterhoursgame.com` (canonical OG/Twitter URLs)
- `NEXT_PUBLIC_SENTRY_DSN` — the public DSN; without it monitoring stays off
- `SENTRY_ORG`, `SENTRY_PROJECT` — both public slugs, needed for source-map upload
- `SENTRY_AUTH_TOKEN` — a real secret (write access to Sentry); mark it as such
  in Vercel. All three of ORG/PROJECT/TOKEN must be present or the upload is
  skipped and the build is unchanged.

**Firebase App Hosting** still serves an identical second copy of the site at
`https://studio--glowup-after-hours.us-central1.hosted.app` — backend `studio`
in project **`glowup-after-hours`** (`us-central1`; `.firebaserc` pins it, so
`firebase` commands need no `-P`). It is the old deploy path and is slated to be
turned off, leaving Vercel as the only site host and Firebase for backend
services only. While it exists it also builds from `main` on merge, so watch for
the two hosts drifting. A few facts that have bitten before:

- There is a second Firebase project, **After Hours** (`after-hours-97f19`),
  that looks like the obvious match and is not. Nothing deploys from it.
- `x-fah-adapter` in the response is **not** the Next.js version — it is
  Firebase's `@apphosting/adapter-nextjs` package, and it reads `nextjs-14.0.21`
  on a Next 15 build. To tell one deploy apart from another, look at a header
  the app itself sets (`content-security-policy`) or at `/robots.txt`; the
  backend id is in `cache-tag: <project number>:<backend>`.
- `apphosting.yaml` is read by that backend at build time and by nothing else
  (Vercel included), so a variable added there does nothing on Vercel and
  nothing at all until the backend redeploys. Secrets it references
  (`SENTRY_AUTH_TOKEN`) must exist in the same project and be granted to the
  backend, or the build falls back to its no-credentials path.

## Prompt feedback (opt-in)

The 👍/👎 on a card is two things. **Hiding** (👎) is device-local: the id goes
into `afterhours.hidden` in `localStorage` (via `session.ts`), and the reducer
excludes hidden cards from every deal. That always works and sends nothing.

**Rating** (the anonymous curation signal) is opt-in exactly like Sentry, and
**off by default**. `src/lib/feedback.ts` posts a single atomic increment to a
per-card counter at `promptStats/{id}` in Firestore, over the REST API (no SDK
is bundled, so the home-page budget is untouched). It runs only when both
`NEXT_PUBLIC_FIREBASE_PROJECT_ID` and `NEXT_PUBLIC_FIREBASE_API_KEY` are set;
with neither, `feedbackEnabled()` is false, the 👍 is hidden, and no request is
made. The CSP already allows `https://firestore.googleapis.com` (see
`next.config.ts`), for the same reason Sentry's origin is allowed unconditionally.
To turn it on: set both env vars in Vercel, and deploy the rules with
`firebase deploy --only firestore:rules` (`firestore.rules` allows only a +1
increment to `up`/`down` on `promptStats`, denies everything else, and denies
client reads). Read the counters back from the Firebase console, or export them
and join to `docs/prompts.csv` by id. The write carries only the card number and
the direction — no name, account, or device id — so the Privacy Policy discloses
it conditionally under "Card ratings".

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
- **`restoredTextRef` is tagged with a prompt id, not a one-shot flag.**
  Hydration lands its state over several renders, so the text-processing effect
  runs more than once — and it runs the first time before `currentPrompt` is
  set. A flag consumed on the first pass let a later pass re-derive the text
  and re-roll `{{randomOtherPlayer}}`, so a mid-card refresh changed who the
  card was pointing at (about half the time with four players). Two rules keep
  it right: match the stored text to the card by id, and never clear the ref
  while `currentPrompt` is still null. `e2e/session.js` guards this.
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
  left the query string, and it still covers a legacy link. Keep it lazy: the
  SDK is ~121 KB gzipped against a 148 KB first load, so eager initialisation
  (what `npx @sentry/wizard` installs by default) would roughly double what
  every visitor downloads. **Do not run the wizard** — it also wraps
  `next.config.ts`, adds server and edge configs with no server to instrument,
  and offers a tunnel route that would be this app's only non-static route.
- **Source map upload is opt-in and no-ops without credentials.**
  `next.config.ts` wraps the config in `withSentryConfig` only when
  `SENTRY_ORG`, `SENTRY_PROJECT` and `SENTRY_AUTH_TOKEN` are all set, so a
  local or CI build produces exactly the output it did before. The token is a
  real secret (unlike the DSN) and lives in Secret Manager. A failed upload
  warns and lets the deploy through rather than blocking a release.

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

`docs/launch-audit-2026-09.md` is the current plan: one consolidated,
phased audit of what has shipped and what remains, from stabilisation through
the paywall and the app stores. It supersedes the two earlier September audits
(`launch-readiness-audit-2026-09.md` and `public-release-audit-2026-09.md`),
whose finding-by-finding history stays in git. Phases 1 (stabilise) and 2
(portable engine + separable deck) are shipped; Phase 3 (analytics + Privacy
Policy, prompt feedback, the NHIE signal) is next; Phase 4 is accounts and the
paywall; Phase 5 is the app stores. Some owner tasks (Sentry in Vercel,
hosting consolidation, uptime, repo visibility, processor confirmation, legal
review) carry across the phases.
