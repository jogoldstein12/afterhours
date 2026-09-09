# After Hours — Public Release Readiness Audit

**Date:** September 9, 2026
**Scope:** Everything that stands between "works for my friends" and "safe to put behind a public URL and charge for" — security, infrastructure, architecture, code correctness, content/legal exposure, and design polish.
**Method:** Full source read of both engines; `npm ci` + `npm audit` on a clean tree; typecheck, lint, and production build run and passing; build manifest and emitted chunks inspected; all 874 prompts scanned programmatically for content-risk categories and prompt-rendering behaviour; git history scanned for secrets; a candidate framework upgrade applied and verified, then reverted.
**Relationship to prior audits:** `docs/audit-2026-08.md` (Aug 26) explicitly put security out of scope and assumed an internal friend-group context. `docs/ui-ux-audit-2026-08.md` (Aug 27) covered mobile design and its top recommendations (R2–R6) shipped. This audit covers the delta: what changes when *anyone* can reach the app, and what a paywall implies.

> **Status legend:** 🔴 Blocker · 🟠 High · 🟡 Medium · ⚪ Polish

---

## Verdict

The app itself is in good shape. The build is clean, the gates are on, the design work landed, the code is readable and well-commented, and there is no server, no database, and no secret to leak — which removes an entire class of problems that usually dominate a pre-launch audit. The git history is clean.

**The gap is not in the code. It is in everything a public product needs that a side project does not have.** Right now this app has: no age gate on explicitly adult content, no Terms, no Privacy Policy, no licence, no liability disclaimer on a *drinking* game, no security headers, no monitoring, no tests, a framework with an unpatched critical advisory, and search engines are explicitly invited in via `robots.txt`. Any one of those is fine in a friend group. Together, on a public URL with a payment form attached, they are the whole risk surface.

There is also one architectural fact that needs to be confronted before the paywall conversation starts: **the entire prompt deck ships to every visitor in a 104 KB JavaScript chunk, including on the setup screen.** The product you intend to sell is currently given away in full to anyone who opens the homepage and views source.

**Scorecard**

| Area | Grade | One-liner |
|---|---|---|
| Security posture | D | No headers, unpatched critical framework CVE, no dependency automation — but no secrets and a tiny attack surface |
| Legal / compliance readiness | F | No age gate, no ToS, no privacy policy, no licence, no alcohol disclaimer, indexable by search |
| Content safety | C− | 21 prompts direct intimate contact on a randomly-chosen player with no opt-out, and the Skip button was removed |
| Infrastructure | D+ | `maxInstances: 1`, no monitoring, no error tracking, no analytics, no staging, no rollback story |
| Architecture (for monetisation) | D | Fully static, no auth, no entitlements; the deck is client-side and free to anyone with devtools |
| Code correctness | B− | Clean build and types; one 14%-of-deck rendering bug, one permanent dead-end route, zero tests |
| Design / UX | B+ | The Aug redesign landed well; gaps are now error states, share metadata, and contrast |
| Repo hygiene | C+ | No licence, stale blueprint doc, placeholder package name, two drifted engines |

---

## P0 — Blockers

These should be closed before the URL is public, in roughly this order.

### 0.1 🔴 Next.js 15.3.8 carries 30 published advisories, one critical

`npm audit` on a clean install reports **11 vulnerabilities (1 critical, 8 high)**. The critical one is in Next.js itself, and the advisory list for the pinned 15.3.8 includes unauthenticated RCE in the Image Optimization API, middleware/proxy bypass, cache poisoning, request smuggling, and SSRF.

Most of these need a server-rendered surface the app does not currently expose (all routes build as `○ Static`), so the *practical* exposure today is lower than the raw count. That stops being true the moment a paywall adds an API route, middleware, or auth check — which is exactly what is planned.

**Verified fix.** I upgraded to `next@15.5.25` + `eslint-config-next@15.5.25`, and confirmed:
- `npm audit` critical → **cleared** (remaining 10 are transitive dev/build-time DoS issues in `brace-expansion`, `minimatch`, `picomatch`, `glob`, `js-yaml`, `yaml`, `postcss-selector-parser`)
- `npm run typecheck` — passes
- `npm run lint` — passes, no warnings
- `npm run build` — passes; bundle size unchanged (145 kB → 146 kB first load)

I reverted the change so this branch contains only the audit. It is a one-line, verified-safe upgrade whenever you want it.

**Also:** there is no Dependabot or Renovate config, and CI has no `npm audit` step. This is why a critical advisory sat unnoticed. Add both — the automation matters more than this single bump.

*Note: `next lint` is deprecated as of 15.5 and prints a codemod notice. Migrate to the ESLint CLI when you upgrade.*

### 0.2 🔴 No age verification on explicitly adult content — and search engines are invited in

The deck contains 474 Extreme prompts covering explicit sexual content. There is no age gate, no adults-only interstitial, and no content warning anywhere in the app, the manifest, or the README. Meanwhile:

- `public/robots.txt` is `User-agent: * / Allow: /` — every crawler is welcomed
- There is no `<meta name="rating" content="adult">` and no RTA-5042 label, so parental-control filters have nothing to match on
- `metadata.description` is "Neon-styled party game for adults." — the only signal, and it is not machine-readable

For a friend group this is a non-issue. For a public URL it is the single most likely thing to get the site delisted, filtered, blocked by a corporate/school network, or flagged by a payment processor. It is also the thing a regulator or an app store looks for first.

**Fix:** an interstitial age confirmation gating first entry (localStorage-persisted), the `rating`/RTA meta labels, and a decision on whether Mild mode should be crawlable while Extreme is not.

### 0.3 🔴 No legal surface whatsoever

Missing entirely: Terms of Service, Privacy Policy, `LICENSE` file, content disclaimer, and — for a game whose core mechanic is telling people to drink — any responsible-drinking or liability disclaimer.

Specific exposure:
- **33 prompts** instruct a player to *finish* or *down* a drink. There is no "never drink if you're driving / pregnant / underage / don't want to" copy anywhere.
- The app stores player names in `localStorage` and passes them in the URL query string. That is personal data under GDPR/CCPA, however trivially. With no privacy policy there is nothing disclosing it.
- `game.html` loads Google Fonts from `fonts.googleapis.com`, which transmits visitor IPs to a third party — a known GDPR sore point in the EU. (The Next app is fine: `next/font` self-hosts.)
- No `LICENSE` means the repository is legally "all rights reserved" by default, which may or may not be what you want, but should be a decision.

None of this requires a lawyer to *start* — it requires the pages to exist and be linked from the footer before launch.

### 0.4 🟠 The consent model in the deck is the biggest product risk

The deck directs an act at a randomly-selected other player in **291 prompts** (231 Extreme, 50 Medium, 10 Mild). Most pair the act with an explicit out ("— or take 3 drinks"), which is the right pattern and shows the design intent is there.

**21 do not.** These are direct imperatives naming another player, with no opt-out offered by the card:

| ID | Mode | Prompt |
|---|---|---|
| 359 | Extreme | Lick {{randomOtherPlayer}}'s nipples for 10 seconds. |
| 392 | Extreme | Sit on {{randomOtherPlayer}}'s lap naked for the next 2 rounds. |
| 426 | Extreme | Spank {{randomOtherPlayer}} — hard. |
| 347 | Extreme | Lick {{randomOtherPlayer}}'s inner thigh. |
| 331 | Extreme | French kiss {{randomOtherPlayer}} while the group watches. |
| 333 | Extreme | Kiss everyone in the room on the lips. |
| 435 | Extreme | Blindfold {{randomOtherPlayer}} and kiss them somewhere unexpected. |
| 480 | Extreme | Spin a bottle — whoever it lands on, you have to make out with for 20 seconds. |
| 419 | Extreme | Massage {{randomOtherPlayer}}'s inner thighs for 30 seconds. |
| 328, 338, 360, 374, 384, 412, 824 | Extreme | (make out / ice cube kiss / finger / whipped cream / lap dance / kiss-or-strip / blindfold kiss) |
| 200, 201, 208, 209, 736 | Medium | (neck lick / massage / lap dance / sit on lap / move next to) |

Two structural aggravators:

1. **The Skip button was deliberately removed** (commit `5669afd`, "Remove the Skip button for now"). The only escape from a card is Undo, which rewinds rather than declines. A player who does not want to do a card has no in-product way to pass.
2. **The second player never consented and was never asked.** `{{randomOtherPlayer}}` is chosen by `Math.random()`. The card instructs player A to do something physical to player B, and B's only input is social.

Separately, prompt **1150** ("Show {{randomOtherPlayer}} the spiciest thing on your phone; they decide whether the group sees it") directs the sharing of intimate imagery — potentially of a third party who is not in the room and cannot consent. Prompt **257** asks players to admit to distributing someone's nudes. Both are the kind of thing a content reviewer or processor flags.

**This is not a request to sanitise the game.** An edgy adult party game is the product. But shipping it publicly means the *product* has to carry the consent affordance the deck assumes exists socially: bring back a Skip/Pass (with no penalty, or a drink-instead default), and either add an out to those 21 or move them behind an explicit opt-in.

### 0.5 🟠 No security headers at all

`next.config.ts` contains only an `images` block. There is no `headers()` export and no header configuration in `apphosting.yaml`. Missing:

- `Content-Security-Policy` — the highest-value one here, and cheap: this app loads zero third-party scripts, so a tight policy is nearly free
- `X-Frame-Options` / `frame-ancestors` — nothing prevents the app being iframed into someone else's page and passed off as theirs, which matters for an adult brand
- `Referrer-Policy` — player names travel in the query string; browser defaults happen to protect this cross-origin today, but that should be explicit not accidental
- `Permissions-Policy` — the app requests `wakeLock` and `vibrate`; everything else (camera, mic, geolocation, payment) should be denied outright
- `Strict-Transport-Security`

---

## P1 — Correctness and product bugs

### 1.1 🟠 119 prompts (14% of the deck) are rendered with the wrong meaning

`src/app/game/page.tsx:335` builds a "Name, ..." prefix for any prompt that has no `?` and does not start with one of 14 stop-words. The stop-word list does not include `"drink if"` — so every room-wide drink rule gets personalised into a single-player instruction:

```
Deck text:   "Drink if you've ever skinny-dipped."
Rendered:    "Alex, drink if you've ever skinny-dipped."
```

That silently converts a rule the whole room answers into a card that only Alex answers — while the card simultaneously displays a **DRINK** category badge, which `getPromptCategory` assigns precisely *because* it starts with "Drink if". The app contradicts itself on 119 cards.

493 of 874 prompts take the prefix; 119 of those should not. **The same bug exists identically in the standalone engine** (`tools/standalone-template.html:676`, same `PREFIX_EXCEPTIONS` array), so fixing it means fixing both.

**Fix:** add `drink if`, `take a drink`, `take a sip`, `take a shot`, `whoever`, `last person`, `first person`, `everybody`, `vote` to the exception list in both engines, and add a test that asserts the classification and the prefix decision agree.

### 1.2 🟠 `/game` with no query params is a permanent dead-end

`src/app/game/page.tsx:510` returns the "Charging Neon..." loader whenever `players.length === 0`, and the effect that populates players only runs `setPlayers(names)` when `names.length > 0`. Navigate to `/game` directly — a bookmark, a shared link with the query stripped, a link preview, a crawler — and the app shows an animated loading state **forever**, with no navigation, no message, and no way back.

**Fix:** redirect to `/` (or render a "start a game" empty state) when no roster resolves.

### 1.3 🟠 A mid-game refresh destroys the session

Player names survive a refresh because they live in the URL. Nothing else does: `usedPromptIds`, `history`, `turnsByName`, `upcomingTurns`, and the current card are all in-memory React state. Refresh, accidental back-navigation, or the browser reclaiming a backgrounded tab mid-party and the group restarts the deck from zero with a fresh shuffle.

For a game played on a phone that is being physically passed around a loud room, tab eviction is not an edge case. Persist the game state to `localStorage`/`sessionStorage` and offer "resume".

### 1.4 🟡 Input validation gaps

- **No `maxLength` on any input** (verified: zero occurrences in `src/`). A pasted 10 000-character name goes into React state, the URL, and `localStorage`, and breaks the layout.
- **`MAX_PLAYERS` is not enforced on the `/game` path.** `home-screen.tsx:51` slices to 10; `game/page.tsx:222` does `setPlayers(names)` with no cap. A hand-crafted or shared URL with 500 `player=` params is accepted, rendering 500 roster rows.
- **No duplicate-name guard.** Two players called "Alex" share a single `turnsByName` counter (it is keyed by name string), so the end-of-night "most in the hot seat" stat is wrong, and `{{randomOtherPlayer}}` can resolve ambiguously.

None of these are exploitable against anyone but the user's own tab — there is no server and React escapes all output, so there is no XSS here. They are robustness gaps that a public audience will find within a week.

### 1.5 🟠 Zero automated tests

There is no test file, no test runner, and no test script in `package.json`. The Aug audit described several behaviours as "test-covered"; they are not.

For this app specifically, the untested logic is the *entire product*: turn rotation fairness, deck exhaustion, undo/redo state restoration, `{{randomOtherPlayer}}` substitution, the prefix rules above, category classification, and roster edits mid-game. Every one of those is a pure function or a small reducer and would be cheap to cover. CI already runs typecheck/lint/build — a `vitest` job slots straight in.

### 1.6 🟡 Mode balance works against the funnel

| Mode | Cards | Note |
|---|---|---|
| Mild | **89** | The default and the on-ramp — and by far the thinnest deck |
| Medium | 311 | |
| Extreme | 474 | |
| NHIE | 125 drawn from all tiers | **80 of them (64%) are Extreme** |

Two problems. First, a new group that picks the default reaches "Last Call" more than five times faster than one that picks Extreme — the mode most likely to be a first impression is the one most likely to run out. Second, "Never Have I Ever" presents as spice 3 of 4 but is majority-Extreme content; the description does say "includes Extreme", but a group choosing the friendly-sounding named mode is not choosing an Extreme deck.

---

## P2 — Architecture and infrastructure

### 2.1 🔴 The product ships to the client, free, on the homepage

Verified from the build manifest: chunk `61-*.js` (104 KB) contains the full 874-prompt deck, and it is loaded by **`/page`** — the setup screen — not just `/game`.

The cause is that `GAME_MODES` and `PROMPTS` live in the same module (`src/lib/prompts.ts`), so importing the four mode labels drags the entire deck along and nothing can tree-shake it.

Two consequences:

1. **Performance.** Every visitor downloads 104 KB of prompts before choosing anything. That is most of the homepage's 145 KB first load, on a product whose audience is on phones and often on bad venue wifi.
2. **Monetisation.** This is the paywall problem, already present. Any client-side gate is `view-source` away from being bypassed. Whatever the paid tier turns out to be, its content cannot live in the static bundle.

**Fix now (cheap, independently worthwhile):** split `GAME_MODES` and the type definitions into their own module so the homepage stops loading the deck, and load the deck per-mode via dynamic import so a Mild game does not download 474 Extreme prompts.

### 2.2 🟠 Nothing in the current architecture can support a paywall

Stated plainly so the later decision is made with open eyes. The app is 100% static: no backend, no API routes, no auth, no user accounts, no database, no session, no entitlement check. A paywall needs, at minimum: identity, a payment provider integration, server-side entitlement verification, and server-gated content delivery. That is a real backend, and it is the point at which every server-side Next.js advisory in §0.1 starts to matter.

**Also flag early, because it can invalidate the whole plan:** mainstream payment processors restrict adult content. Stripe's restricted-businesses list covers sexually explicit material, and Paddle, Lemon Squeezy, and the app stores have comparable rules. **Confirm processor eligibility before building anything**, because the answer may push you toward an adult-friendly processor (with markedly worse rates), a native app with in-app purchase (where store review is a separate hurdle for this content), or a repositioning of what exactly is being sold.

### 2.3 🟠 `apphosting.yaml` caps the app at one instance

```yaml
runConfig:
  maxInstances: 1
```

That is the Firebase App Hosting scaffold default, unchanged. All routes are statically prerendered so the CDN absorbs most traffic, but every cache miss, cold path, and non-cached request funnels through a single Cloud Run instance. One social post is enough to queue behind it. There is also no `minInstances` (so cold starts hit the first visitor of every quiet period), no CPU/memory configuration, and no concurrency setting.

More broadly, there is **no deployment story in the repo**: no staging environment, no preview deploys on PRs, no documented rollback, no custom domain configuration, and no CDN cache-control policy.

### 2.4 🟠 No monitoring, error tracking, or analytics

Nothing is instrumented. If the app throws for a class of device tonight, you will find out from a text message. There is also no funnel data — which matters concretely for the paywall, because you cannot price or place a paywall without knowing where people stop.

Minimum before launch: a client error reporter (Sentry or equivalent — a static app needs only the browser SDK), uptime monitoring, and privacy-respecting analytics. Given §0.3, prefer a cookieless analytics tool so this does not itself become a consent-banner problem.

### 2.5 🟡 The two engines have drifted again

The Aug audit reconciled the Next app and `game.html` behaviourally, and CI enforces that `game.html` regenerates from the deck. But the R2–R6 redesign shipped to the Next app only. Current parity:

| Feature | Next app | `game.html` |
|---|---|---|
| Swipe gestures | ✅ | ❌ |
| Prompt category badges | ✅ | ❌ |
| Fair shuffled-round rotation (`upcomingTurns`) | ✅ | ❌ |
| "Last Call" finale + stats + MVP | ✅ | ❌ (plain text) |
| Undo / history | ✅ | ✅ |
| Wake lock | ✅ | ✅ |

CI checks that the *deck data* matches; it cannot check that the *engines* match, and they no longer do. Decide what `game.html` is for: if it is a real offline product, the shared engine refactor (open since Aug as 1.7) needs to happen; if it is a demo, say so in the README and stop implying parity.

### 2.6 🟡 Dead configuration that adds attack surface

`next.config.ts` allows remote images from `placehold.co`, but **`next/image` is not used anywhere in the codebase** (verified: zero imports). Several of the Next advisories in §0.1 target the image optimizer and its `remotePatterns` handling specifically. Delete the block.

### 2.7 🟡 CI gaps

`.github/workflows/ci.yml` runs typecheck, lint, build, and a deck-freshness check — a good baseline. Missing: `npm audit` (or a dedicated scanner), a test job, Dependabot/Renovate, preview deployments, and a Lighthouse/bundle-size budget check. There is no `CODEOWNERS`, no `SECURITY.md`, and no PR template.

---

## P3 — Design, polish, and hygiene

### 3.1 🟠 No error or not-found boundaries

`src/app/` has no `error.tsx`, `not-found.tsx`, or `global-error.tsx`. Any runtime error or bad URL drops the visitor onto Next's stock white error page — jarring on a black neon app, and it looks broken rather than handled. Three small files.

### 3.2 🟠 Shared links render bare — on a product that spreads by sharing

`metadata` in `src/app/layout.tsx` has only `title` and `description`. There is no `openGraph`, no `twitter` card, no `metadataBase`, and no OG image. A party game is shared in group chats; right now every one of those links renders as a grey box with no image and no styling. For something you want to *market*, this is one of the highest-leverage small fixes in this document.

### 3.3 🟡 Contrast below WCAG AA in the game HUD

`text-white/40` over the `#0A040F` background computes to roughly **3.9:1**, under the 4.5:1 AA threshold for normal text. It is used for the deck counter (`/ {deckTotal}`) among others. `text-white/55` (≈6.4:1) is fine. Also `disabled:opacity-30` on the dock buttons pushes the disabled Undo label well below any readable threshold.

### 3.4 ⚪ Privacy details worth a decision

Player names are placed in the URL query string and persisted to `localStorage` under `afterhours.lastSetup`. Neither is dangerous, but both are choices to disclose in the privacy policy: URLs land in browser history and in any future analytics pageview data, and a shared game link contains the roster of everyone who was in the room.

### 3.5 ⚪ Repo hygiene

- `package.json` is still named `"nextn"` at version `0.1.0`, with no `license`, `repository`, `description`, or `engines` field
- No `LICENSE` file
- No `CLAUDE.md` (open since Aug)
- **`docs/blueprint.md` is stale and misleading**: it names the app "GlowUp: After Hours" and documents a "Content Moderator" feature that was removed. The Aug audit closed "docs that lie" without catching this one.
- `src/hooks/use-toast.ts:178` — the effect depends on `[state]`, so the listener is unsubscribed and re-subscribed on every toast state change. Upstream shadcn bug; harmless, but the dependency should be `[]`.
- `.idx/dev.nix` still boots Firebase `auth` + `firestore` emulators for a project with no Firebase dependency

---

## Recommended order of work

**Before the URL is public**

1. Upgrade Next.js to 15.5.25 and add Dependabot + an `npm audit` CI step (§0.1) — verified, ~10 minutes
2. Add security headers and delete the dead `images` config (§0.5, §2.6) — one file
3. Age gate + `rating`/RTA meta + a `robots.txt` decision (§0.2)
4. Terms, Privacy Policy, LICENSE, alcohol/liability disclaimer, footer links (§0.3)
5. Fix the `/game` dead-end and add `error.tsx` / `not-found.tsx` (§1.2, §3.1)
6. Restore a Skip/Pass affordance and resolve the 21 no-out contact prompts (§0.4)
7. Raise `maxInstances`, set `minInstances`, and add error tracking + uptime monitoring (§2.3, §2.4)

**Before you charge anyone**

8. **Confirm payment-processor eligibility for adult content first** (§2.2) — this can change the entire plan
9. Split `GAME_MODES` out of `prompts.ts` and load decks dynamically (§2.1)
10. Design the backend: identity, entitlements, server-gated content (§2.2)
11. Add analytics so the paywall is placed on evidence, not instinct (§2.4)

**Quality, in parallel**

12. Fix the 119 mis-personalised prompts in both engines (§1.1)
13. Stand up a test suite over the game logic (§1.5)
14. Persist and resume mid-game state (§1.3)
15. OG/Twitter metadata and a share image (§3.2)
16. Input validation: `maxLength`, roster cap on `/game`, duplicate-name handling (§1.4)
17. Rebalance Mild and clarify the NHIE intensity signal (§1.6)
18. Decide what `game.html` is, then either share the engine or document the difference (§2.5)
19. Contrast fixes, repo hygiene, stale docs (§3.3, §3.5)

---

## What is working well

Worth stating, because a document this long can read as if nothing is right.

- **Clean build, clean types, clean lint, clean git history.** No secrets have ever been committed. CI catches regressions on every PR.
- **The design work landed.** The Aug redesign (R2–R6) shipped and the game screen is genuinely good: mode-as-colour carried consistently, the card as the hero, the "Last Call" finale, the timer ring, per-player neon identity.
- **The code is readable and unusually well-commented.** The comments explain *why*, not *what* — rare, and it made this audit much faster.
- **Real attention to mobile.** Safe-area insets, `100dvh`, `touch-manipulation`, 44px targets, wake lock, haptics, `prefers-reduced-motion`, `aria-live`. This is more than most shipped web apps do.
- **The attack surface is genuinely small.** No server, no database, no secrets, no third-party scripts, no user-generated content, React-escaped output throughout. Most of §0 is about adding what is missing, not undoing what is wrong.
- **The consent pattern already exists in the deck.** 77 of the 98 directed physical-contact prompts already offer an out. The fix in §0.4 is finishing a pattern the deck already uses, not inventing one.
