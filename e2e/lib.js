'use strict';

/** Shared helpers for the browser suites. */

const MIN_CONTRAST = 4.5;

/** Records results for one suite and prints them as they happen. */
function makeCheck(results) {
  return function check(name, ok, extra = '') {
    results.push({ name, ok });
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`);
  };
}

/**
 * A context that has already cleared the age gate, optionally pre-seeded with
 * localStorage. Phone-sized, because that is how this game is played.
 */
async function freshContext(browser, seed) {
  const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
  await context.addInitScript((entries) => {
    localStorage.setItem('afterhours.ageConfirmed', 'true');
    if (entries) for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
  }, seed || null);
  return context;
}

const bodyText = (page) => page.evaluate(() => document.body.innerText);
const storageItem = (page, key) => page.evaluate((k) => localStorage.getItem(k), key);
const savedGame = async (page) => JSON.parse(await storageItem(page, 'afterhours.game'));

/**
 * The card currently on screen — read as the one long line in the body rather
 * than through a class name that restyling could change.
 *
 * It *waits* for the card instead of sampling whatever happens to be rendered
 * at the instant it is called. A restored game paints the HUD a frame or two
 * before the prompt effect has run, and a timed card runs an extra effect on
 * top of that; sampling into that gap made a refresh look as though it had
 * lost the card. Pass `expect` to wait for a specific card, or `not` to wait
 * for the card to change.
 */
/**
 * The card on screen, once the saved game has caught up with it.
 *
 * Waiting on the DOM alone is not enough before a reload: React paints a new
 * card and only afterwards flushes the effect that writes it to storage, so a
 * reload can land in the gap and legitimately restore the *previous* card.
 * Waiting for the record to agree with the screen closes that window — and is
 * itself worth asserting, since "the record tracks the screen" is the property
 * the whole resume feature rests on.
 */
async function settledCard(page, { not } = {}) {
  await page
    .waitForFunction(
      (not) => {
        const line = document.body.innerText.split('\n').find((l) => l.length > 25);
        if (!line) return false;
        if (not !== undefined && line === not) return false;
        try {
          const saved = JSON.parse(localStorage.getItem('afterhours.game') || 'null');
          return Boolean(saved) && saved.processedPromptText === line;
        } catch {
          return false;
        }
      },
      not,
      { timeout: 5000 },
    )
    .catch(() => {});
  return (await bodyText(page)).split('\n').filter((line) => line.length > 25)[0] || '';
}

async function cardText(page, { expect: want, not } = {}) {
  await page
    .waitForFunction(
      ({ want, not }) => {
        const line = document.body.innerText.split('\n').find((l) => l.length > 25);
        if (!line) return false;
        if (want !== undefined) return line === want;
        if (not !== undefined) return line !== not;
        return true;
      },
      { want, not },
      { timeout: 5000 },
    )
    // A timeout is not an error here: return whatever is on screen and let the
    // assertion in the spec be the thing that fails, with the real text.
    .catch(() => {});
  return (await bodyText(page)).split('\n').filter((line) => line.length > 25)[0] || '';
}

async function addPlayers(page, names) {
  for (const name of names) {
    await page.fill('#add-player', name);
    await page.press('#add-player', 'Enter');
  }
}

module.exports = { MIN_CONTRAST, makeCheck, freshContext, bodyText, storageItem, savedGame, cardText, settledCard, addPlayers };
