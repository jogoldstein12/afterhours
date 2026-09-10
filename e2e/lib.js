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

/** The longest line on screen, which on the play screen is the card. */
const cardText = async (page) =>
  (await bodyText(page)).split('\n').filter((line) => line.length > 25)[0] || '';

async function addPlayers(page, names) {
  for (const name of names) {
    await page.fill('#add-player', name);
    await page.press('#add-player', 'Enter');
  }
}

module.exports = { MIN_CONTRAST, makeCheck, freshContext, bodyText, storageItem, savedGame, cardText, addPlayers };
