# After Hours — Launch Audit

**Date:** September 15, 2026
**Scope:** One consolidated view of what has shipped and what remains to take the app from a side project to a publicly released, paid product on the web and in the app stores, organised as a phased plan.
**Supersedes:** the two September 2026 audits (`launch-readiness-audit-2026-09.md` and `public-release-audit-2026-09.md`), now removed and folded into this file. Their finding-by-finding history remains in git.

> **Status:** ✅ done · ◐ partly done / deferred · ☐ open · 👤 owner task (not code)

---

## Where things stand (verified September 15, 2026)

The web app is in good shape. Phases 1 and 2 have shipped and are verified on the merged `main`. The product is a static Next.js 15 app on Vercel (`afterhoursgame.com`); the engine is now a pure, tested, DOM-free reducer, and the deck no longer ships on the home page. What stands between here and a paid launch is instrumentation (Phase 3), a real backend and paywall (Phase 4), and the app stores (Phase 5) — plus a handful of owner tasks that need no code.

| Check (on merged `main`) | Result |
|---|---|
| `npm test` (unit) | 107 passed |
| `npm run test:e2e` (browser) | 75 passed — full night of play + WCAG-AA contrast on every screen |
| `npm run typecheck`, `npm run lint` | clean |
| `npm run build` | 5 routes, all `○ Static`; first load ~134 kB on `/`, ~170 kB on `/game` |
| `npm run check:bundle` | home route deck-free (CI-enforced) |
| `docs/prompts.csv` | in sync — 932 prompts (Mild 147, Medium 311, Extreme 474) |

---

## Phase 1 — Stabilise production ✅ *(shipped; owner tasks remain)*

**Implemented**
- ✅ **Two engine bugs fixed, with tests.** A swipe-then-tap inside the fly-off window double-counted a turn; removing a player mid-game and undoing credited the wrong seat. Both are fixed — the turn tally is now keyed by player *name*, and the reducer (Phase 2) makes the double-apply structurally impossible. Guarded by unit and e2e regression tests.
- ✅ **Card 512 typo fixed.**
- ✅ **Dependabot tamed.** Major-version upgrades (Next, Tailwind, TypeScript, React) are held across the board and done deliberately one at a time; minor/patch churn is batched into one PR.
- ✅ **Deploy docs corrected.** `CLAUDE.md` states Vercel is production and lists the Sentry/site environment variables to set there. Sentry is wired in `next.config.ts` as opt-in — it no-ops without credentials, so local and CI builds are unchanged.

**Open**
- ☐ 👤 **Turn Sentry on in production.** Set `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SITE_URL`, `SENTRY_ORG`, `SENTRY_PROJECT` and the upload token in the Vercel project (token as a sensitive variable). Production has no monitoring until this is done.
- ☐ 👤 **Consolidate hosting.** Move to Vercel Pro (Hobby is non-commercial), then detach/delete the duplicate Firebase App Hosting copy of the *site*; Firebase stays for backend only. Remove `apphosting.yaml` / `.firebaserc` if Firebase Auth is not chosen in Phase 4. Two live deployments building from `main` is a webhook hazard once payments exist.
- ☐ 👤 **External uptime monitoring**, and confirm the first source-map bundle actually uploaded from a production deploy.
- ☐ 👤 **Decide repository visibility.** The deck is the product and the repo is public; making it private stops future copies, not past ones. Decide before charging.

---

## Phase 2 — Portable engine + separable deck ✅ *(shipped; some items deferred)*

**Implemented**
- ✅ **Game loop is a pure reducer** (`src/lib/game-engine.ts`), with pure helpers `pickNextPrompt` / `advanceTurnQueue` / `remapAfterRemoval` in `src/lib/game.ts` and `useSwipeCard` / `useCountdownTimer` / `useWakeLock` hooks. The screen only dispatches — the loop is unit-testable without a browser and DOM-free, so it ports cleanly to a native shell.
- ✅ **Deck off the home bundle.** Mode metadata moved to `src/lib/modes.ts`, which references no deck data; the module graph enforces the split and a `check:bundle` CI step fails the build if the deck reappears on `/`. Home first load dropped to ~134 kB.
- ✅ **Deck schema for what comes next.** Six optional `Prompt` fields, chief among them `pack` — the paywall's entitlement unit, read through a `packOf()` helper that defaults to the free `core` deck, so no existing card was edited. The rest (`props`, `minPlayers`, and the sober/couples-variant fields) are ready for later use.
- ✅ **Mild grown 89 → 147 cards (~16%)** — light dares, timed cards and general-audience questions — reaching a ~15 / 35 / 50 tier split by adding, not cutting. Deck total 874 → 932.

**Deferred (open)**
- ☐ **Per-mode dynamic deck import.** `/game` still loads the whole deck. This is really the Phase 4 seam — the point where paid tiers move server-side — so it lands there.
- ☐ **Scope-consistency pass** on the 85 player-scoped "Drink if you've ever…" cards, which read inconsistently against their room-scoped siblings. Decide once and tag consistently.
- ☐ **Product UI items:** hand-off screen, share card, per-card "never show this" / props filter, and a settings screen (see the backlog).

---

## Phase 3 — Instrument and learn ← **NEXT** *(≈1 week, then watch)*

Ship the free product, measure how it is actually played, and use that evidence to place the paywall. This is the deliberate gate before Phase 4.

- ☐ **Privacy-respecting analytics** (cookieless — Plausible ~$9/mo, or self-hosted Umami), with the **Privacy Policy updated in the same PR** — today it promises "no cookies / no server / no tracking", which analytics changes. This is the headline item and the input to the paywall decision.
- ☐ **Prompt feedback (👍/👎).** The cheapest way to learn which cards land; it becomes the curation signal for the first paid pack.
- ☐ **Fix the NHIE intensity signal.** "Never Have I Ever" is 61% Extreme cards but presents as spice 3 of 4. Either show spice 4 or offer a "Mild + Medium only" NHIE variant so the friendly-sounding mode isn't secretly an Extreme deck. *(The Mild half of the old deck-balance finding is done — see Phase 2.)*
- Then watch where groups drop off for a few weeks before committing to where the wall goes.

---

## Phase 4 — Accounts and the paywall *(≈4–6 weeks)*

The decision the rest of the roadmap hangs on. **Monetization shape (owner-confirmed):** Mild free; Medium in the free trial, then locked; Extreme and NHIE paid; a one-time unlock **plus** a cheaper subscription; paid packs (sober, couples, themed) on top — which is what the `pack` field is for.

- ☐ 👤 **Confirm the processor in writing.** Get Stripe eligibility confirmed against a description of this product and a deck sample, or name a fallback processor — Stripe's restricted-business terms bar mature content, and the reported failure mode is termination without warning.
- ☐ 👤 **Lawyer review** of Terms, Privacy, refund, subscription/auto-renewal and deletion language, before money changes hands.
- ☐ **Backend:** Supabase Auth + Postgres (or Clerk + Neon), an entitlements table, Stripe webhooks, **RevenueCat** as the cross-platform entitlement ledger, and account deletion/export.
- ☐ **Server-gated deck.** A route handler checks the entitlement and returns a mode's cards; the free tier stays a static/dynamic import; **the Phase 2 per-mode dynamic load lands here.** Nothing client-side is trusted — `localStorage` entitlement flags are UI convenience, never the gate.
- ☐ **Server-side age gating** as an account attribute (attestation date, any store age signal), checked server-side for paid decks. Pulled forward from "last" because of 2026 app-store age-assurance laws and Apple's Declared Age Range API.
- ☐ **Legal shipped in the same release:** refund policy, subscription/auto-renewal disclosure, account-deletion flow, and a data-request contact — plus rewriting the Privacy Policy claims that accounts and Stripe make false.
- ☐ **Infra for dynamic routes:** CSP additions for Stripe.js and the auth provider (with a browser-suite assertion — nothing tests the CSP today), dynamic routes excluded from the CDN cache, and `minInstances: 1` (or the Vercel equivalent) on the webhook route.
- ☐ **Deck content review** against payment-processor and app-store content policies before charging.
- ☐ **First paid pack**, so there is something to buy.

---

## Phase 5 — App stores *(≈4–6 weeks after Phase 4)*

"Native" means a **Capacitor** wrap of the existing React app, not a rewrite — Apple approves well-built Capacitor apps and already lists this genre at 18+. The engine refactor that makes this clean is already done (Phase 2).

- ☐ **Capacitor shell** with native plugins: haptics, wake lock, share, and RevenueCat over StoreKit / Play Billing, plus Declared Age Range and Play Age Signals. It must behave like an app (native feel, no browser chrome, offline start, native purchase flow) to pass Apple's 4.2.
- ☐ **18+ store listing** with the required content descriptors, screenshots, and subscription copy; a review-ready build. Expo/React Native only as a fallback if Capacitor is rejected.

---

## Product backlog *(unphased — slot in where each fits)*

| Feature | Why | Effort | Tier |
|---|---|---|---|
| Hand-off screen ("Pass to Sam", tap to reveal) | The biggest remaining loop gap | S | Free |
| Share a card / Last Call recap as an image (Web Share API) | The product spreads in group chats; no share surface today | M | Free (growth) |
| Per-card "never show this" + props filter | Cheap; answers the most common real complaint | S | Free |
| Settings screen (haptics, sound, reduced motion, drinking on/off) | No home for these; prerequisite for sound | S | Free |
| Sober mode (drink outs become dares/points) | Widens the audience; uses `soberAlt` | M | Free |
| Session length ("we have 45 minutes") | Small, useful framing | S | Free |
| PWA install prompt + offline shell | Manifest exists; nothing surfaces install | S | Free |
| Sound (off by default) | Long-standing gap | M | Free |
| Couples / date-night mode | Large adjacent market; uses the schema | M | Paid pack |
| Custom prompts / house rules | Inside jokes drive repeat play; device-local | M | Paid |
| Localisation | 932 English prompts; not near-term | L | — |

---

## What's working well

- The static build, security headers, input-validation boundary and saved-game handling are sound, and verified on the live domain.
- `src/lib` is exactly the shape a native port needs: pure functions, no DOM, well tested.
- Mobile craft is real: safe areas, `100dvh`, 44 px targets, wake lock, haptics, reduced motion, and a contrast gate enforced in CI.
- Apple already lists this genre, so the store path is a wrapping project on code that already behaves like an app — not a rewrite.
