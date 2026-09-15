/**
 * Anonymous prompt feedback — the curation signal for the deck.
 *
 * A 👍 or 👎 on a card increments an anonymous per-card counter so the deck can
 * be tuned by what actually lands. It carries the card's numeric id and the
 * vote direction, nothing else: no name, no account, no device id, no history
 * of what you saw. The 👎 also hides the card on this device (that part is
 * `session.ts` / the reducer; this module only reports the vote).
 *
 * Opt-in, exactly like Sentry (`monitoring.ts`): the two `NEXT_PUBLIC_FIREBASE_*`
 * values below are absent by default, so `sendPromptFeedback` is a no-op and no
 * network request is ever made — local play and the hide feature work
 * regardless. Set both in the environment (and deploy `firestore.rules`) to turn
 * the signal on. The write is a single atomic increment via the Firestore REST
 * API, so no Firebase SDK is bundled and the home-page budget is untouched.
 *
 * It is fire-and-forget by design: feedback must never interrupt, delay, or fail
 * a game, so every error is swallowed.
 */

export type Vote = 'up' | 'down';

// Read at call time rather than module load so the values are easy to stub in a
// test; Next inlines NEXT_PUBLIC_* at build either way.
const config = () => ({
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
});

/** True only when both values are set, so the UI can hide the vote affordance. */
export const feedbackEnabled = (): boolean => {
  const { projectId, apiKey } = config();
  return Boolean(projectId && apiKey);
};

/**
 * The Firestore REST `:commit` for a single atomic increment. An `update` write
 * carrying only the document name plus `updateTransforms`, with no precondition,
 * creates the counter on first vote and increments it thereafter — the
 * documented distributed-counter pattern, no SDK required.
 */
export function buildCommit(projectId: string, promptId: number, vote: Vote) {
  const doc = `projects/${projectId}/databases/(default)/documents/promptStats/${promptId}`;
  return {
    writes: [
      {
        update: { name: doc },
        updateTransforms: [{ fieldPath: vote, increment: { integerValue: '1' } }],
      },
    ],
  };
}

/**
 * Report a vote for a card. No-op when feedback is not configured, off the main
 * thread, and never throws.
 */
export function sendPromptFeedback(promptId: number, vote: Vote): void {
  const { projectId, apiKey } = config();
  if (!projectId || !apiKey) return;
  if (typeof fetch === 'undefined') return;
  if (!Number.isInteger(promptId)) return;

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit?key=${apiKey}`;
  try {
    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildCommit(projectId, promptId, vote)),
      // Let the write survive a page the user navigates away from mid-tap.
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Fire-and-forget: a thrown fetch (blocked, offline) never reaches play.
  }
}
