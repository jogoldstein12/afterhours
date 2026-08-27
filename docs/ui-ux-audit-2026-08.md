# After Hours — Mobile UI/UX Design Audit

**Date:** August 27, 2026
**Scope:** User interface, interaction design, visual design, and mobile experience. Functionality, content deck, and infrastructure were covered by `docs/audit-2026-08.md` (Aug 26) and are referenced, not re-audited.
**Method:** Full source read of every screen and component; live app driven with Playwright on three real viewports — iPhone 14/15 (390×844), iPhone SE (375×667), and landscape (844×390) — through 16 captured states: setup (empty, filled, 8 players, error toast), all four modes in play, timer idle/running, long player names, Manage Group sheet, End Game dialog, and deck exhaustion. Zero console errors across the run.
**Constraint honored throughout:** the color scheme and icon language stay. Every recommendation builds on the existing violet/pink neon identity rather than replacing it.

---

## Verdict

The visual identity is the app's strongest asset — committed, coherent, and instantly legible as "adult party game." The problem is that the identity currently lives on a layout that visibly breaks on the very devices the game is played on, and on an interaction model that treats the game like a form: the core moment of the product (handing the phone to the next player) has no design at all. The gap between this app and a genuinely impressive one is not color or components — it's (1) three real rendering failures on phones, (2) a missing sense of *occasion* in the game loop, and (3) a dozen small ergonomic details (thumb reach, touch targets, haptics, safe areas) that separate a web page from something that feels native.

**Scorecard**

| Area | Grade | One-liner |
|---|---|---|
| Visual identity & theming | A− | Distinctive, consistent, worth protecting; glow recipes need systematizing |
| Layout robustness (mobile) | D+ | Clipped controls, colliding header, dead landscape — all reproduced on real viewports |
| Game feel & interaction | C | Solid mechanics (undo, timer, wake lock) with almost no choreography, gesture, or celebration |
| Information design | C+ | Mode-as-color is great; redundant header slots, no pacing feedback, no prompt-type signal |
| Ergonomics & accessibility | C+ | Good bones (aria-live, reduced-motion, 16px inputs); contrast, targets, focus, and safe areas below bar |
| Flows & copy | B− | Setup is functional; End-Game dialog vocabulary is confused; "Save Changes" is a fiction |

---

## 1. What's going right — protect these through any redesign

1. **The identity is real.** Violet `#BE52F2` + pink `#F252A9` on near-black `#0A040F`, neon glows, glassmorphism, Space Grotesk — it's a coherent world, applied consistently across app, dialogs, and the standalone build. Most apps in this genre look like a settings page; this one has a point of view.
2. **Mode-as-color is genuinely good information design.** Violet border = Mild, pink = Medium, red = Extreme, blue = NHIE. The card itself tells you how spicy the room is. (Below: this idea is underused, not wrong.)
3. **The logo has charm.** The martini glass with the animated bubble plus the two-line wordmark is a real brand mark, not a placeholder.
4. **Game-feel fundamentals already shipped:** screen wake lock, undo with exact-card restore, auto-detected countdown timers with vibration, remembered roster, fair shuffled-round rotation. These are the invisible features that make the product trustworthy — the redesign should make them *visible*.
5. **Zero-chrome game screen.** No nav bar, no hamburger, no footer links. One card, one button. The restraint is correct.
6. **Accessibility groundwork exists:** `aria-live` on the prompt, `aria-label`s on icon buttons, `prefers-reduced-motion` fallbacks, `sr-only` radios, 16px inputs (no iOS focus-zoom).
7. **It's fast.** Fully static, no network at play time, instant transitions. Any added choreography must not tax this.

---

## 2. What is visibly broken on a phone (evidence-backed)

These are not matters of taste — each was reproduced and captured on a standard viewport.

### B1 — The game footer overflows every phone screen · Critical
On 390×844 (iPhone 14/15) and 375×667 (SE), the Undo / Manage Group / End Game row is wider than the viewport: **"END GAME" renders as "END GAI"**, clipped by the card edge, and "UNDO" is flush against the left edge. Reproduced in *every single game-screen capture*, all four modes. Cause: three `size="sm"` buttons with `uppercase tracking-widest` labels, icons, `gap-4`, and `px-3` padding need ~420px; the card offers ~356px inside its padding at 390px. `src/app/game/page.tsx:464-474`.

### B2 — The header collides with itself · Critical
The centered logo is absolutely positioned and scaled (`scale-[0.6]`, `game/page.tsx:403`), so it occupies no layout space and nothing can flow around it:
- At 390px the wordmark wraps to two lines ("AFTER / HOURS") even with short names.
- A long or hyphenated name ("Alexandra-Konstantina") **renders directly through the martini glass and wordmark**, and the "MEDIUM MODE" badge is overlapped by "AFTER" — captured at both 390px and 375px.
- The Aug 26 audit flagged this as "cramped"; on real viewports it is broken, not cramped.

### B3 — Landscape play loses the controls · High
At 844×390 the vertically-centered card is taller than the viewport: the prompt reads beautifully, but **Next Player sits half below the fold and the utility row is entirely off-screen**. Party phones end up sideways constantly. There is no landscape layout; there should at least be a no-scroll guarantee.

### B4 — The nightclub atmosphere is built but never visible · High (and free to fix)
`Atmosphere.tsx` renders a radial nightclub gradient plus two drifting, blurred smoke blobs at `fixed -z-10` — and then both screens paint an **opaque** `bg-background` wrapper over the whole viewport (`home-screen.tsx:112`, `game/page.tsx:381`, plus `body` itself). The app's single most atmospheric asset is dead weight: every screenshot shows flat near-black. Removing the redundant opaque backgrounds (or giving them transparency) resurrects an already-paid-for layer of depth.

### B5 — Error toasts drop a flat red banner over the brand · Medium
The toast viewport is top-anchored on mobile (`toast.tsx:19`), so the "Not Enough Players" toast covers the logo/header with a flat `#DC2626` rectangle that belongs to a different app — no glow, no glass, off-palette. It also persists ~5s over subsequent interactions. Validation this predictable shouldn't be a toast at all (see E11).

### B6 — Game over still shows a player's turn · Medium
On deck exhaustion the header keeps the last player's name and mode badge as if it's their turn, "Last Call!" appears in the card body, and Undo stays tappable (restoring a "turn" of a finished game). The state reads as *someone's turn with a weird prompt*, not *the session ended*. No recap, no stats, no celebration — the evening just stops.

### B7 — The header's right slot says nothing, twice · Low
A "# OF PLAYERS" badge sits directly above "3 PLAYERS" — the same fact twice, in 9–10px 50%-white type (at `tracking-tighter` it renders as "2PLAYERS"). This is the most valuable real estate on the screen spending itself on redundancy while genuinely useful state (cards left, round number) has no home.

---

## 3. Experience gaps — where "works" falls short of "impressive"

### E1 — The pass is invisible (the single biggest opportunity)
The core loop of a pass-the-phone game is the *hand-off*. Currently, tapping Next Player swaps ~20px of text and a name in the header — the recipient gets no moment, no name-in-lights, no reason to look up. There is nothing to *feel*. A dedicated hand-off beat ("PASS THE PHONE TO **BEN**" — full-screen name, mode-colored, tap-to-reveal the card) would, by itself, move the app from "web page with prompts" to "game." It also fixes a real usability problem: the current player's name is buried in the header at 24px while the prompt text addresses them mid-sentence.

### E2 — The prompt — the entire product — renders at 20px
`text-xl` on mobile, `font-medium`, generous but static. This text is read at arm's length, in a dark room, by people holding drinks, often aloud to the group. It should be the loudest thing the app ever renders: auto-scaled to length (a 6-word dare at ~40px+, a long scenario at ~24px), tighter line-height, heavier weight. The empty vertical space above and below the card (about a quarter of the screen each way) is available to spend on this.

### E3 — Zero pacing feedback
No round number, no cards-remaining, no session arc. Groups can't answer "how much is left?" and deck exhaustion arrives as a surprise (B6). A tiny "Card 23" or a slim progress filament under the header costs nothing and gives the night a shape. The data already exists (`usedPromptIds`, `availablePrompts`).

### E4 — Every prompt looks identical regardless of kind
A dare-with-timer, a confession, a "drink if", and a Never-Have-I-Ever all render as the same white paragraph. The deck has clear implicit types that are trivially detectable (the NHIE regex already exists; "Drink if" / "…or take N drinks" / timer-detection likewise). A small icon + label on the card ("DARE", "CONFESS", "DRINK IF", "NEVER HAVE I EVER") — in the existing icon language — would give each card an identity and let players calibrate *before* reading aloud.

### E5 — Mode identity stops at the card border
The mode selector's selected state is always primary violet — choosing Extreme lights up *violet*, then the game card is red. The selector should light up in the mode's own color (violet/pink/red/blue), with its one-line description (the known-open "level descriptions" item) and a spice meter. Separately, Extreme's red is visually identical to destructive/error red (B5's toast, the End-dialog's red button) — same hue carrying "spiciest fun" and "danger/delete." Shifting Extreme toward a red-orange neon, or reserving pure red strictly for destructive actions, would untangle the semantics.

### E6 — Mid-game level switch silently discards deck progress
Changing level in Manage Group deals a completely fresh deck with no warning (by design — `deckLevelRef` — but uncommunicated). An hour of used cards is gone. One line of copy under the selector, or a lightweight confirm, fixes the surprise.

### E7 — "Save Changes" is a fiction, in a desktop pattern
Every edit in the sheet applies instantly; the button only closes the sheet (Aug audit §2.12, still open). And a right-edge drawer is a desktop idiom — on a phone this should be a bottom sheet (thumb-reachable, swipe-to-dismiss) with a "Done" button.

### E8 — End-of-game vocabulary is scrambled
The trigger says **End Game**; the dialog asks **"Start a New Session?"**; the safe-ish option (back to setup, roster preserved) is a **red destructive** button labeled **New Game**; the pile is completed by purple "Restart Deck" and plain "Cancel". Red should mean *lose something*; here nothing is lost by any option. Rename to match the trigger ("End this game?"), demote colors to one accented primary + quiet secondaries.

### E9 — The thumb zone is empty and the safe areas are unmanaged
The card floats vertically centered: on a 844px-tall phone, ~200px above and below it are dead, and Next Player — tapped hundreds of times a night — sits mid-screen instead of in the thumb's arc. Meanwhile no `viewport-fit=cover` / `env(safe-area-inset-*)` handling exists, so as an installed standalone app (the manifest ships `display: standalone`) the bottom controls will crowd the home indicator. The layout should become: status strip pinned top, prompt filling the middle, control dock pinned bottom with safe-area padding.

### E10 — Micro-interaction ceiling
One entry animation (a 0.5s fade-up) is the entire choreography. Missing, in rough order of value:
- **Swipe-to-advance.** It's a *card deck* — swiping the card away (with a peek of the next card's back) is the native gesture; keep the button as parity.
- **Haptics on turn change.** The Vibration API is already used for timer-end; a single subtle pulse on next/hand-off makes each turn tactile for free.
- **`touch-action: manipulation`** on the buttons — without it, rapid Next-taps trigger iOS double-tap zoom (this *will* happen at a party).
- **`user-select: none`** on the prompt — long-pressing while passing the phone currently pops the text-selection callout.
- **Press states** beyond `active:scale-95`; a brief mode-colored flash when the deck changes level; card *dealing* (slide from deck) rather than fading in place.
- Sound is optional and should stay off by default, but a single soft "card" tick with a mute toggle would suit the vibe.

### E11 — Setup is a form, not a lobby
Functional, but the pre-game screen is where anticipation should build:
- Start is always enabled and error-toasts on failure (B5). Disable-with-hint ("Add 2 players to start") is the known fix.
- No level descriptions on the most consequential choice in the app (known-open item; NHIE gives no hint it spans all intensities including Extreme).
- Player rows are gray inputs with a small red minus (a ~40px target adjacent to text inputs). No per-player identity — assigning each player one of the neon chart colors (already in the token set: blue, green, yellow + violet/pink) would pay off later on the hand-off screen and recap.
- Eight players means a long scroll with Start off-screen — the CTA should be sticky, with live status ("Start with 4 players").

### E12 — Loading and empty states are plain text
"Charging Neon..." (a good line!) renders as unstyled centered text; "Initializing Deck..." is a bare card. Cheap wins: the logo's martini glass with a pulsing glow as the loading mark, skeleton card for the deck.

---

## 4. Accessibility & ergonomics inventory

**Failing / below bar**
- **Contrast:** header badges are 9–10px uppercase at 50% white (~4.6:1 — below the 4.5:1 floor *for normal text*, and these are tiny); `muted-foreground` at 64% gray on dark cards; footer labels 12px at 60% opacity; disabled Undo at 25% opacity (~1.9:1) is invisible in a dark room. A pass to 70%+ / larger sizes preserves the aesthetic (dim ≠ illegible).
- **Touch targets:** footer buttons are h-9 (36px) with 12px labels — below the 44px HIG floor for the three most-used secondary controls; setup's remove buttons are 40px against Android's 48dp guidance.
- **Keyboard focus:** the mode selector's radios are `sr-only` and the styled `<Label>`s carry no `focus-visible` ring — keyboard focus is invisible on the setup screen's most important control (same in the sheet).
- **Landscape** (B3) is an ergonomics failure as much as a layout one.

**Meeting the bar (keep):** `aria-live="polite"` prompt, icon-button labels, `prefers-reduced-motion` (CSS), 16px inputs, `sr-only` radio semantics.

**Small gaps:** the logo's SVG `<animate>` bubble ignores reduced-motion; no `<meta name="theme-color">` (iOS/Android browser chrome renders default gray-white around a neon app — the manifest's `theme_color` doesn't cover browser tabs on iOS); no `overscroll-behavior` guard so rubber-banding reveals the page behind the glass.

---

## 5. Visual-system notes (palette and icons stay — this is about consistency)

1. **Three competing glow recipes.** `neon-text-primary` (3 shadows), `neon-text-accent` (4 shadows, much hotter), and ad-hoc literals like `shadow-[0_0_10px_rgba(190,82,242,0.5)]` — the last hardcoding RGB duplicates of the CSS variables (theme-drift risk). Worse, the hottest glow is applied to the *smallest* text (10–12px uppercase labels like "MANAGE PLAYERS"), where blur wider than the stroke reads as smear, not neon. Codify: `--glow-sm/md/lg` scaled to type size; big display text gets big glow, labels get a whisper or none.
2. **Radius drift.** `--radius: 0.5rem` tokens vs `rounded-xl` vs `rounded-full` mixed on one screen. Pick a scale (e.g. controls 12px, cards 16px, pills full) and encode it in the token.
3. **Inter is loaded but unreachable.** The body stack puts Space Grotesk first, so Inter never renders. Either drop it (saves a font download) or — better — use it deliberately: Space Grotesk for display/brand/labels, Inter for long prompt text at large sizes, where Grotesk's quirky glyphs tire.
4. **Known collisions still open** from the Aug audit: the custom `.text-secondary` overriding Tailwind's utility; duplicated `:root`/`.dark` token blocks; dead `Header` nav placeholder.
5. **Micro-inconsistencies:** `border-white/5` vs `/10` vs `/20` on sibling surfaces; Extreme's card border is the only mode that skips the inset-glow treatment the violet/pink borders get.

---

## 6. Redesign concepts — ranked

Each stays inside the existing identity. R1 and R2 are the ones that change what the app *is*.

### R1 · "The Hand-off" — design the pass itself
After Next Player: full-screen mode-colored moment — **"PASS THE PHONE TO"** in small caps, the recipient's name huge (the one place the heaviest neon glow belongs), their player color as ambient glow, a subtle haptic pulse. Tap anywhere (or "I'm ready") deals the card with a slide-in. Solves E1, gives every turn a beat of anticipation, makes names the star, and creates a natural home for round/pacing info ("Round 3 · Card 24"). ~1 component + state; no engine changes.

### R2 · The card is the app — layout rebuild of the game screen
Three fixed zones, no scroll, ever:
- **Status strip (top, safe-area aware):** mode chip in mode color · slim deck-progress filament · players/round. Replaces the colliding three-column header entirely; the brand mark moves to the hand-off screen and setup (the logo does not need to be on screen during play — the *mode* does).
- **The card (middle, fills everything):** prompt auto-sized to length (~24–40px), type badge (E4), timer ring when applicable (R5). Swipe-to-advance with next-card peek; button parity retained.
- **Thumb dock (bottom, safe-area aware):** full-width Next Player; Undo / Group / End as 44px icon buttons with 11px labels that *fit* (fixes B1 structurally, not by shrinking text).

### R3 · Setup → Lobby
Name chips with auto-assigned neon player colors; single add-input with Enter-to-add; mode cards (not bare pills) lit in their own color with one-line description + 🌶 spice meter, NHIE labeled "all intensities, phrased as Never-Have-I-Ever"; sticky Start with live count ("Start with 4 players"); disabled-with-hint instead of error toast.

### R4 · "Last Call" finale
Deck exhaustion becomes a destination: neon celebration burst, session recap (cards played, rounds, mode(s), most-drawn player — all derivable from existing history/state), then three clear paths: Run It Back (same deck), Turn It Up (level up, roster kept), New Crew (setup). Fixes B6 and gives the night an ending worth screenshotting.

### R5 · Timer as spectacle
The detected countdown becomes a conic ring around the card (or a filament across its top): accent color draining, shifting to red inside 5s with a pulse, ending in the existing vibration plus a full-card flash. Same logic, tenfold presence.

### R6 · Resurrect the atmosphere
Fix B4's occlusion so the gradient + smoke actually render; tint the ambient layer by mode (violet night / pink haze / red heat / blue NHIE) with slow drift. Transform/opacity only, honoring the existing reduced-motion guard. The app's world stops being flat black.

---

## 7. Recommended order of work

**P0 — Broken (hours each, do before anything else)**
1. B1 footer overflow → icon-first 44px dock buttons (or R2's dock early).
2. B2 header collision → single-row grid header, remove the absolute/scaled logo hack (or adopt R2's status strip).
3. B3 landscape → `min-h` + internal scroll guarantee, controls always on-screen.
4. B4 atmosphere occlusion → drop opaque wrappers.
5. B5 toast → theme it (glass + glow, palette red-pink), move to bottom on mobile; convert setup validation to disabled-with-hint.
6. `touch-action: manipulation`, `user-select: none` on prompt, `<meta name="theme-color">`, safe-area padding, game-over header state (B6 minimal fix).

**P1 — Polish (a weekend)**
Contrast pass (§4) · 44px targets · keyboard focus rings on mode selectors · mode-colored selector states + level descriptions + NHIE note (E5/E11) · End-dialog vocabulary (E8) · bottom-sheet Manage Group with "Done" (E7) · deck-progress indicator (E3) · prompt type badges (E4) · haptic on turn change · loading states (E12).

**P2 — The redesign (in order of experiential return)**
R1 Hand-off → R2 card-first layout → R3 lobby → R4 finale → R5 timer → R6 atmosphere.

A note on sequencing: R1 is deliberately first in P2 — it's the highest experience-per-effort item in this document and it de-risks R2 by introducing the turn-beat pattern the new layout is built around.

---

## Appendix — capture inventory

16 states captured via Playwright, dev build, no console errors:

| # | State | Viewport | Findings evidenced |
|---|---|---|---|
| 01 | Setup, empty | 390×844 | E11, E12 baseline |
| 02 | Setup, validation toast | 390×844 | B5 |
| 03 | Setup, 3 names + NHIE | 390×844 | E5, E11 |
| 04 | Setup, 8 players | 390×844 | E11 (sticky CTA) |
| 05–07 | Game: Mild / Medium / Extreme | 390×844 | B1, B2 (wordmark wrap), B7, E2, E9 |
| 08–09 | Timer idle / running | 390×844 | R5 baseline |
| 10 | Long hyphenated name | 390×844 | B2 (name through logo) |
| 11 | Manage Group sheet | 390×844 | E7, §5 glow-on-labels |
| 12 | End Game dialog | 390×844 | E8 |
| 13 | Deck exhaustion | 390×844 | B6, R4 |
| 14–15 | Setup + game | 375×667 | B1, B2 at SE size |
| 16 | Game, landscape | 844×390 | B3 |
