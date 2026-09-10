# After Hours — Launch Readiness Audit

**Date:** September 10, 2026
**Scope:** A review of `docs/public-release-audit-2026-09.md` (the standing spec) against the repository and the live site, plus a full audit of the code, security, infrastructure, legal surface, deck, and product, with the goal of taking the app from a side project to a publicly released, paid product on the web and in the app stores.
**Method:** Clean `npm ci`; `npm audit`, typecheck, lint, the unit suite and a production build run and passing; the build manifest and emitted chunks inspected; the live site at `afterhoursgame.com` and the Firebase backend probed from outside; the Vercel project and GitHub state read through their APIs; five focused review passes (engine code, security/infra/legal, deck content, UX/features, and payment/app-store policy research), each spot-checked against the source before anything was written here.
**Relationship to prior audits:** `docs/public-release-audit-2026-09.md` (Sept 9–10) is the standing list and is not rewritten here. This document corrects it where it has drifted, and adds what it does not cover: the mobile and payment strategy, the engine bugs, the deck's remaining gaps, and the feature roadmap.

> **Status legend:** 🔴 Blocker · 🟠 High · 🟡 Medium · ⚪ Polish

---

## Verdict

The web app is in good shape and the September audit was largely right. Verified today: zero advisories, clean typecheck and lint, 78 unit tests passing, a clean static build, and the security headers, age gate, legal pages and `robots.txt` all serving on the public domain.

**Four things have changed or were missed, and each is bigger than anything still open in the spec.**

1. **Production moved and the repository does not know.** `afterhoursgame.com` is served by a Vercel project created today on the **Hobby** plan. Every document in the repo, `CLAUDE.md` included, says Firebase App Hosting, and that backend is *also* still live at its `hosted.app` URL. Two deployments build from `main`. The Vercel one — the one people reach — has **no Sentry DSN**, so monitoring is off exactly where it matters. Vercel's Hobby plan is for non-commercial use, which a paywall ends.
2. **The payment plan rests on an unverified claim.** The spec marks "Stripe confirmed". Stripe's restricted-businesses list bars mature content "designed for the purpose of sexual gratification" and explicitly includes **literature**, so the absence of imagery does not exempt an explicit dare deck. If that confirmation was not obtained in writing from Stripe against a description of this product, treat it as open. In parallel, both app stores require their own billing for in-app unlocks regardless of what the web uses.
3. **The app does not need to be rewritten in Swift.** Apple approves React Native and well-built Capacitor apps and lists several explicit 18+ party-game apps today. What Apple rejects is a thin web wrapper. The mobile plan is therefore a wrapping-and-hardening project on the existing React code, not a rewrite.
4. **Two real engine bugs and a consent gap the spec calls closed.** A swipe followed by a tap inside a 150 ms window double-counts a turn; removing a player mid-game and then undoing attributes the turn to the wrong person. And five contact cards carry no opt-out at all, so the scorecard's "every prompt carries an out" is not true.

**Scorecard** — what the spec claims today versus what this audit found.

| Area | Spec says | Found | What holds it back |
|---|---|---|---|
| Security posture | B+ | B+ | Accurate. CSP, headers and validation are sound; the age gate is client-side by design. |
| Legal / compliance | B | B− | Documents are accurate *for today's app* and unreviewed. Every "no accounts / no cookies / no server" claim becomes false the day the paywall ships, and there is no refund, subscription or deletion language yet. |
| Content safety | A− | B | Five contact cards have no out; two-way opt-out language exists on 2 of 110 contact cards against the house rule; 44 cards use "finish your drink", which is off the ladder; four cards are processor/store flags. |
| Infrastructure | B− | C | Two live deployments, docs describe the wrong one, monitoring off on the real one, Hobby plan, no preview deploys, no staging. |
| Architecture (monetisation) | D | D | Unchanged. The deck still ships to every visitor on `/`. |
| Code correctness | A− | B+ | Two verified High bugs in the play screen; the pure logic in `src/lib` is solid and well tested. |
| Design / UX | A− | B+ | The hand-off screen (R1 of the August audit) was never built; there is no share surface; the NHIE spice signal misleads. |
| Repo hygiene | A− | B | Public repo carries the product; five unreviewed major-version Dependabot PRs are open; two stray files at the root. |

---

## Part 1 — Review of the spec

The spec is well reasoned and most of it has shipped and been verified. These are the places it is now wrong, stale, or silent.

### 1.1 🔴 The deployment story is stale

The spec's deployment gate (§0.6) and `CLAUDE.md` both describe project `glowup-after-hours`, backend `studio`. Verified today from outside:

| | `afterhoursgame.com` | `studio--glowup-after-hours…hosted.app` |
|---|---|---|
| Served by | Vercel (`server: Vercel`, `x-vercel-cache`) | Firebase App Hosting (`cache-tag: 885949399310:studio`) |
| Build | Current `main` (CSP, RTA label, Terms/Privacy links, `Disallow: /game`) | Current `main` |
| Sentry DSN in bundle | **absent** | present |
| Plan | Hobby, created Sept 10 2026, Node 24 | App Hosting, `maxInstances: 10` |

`apphosting.yaml` is read only by the Firebase backend, so its `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SITE_URL` and Sentry upload credentials do not exist on Vercel. The spec's §2.4 "live and reporting" is true for the URL nobody uses and false for the domain.

**Correction:** pick one host (Part 4 recommends which), delete the other, and rewrite `CLAUDE.md`'s "Where it deploys" section. Until then, every merge to `main` is two releases.

### 1.2 🔴 "Stripe confirmed" needs a source

§2.2 warned that Stripe restricts sexually explicit material and said to confirm eligibility before building. Phase 4 item 19 then marks it "confirmed — Stripe, September 10 2026" with no record of how. Stripe's published list covers "pornography and other mature audience content (including literature, imagery, and other media) designed for the purpose of sexual gratification". A party game is entertainment rather than gratification, and that argument may well hold, but it is Stripe's call, made at underwriting or later at a risk review, and the reported pattern for creators on the wrong side of it is termination without warning and funds held. See Part 6.

**Correction:** either attach the written confirmation (a support ticket referencing the product description and a sample of the Extreme deck) or reopen item 19 with a fallback processor named.

### 1.3 🟠 "Every prompt carries an out" is not true

§0.4 lists 21 no-out contact prompts and the resolution log says all now carry an out. The deck today still has contact cards with none:

| id | Tier | Text |
|---|---|---|
| 195 | Medium | Hold {{randomOtherPlayer}}'s face in your hands and stare into their eyes for 30 seconds — first to laugh drinks. |
| 437 | Extreme | Get blindfolded and allow {{randomOtherPlayer}} to touch you wherever they want for 15 seconds. |
| 712 | Medium | Show {{randomOtherPlayer}} your signature move for turning a hug into something more. |
| 807 | Extreme | Take a body shot off {{randomOtherPlayer}} from a spot they choose below the collarbone. |
| 840 | Extreme | Let {{randomOtherPlayer}} choose: strip one item, or sit on their lap for the rest of the game. |

The unit test that guards the ladder checks that *when* a card has an opt-out it is on a valid rung; it does not check that contact cards have one. Separately, `CLAUDE.md` says two-way language ("if either of you passes") is the pattern when a second player is involved, and that phrasing appears on 2 of the 110 contact cards. The Skip button is the real safety net, and it is a good one, but the deck does not match its own documented rule.

### 1.4 🟠 §2.1 is still open, and it is verified

The spec deferred the deck split to Phase 4. Confirmed on today's build: chunk `141-*.js` holds the full deck (104 KB raw, about 24 KB gzipped) and the app build manifest lists it under `/page`, the setup screen, because `home-screen.tsx` imports `GAME_MODES` from the same module as `PROMPTS`. This is the prerequisite for the paywall and it is also a free performance win, so it belongs at the front of the next phase rather than the back.

### 1.5 🟡 Open items the spec understates

- **§1.6 deck balance** is worse than "thin". Mild has 89 cards and zero physical or ladder cards, so it is a different game, not a milder one. NHIE draws 64% Extreme while showing spice 3 of 4.
- **§0.4's flagged prompts** 257 (redistributing someone's nudes) and 1150 (showing your phone to the group) are still in the deck, as are 226 and 1139 (handing over your phone), 490 (golden shower) and 170 (drugs tonight, tagged Mild). Part 5 lists them.
- **Phase 4 ordering.** The spec puts server-side age gating last, after the backend. The 2026 app-store age-assurance laws (Texas, Utah, Louisiana) and Apple's Declared Age Range API make age handling part of the accounts design, not a follow-up.
- **The Dependabot config** excludes React majors but nothing else; five major-version PRs are open right now (Next 16, Tailwind 4, TypeScript 7, lucide 1.x, `@types/node` 26). Each is a project, not a merge.

### 1.6 What the spec does not cover at all

Mobile and app-store strategy; in-app purchase rules; a cross-platform entitlement model; the hosting decision; product analytics choice; subscription, refund and deletion terms; the engine bugs in Part 3; the 44 "finish your drink" cards; the 85 inconsistently scoped "Drink if" cards; and the feature roadmap. Those are Parts 3–7.

---

## Part 2 — State of production, verified today

| Check | Result |
|---|---|
| `npm audit --audit-level=high` | 0 vulnerabilities |
| `npm run typecheck`, `npm run lint` | clean |
| `npm test` | 78 passed |
| `npm run build` | 5 routes, all `○ Static`; first load 155 kB on `/`, 168 kB on `/game` |
| `docs/prompts.csv` | in sync |
| Live domain headers | CSP, HSTS, `X-Frame-Options`, nosniff, Referrer-Policy present |
| Live `robots.txt` | `Disallow: /game` |
| Live `<head>` | `rating: adult`, RTA label, OG/Twitter cards, `og:url` = `https://afterhoursgame.com` |
| GitHub | repo **public**; 0 issues; 5 open Dependabot major bumps |
| Git history | no credentials found (Stripe, Google, AWS, private-key patterns); `.env*` ignored |

---

## Part 3 — Code audit

The pure logic in `src/lib/` (deck filter, shuffle, duration parser, renderer, roster normaliser, saved-game validator) is clean, documented and tested. The findings are all in the 1,073-line play screen, `src/app/game/page.tsx`.

### 3.1 🟠 Swipe and tap race, double-counting a turn

`endDrag` (`page.tsx:591-599`) marks the gesture busy and schedules `handleNextPlayer` on a 150 ms timeout so the fly-off animation can finish. `busy` only blocks a *second swipe*. The dock's Next, Skip and Undo buttons (`page.tsx:902-912`) stay enabled, and a tap inside that window runs the same closure a second time with the same `currentPrompt`, `currentPlayerIndex` and `usedPromptIds`:

- the outgoing player's tally increments twice (functional updater, so both apply),
- two identical history entries are pushed,
- `selectNewPrompt` runs twice from the same `usedPromptIds`, so one dealt card is lost or repeated.

A single Undo repairs half of it. Flick-then-tap is a natural gesture on a phone being passed around. The same race exists for swipe-back plus Undo. No test covers it.

**Fix:** a single `phase: 'idle' | 'transitioning'` flag checked by every advance handler, or (better) the reducer in 3.4, which makes the double-apply structurally impossible.

### 3.2 🟠 Undo after removing a player blames the wrong person

History entries store a seat number (`playerIndex`), not an identity. `handleRemovePlayer` (`page.tsx:624-636`) reindexes `players` and `upcomingTurns` but never touches `history`. Undo then does `players[Math.min(last.playerIndex, players.length - 1)]` (`page.tsx:503`), which is whoever now sits in that seat: their tally is decremented, the turn is handed to them, and the end-of-night MVP is wrong. The saved-game validator can only check that the index is in range, not that it still means the same person.

**Fix:** store the player *name* in history (names are already unique per `roster.ts`), and drop or remap entries on removal. Add a test: remove player, undo, assert attribution.

### 3.3 🟡 Smaller correctness notes

- The persistence effect writes the record once with an empty `processedPromptText` during hydration before the restore effect fills it (`page.tsx:231-327`). Two synchronous writes where one was intended; not user-visible, but a fragile invariant.
- `handleRemovePlayer` picks `prev % newLength` as the next player without consulting `upcomingTurns`, so the queue and the current seat can disagree for one turn. Judgement call.
- `handleNextPlayer` and `handleSkip` duplicate the push-history / mark-used / deal sequence and differ only in tally and rotation; they will drift.

### 3.4 🟡 Design: the play screen owns four unrelated concerns

Eighteen `useState`s and five refs cover the game state, the countdown, the swipe gesture and dialog chrome in one component. A concrete decomposition, in order of value:

| Extract | Owns | Why |
|---|---|---|
| `useGameEngine()` as a `useReducer` | players, mode, seat, prompt, text, deck, used ids, ended, queue, history, tally; actions `RESTORE / NEXT / SKIP / UNDO / RESTART / SET_MODE / ADD / REMOVE` | One transition per action closes 3.1 and 3.2 by construction and makes the whole loop unit-testable without a browser |
| `useSwipeCard({ onNext, onBack, canBack })` | card and peek refs, gesture state, fly timeout, imperative paint | Exposes `busy` so the dock can disable itself |
| `useCountdownTimer(prompt)` plus a `<TimerControl>` | `timeLeft`, `timerRunning`, `startTimer` | Stops the once-a-second tick re-rendering the whole page |
| `useWakeLock()`, `useSavedGameSync()` | as named | Generic and reusable |
| Into `src/lib/game.ts` | `pickNextPrompt(deck, used)`, `advanceTurnQueue(queue, count, current)`, seat remapping on add/remove | Pure today, tested only through the UI |

This is also the refactor that makes the engine portable to a native shell (Part 6): a reducer plus pure helpers has no DOM in it.

### 3.5 🟡 Test gaps

Undo after a roster edit; the swipe gesture itself (threshold, flick, `busy`); the countdown to zero and re-arm; the finale's "Turn It Up" and "Run It Back"; hitting `MAX_PLAYERS` / `MIN_PLAYERS` from the in-game sheet; a legacy `?player=` link arriving when a saved game exists; and unit tests for the three pure helpers above once extracted.

### 3.6 ⚪ Performance and accessibility

- The deck chunk loads on `/` (Part 1.4). The timer re-renders the full tree every second while running.
- The "Start timer" button unmounts on click (`page.tsx:869-879`) and drops focus to `<body>`; it also sits inside the card's `aria-live="polite"` region, so its appearance is announced.
- Swipe fly-off and settle transforms are set imperatively (`page.tsx:528-550, 592-599`) and ignore `prefers-reduced-motion`; the CSS animations honour it.
- The logo's SMIL `<animate>` (`Logo.tsx:24`) is not covered by the reduced-motion media query.
- No keyboard bindings for Next / Skip / Undo; the buttons are reachable, so this is polish.

---

## Part 4 — Security, infrastructure and legal

### 4.1 Security: sound today, with the paywall changes planned in

- **CSP** (`next.config.ts:24-37`) is tight and self-hosted. Stripe.js will need `script-src https://js.stripe.com`, `frame-src https://js.stripe.com https://hooks.stripe.com` and `connect-src https://api.stripe.com`; an auth provider adds its own origins. Add a CSP assertion to the browser suite when this changes, because nothing tests it today.
- **Saved-game validation** (`session.ts`) was checked field by field and is complete for its threat model. `usedPromptIds` and `upcomingTurns` are type-filtered but not length-capped; low, local-only.
- **Sentry** sends no PII, no traces, and scrubs URLs and breadcrumb URLs. `beforeSend` does not scrub `extra` or exception messages, so the rule for new code is: never interpolate a player name into an error.
- **Age gate** is documented as a non-security assertion and `/game` prerenders in full. Acceptable until accounts exist (Part 6 moves it server-side).
- **Repo is public.** The deck is the product and it is in `src/lib/prompts.ts` and `docs/prompts.csv`, and in every fork and cache since. Making the repo private stops future copies, not past ones. Decide this before charging.

### 4.2 🔴 Infrastructure: one host, one release, monitoring on

The two-deployment state in Part 1.1 has a concrete failure mode once payments exist: Stripe webhooks configured against one origin never reach the other, so payments succeed and entitlements are never granted.

**Recommendation: consolidate on Vercel, on the Pro plan.** The domain is already there, the framework is Next-native, preview deploys per PR come free, and the Hobby plan's non-commercial terms rule it out as-is. Then:

1. Add the Sentry DSN, `NEXT_PUBLIC_SITE_URL`, `SENTRY_ORG` / `SENTRY_PROJECT` and the upload token as Vercel environment variables (the token as a sensitive variable).
2. Delete the Firebase App Hosting backend (or at least detach it from `main`), and remove `apphosting.yaml` and `.firebaserc` if Firebase Auth is not chosen in Part 6.
3. Rewrite `CLAUDE.md` "Where it deploys" and the spec's §0.6.
4. Add `vercel.json` only if needed; keep headers in `next.config.ts` where they are.

If you would rather stay on Firebase because Firebase Auth appeals, the same list applies in reverse: point DNS at App Hosting, delete the Vercel project, and fix the stray Sentry secret the spec already describes. Either is fine. Both is not.

Also still open from §2.7: preview deploys (free with Vercel), a bundle-size budget in CI (the deck split is exactly the kind of regression it would catch), `CODEOWNERS`, `SECURITY.md`, a PR template. Set `minInstances: 1` or its Vercel equivalent for whichever route receives webhooks.

### 4.3 🟠 Legal: accurate now, wrong the day accounts ship

Every claim in the Privacy Policy was checked against the code and is true today. The following sentences become false with accounts, Stripe or analytics, and must change in the same release: "no server that stores anything about you", "no accounts", "no advertising or tracking cookies" (Stripe.js sets fraud-detection cookies before checkout starts; a session cookie is a cookie), "no record reaches us of which prompts you saw" (Phase 3 analytics), and the rights section, which today says "clear your browser storage".

Missing for a paid product: refund policy, subscription and auto-renewal disclosure (required by card networks and several US states), an account-deletion flow, a data-request contact with a response window, and — if a subscription is sold in-app — Apple's and Google's required subscription copy. The 18+ language is consistent everywhere and drinking age defers correctly to local law. `LEGAL_IS_DRAFT` only trips on `[placeholder]` text, so the site currently shows no draft notice even though `legal.ts` says the documents are unreviewed; that is fine as long as the lawyer review happens before money changes hands.

---

## Part 5 — Deck

874 prompts: Mild 89, Medium 311, Extreme 474. NHIE mode draws 125 from all tiers.

### 5.1 🟠 Rewrite or remove before a store or processor reads the deck

| id | Tier | Problem |
|---|---|---|
| 257 | Medium | Confessing to redistributing someone's nudes — normalises non-consensual image sharing |
| 490 | Extreme | Urination content; the clearest processor and store flag in the deck |
| 226, 1139, 1150 | Medium / Extreme | Hand your phone over or show its contents to the group; exposes third parties' messages and photos who are not in the room |
| 170 | Mild | Present-tense illegal drug use, tagged Mild |
| 195, 437, 712, 807, 840 | Medium / Extreme | Contact with no opt-out (Part 1.3) |
| 512 | Extreme | Typo: "drinkmore" |

Editorial calls, not blockers: the kink-confession cluster (489, 493, 1119–1122), 511 (forced-exposure framing), 521 and 510. Clean on every hard-line category: nothing involving minors, incest, bestiality, hate or self-harm.

### 5.2 🟡 Structure

- **44 cards say "finish your drink" or "down your drink"**, five of them for two players at once. That is off the four-rung ladder the tests enforce and it is uncapped alcohol at the top of Extreme. Normalise to "or take a shot".
- **Two-way opt-out** language is on 2 of 110 contact cards. Either adopt the house rule across the deck or change the rule to "the Skip button is the second player's out" and say so on the card frame.
- **85 "Drink if you've ever…" cards are player-scoped** while 125 structurally identical siblings are room-scoped. The spec chose 30 to flip for spread; the remaining split reads as accidental. Decide once and tag consistently.
- **Mild** needs roughly 60–80 more cards, weighted toward light dares, timed cards and the bottom rung of the ladder, which it has none of. Target a 15 / 35 / 50 split by growing Mild, not cutting the rest.
- **NHIE** should either show spice 4 or offer a "Mild + Medium only" variant.
- Near-duplicates to merge: 208/385, 328/329, 426/427. Card 628 assumes seating ("to your left") the game has no model of. Prop cards (blindfold 10, ice 5, whipped cream 5, toy 9) have a drink out but no prop-free variant.

### 5.3 Schema for what comes next

```ts
type Prompt = {
  id: number;
  text: string;
  nsfwLevel: NsfwLevel;
  scope?: 'player' | 'room';
  contact?: 'none' | 'solo' | 'two-way';   // makes the consent audit a filter, not a regex
  props?: ('blindfold' | 'ice' | 'whippedCream' | 'toy' | 'phone')[];
  minPlayers?: number;                      // 3 for group votes
  couplesOnly?: boolean;                    // date-night mode
  soberAlt?: string;                        // text when drink outs are off
  pack: 'core' | string;                    // the entitlement unit for paid packs
};
```

Add a unit test that every `contact !== 'none'` card has an opt-out rung, which is the test that would have caught Part 1.3.

---

## Part 6 — Paywall, accounts and the app stores

This is the decision the rest of the roadmap hangs on, so it is stated in full.

### 6.1 What the stores allow and require

- **Apple** bars "explicit descriptions or displays of sexual organs or activities intended to stimulate erotic rather than aesthetic or emotional feelings" (1.1.4) and lists Picolo, several "Truth or Dare — Dirty 18+" titles and couples' sex-game apps at 17+/18+ today. Text dares that reference sex without anatomical description are the pattern that passes. The 2026 rating scheme is 13+/16+/18+; declare 18+ with alcohol and sexual-content descriptors.
- **Apple rejects thin web wrappers** under 4.2. A Capacitor build passes when it behaves like an app: native navigation feel, haptics, no browser chrome, offline start, native purchase flow. The current UI already does most of that.
- **In-app purchases must use StoreKit** (3.1.1) for anything unlocked inside the app. Since the 2025 *Epic v. Apple* injunction, US apps may link out to web checkout with no commission; the EU has its own terms from October 2026. A web-bought entitlement can be honoured in the app. What you cannot do is take a card in-app outside StoreKit.
- **Google Play** mirrors this: 18+ rating with the age-restricted-content flag, Play Billing for in-app unlocks, and the Play Age Signals API for the 2026 state laws.
- **Age assurance.** Texas (under injunction), Utah (May 2026) and Louisiana (July 2026) require stores to pass an age signal to 18+ apps. Consume Apple's Declared Age Range API and Google's Age Signals API in the native builds and store the result on the account; the web keeps the self-attestation gate until an account exists, then records the attestation server-side.

### 6.2 Payments: web and mobile are two rails

| Surface | Rail | Note |
|---|---|---|
| Web | Stripe **if** confirmed in writing; otherwise CCBill (~$500–1,000/yr plus 5–10% and a rolling reserve) | Paddle prohibits adult content outright; Lemon Squeezy is ambiguous, ask first |
| iOS | StoreKit 2 | Mandatory for in-app unlock |
| Android | Play Billing | Mandatory for in-app unlock |
| All three | **RevenueCat** as the entitlement ledger | Wraps StoreKit, Play Billing and its own Stripe-backed web billing behind one `entitlements` check, with webhooks into your database |

A one-time unlock converts better than a subscription for a party game people play a few times a year; a subscription only earns its keep if new packs ship monthly. Recommended shape, as a product opinion to test: **Mild free** (the on-ramp), **one-time unlock for Medium, Extreme and NHIE**, and **paid packs** (couples, sober, themed) on top, which is what the `pack` field in 5.3 is for.

### 6.3 Architecture

```
Browser / Capacitor shell
   │  session cookie (httpOnly)            IAP receipt
   ▼                                          ▼
Next.js on Vercel ──── /api/deck/[mode] ───► entitlement check ───► deck slice
   │                                          ▲
   ├── /api/stripe/webhook ──► entitlements ◄─┴── RevenueCat webhook
   ├── /api/account (delete, export)
   └── Auth: Supabase Auth (or Clerk)  ── Postgres: users, entitlements, age_attestation
```

- **Auth + database:** Supabase Auth with Postgres (free to 50k MAU, SSR cookie helpers for Next) or Clerk with Neon. Firebase Auth plus the Invertase Stripe extension is the natural pick only if staying on Firebase, and Firebase Extensions is slated to end in March 2027, which argues against it.
- **The deck leaves the bundle.** `GAME_MODES` and types move to their own module; the free tier's deck is a dynamic import; paid decks are served by a route handler that checks the entitlement and returns the mode's cards (whole mode per request is fine at 300–500 short strings; sign and cache per user for an hour). The client caches the last fetched deck in the saved game so a night does not depend on the network.
- **Nothing client-side is trusted:** entitlement flags in `localStorage` are a convenience for UI, never the gate. The same rule as `session.ts`.
- **Routes that become dynamic** (`/api/*`, `/account`) opt out of the CDN cache explicitly; the marketing, setup, legal and play shells stay static.
- **Age gating** becomes an account attribute (attestation date, store age signal if any) and the play route checks it server-side for paid decks.

### 6.4 Mobile: Capacitor first, Expo if rejected

| Path | Reuses | Effort | Risk |
|---|---|---|---|
| Capacitor wrapping the static export, plus native plugins (haptics, wake lock, share, RevenueCat) | 100% of UI and logic | 3–5 weeks to first TestFlight | 4.2 if it feels like a site; mitigated by the existing mobile polish |
| Expo / React Native | `src/lib` and the reducer from 3.4; UI rewritten | 8–12 weeks | Low on review, high on maintenance of two UIs |
| SwiftUI | nothing | 12+ weeks and a second codebase | Lowest review risk, no policy requires it |

Swift is not required. Do the 3.4 refactor first so the engine is DOM-free either way, then Capacitor.

---

## Part 7 — Product: missing features and improvements

Reconciled against `afterhours_ux_improvements.md` and `docs/ui-ux-audit-2026-08.md`: of the August redesign, R2–R6 and every B-item shipped; **R1, the hand-off screen, did not**. Of the older roadmap, level descriptions, disabled-Start-with-hint, remembered crew, Skip, timer, fair rotation, finale, category badges, haptics and persistence shipped; gender selection, drink counter, escalation, sound, ratings, share, custom prompts, packs, confetti and the PWA install prompt did not.

| Feature | Why it matters | Effort | Tier |
|---|---|---|---|
| **Hand-off screen** ("Pass to Sam", tap to reveal) | The biggest remaining loop gap: the next player's name is small, and the previous card is visible during the pass | S | Free |
| **Share a card / share the Last Call recap** as an image via the Web Share API | The product spreads in group chats and has no share surface at all | M | Free (growth) |
| **Sober mode** (drink outs become dares or points) | Widens the audience; needs `soberAlt` | M | Free |
| **Couples / date-night mode** | Large adjacent market; needs `couplesOnly` + `contact` tags | M | Paid pack |
| **Custom prompts and house rules** | Inside jokes drive repeat play; device-local first, no sync | M | Paid |
| **Per-card "never show this" and a props filter** ("no blindfold cards tonight") | Cheap, answers the most common real complaint | S | Free |
| **Settings screen** (haptics, sound when added, reduced motion, drinking on/off) | No single home for these today; a prerequisite for sound | S | Free |
| **Mild rebalance and NHIE variants** (Part 5) | The default mode is the thinnest and runs out first | M (content) | Free |
| **Session length** ("we have 45 minutes") | Small, useful framing | S | Free |
| **Sound** (off by default) | Old-roadmap item, still absent | M | Free |
| **PWA install prompt and offline shell** | Manifest exists; nothing surfaces install; no service worker | S | Free |
| **Prompt feedback (👍/👎)** | The only cheap way to learn which cards land, and it feeds pack curation | S | Free, with analytics |
| Localisation | 874 English prompts; not near-term | L | — |

UI polish worth a pass: the two `blur(60px)` smoke layers in `Atmosphere.tsx` on low-end Android; desktop is a phone column on a black field (fine, but state it as a non-goal); a 20-character name next to the fixed card counter on narrow phones.

---

## Part 8 — Roadmap

Ordered so that each phase leaves a shippable product. Effort is for one engineer.

**Phase A — Stabilise production (this week)**
1. 🔴 One host. Vercel Pro, environment variables set, Firebase backend detached, `CLAUDE.md` and spec §0.6 rewritten (4.2).
2. 🔴 Sentry actually reporting from the domain; then the Sentry project settings and uptime check the spec already lists.
3. 🟠 Fix 3.1 and 3.2 with tests. Fix the five no-out cards, 512, and the 5.1 rewrites; run `export:deck`.
4. 🟠 Close or defer the five major-version Dependabot PRs deliberately; extend the `ignore` block to majors generally, or schedule the Next 16 upgrade as its own PR with the browser suite run.
5. Decide the repository's visibility.

**Phase B — Make the engine portable and the deck separable (2–3 weeks)**
6. The 3.4 refactor: reducer, gesture hook, timer hook, pure helpers into `src/lib/game.ts`, unit tests for the loop. Browser suite run.
7. Split `GAME_MODES` from the deck; per-mode dynamic import; bundle budget in CI (1.4).
8. Deck schema from 5.3, the contact-opt-out test, scope pass on the 85 cards, ladder normalisation of the 44.
9. Hand-off screen, share card, per-card block list, settings screen (Part 7, the S items).

**Phase C — Instrument and learn (1 week, then wait)**
10. Cookieless analytics (Plausible from $9/mo, or self-hosted Umami) with the Privacy Policy updated in the same PR. Prompt feedback. Watch where people stop for a few weeks before placing the wall.

**Phase D — Accounts and the paywall (4–6 weeks)**
11. Written processor confirmation, or the fallback (6.2). Lawyer review of Terms, Privacy, refund and subscription terms, in that order.
12. Supabase Auth + Postgres, entitlements table, Stripe (or fallback) webhooks, RevenueCat ledger, account deletion and export.
13. Deck route handler with entitlement check; free tier stays a static import; server-side age attestation.
14. CSP additions with a browser-suite assertion; dynamic routes excluded from the CDN cache; `minInstances` for the webhook route.
15. Mild rebalance and the first paid pack, so there is something to buy.

**Phase E — App stores (4–6 weeks after D)**
16. Capacitor shell with haptics, wake lock, share, RevenueCat StoreKit/Play Billing, Declared Age Range and Play Age Signals.
17. 18+ listing with descriptors, screenshots, the required subscription copy if any, and a review-ready build; Expo only if 4.2 rejects it.

---

## What is working well

- The static build, headers, validation boundary and saved-game handling are sound, and the September work was verified on the real domain today.
- `src/lib` is exactly the shape a native port needs: pure functions, no DOM, tested.
- Mobile craft is real: safe areas, `100dvh`, 44 px targets, wake lock, haptics, reduced motion in CSS, an enforced contrast gate.
- The deck's consent pattern exists on 105 of 110 contact cards; finishing it is a small edit, not a redesign.
- Apple already lists this genre. The store path is a wrapping project on code that already behaves like an app, not a rewrite.
