'use strict';

/**
 * A full night of play, end to end: twenty ordinary cards, a skip, roster edits
 * mid-game, the deck running out, and a refresh on the finale. This is the
 * suite that catches a regression in the game loop itself rather than in one
 * function.
 */

const { makeCheck, freshContext, bodyText, savedGame, cardText } = require('./lib');

module.exports = async function play(browser, BASE, results) {
  const check = makeCheck(results);
  const context = await freshContext(browser);
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // Chromium refuses navigator.vibrate() before the page has been tapped and
  // logs it at error level. The finale fires a haptic on mount, so a refresh
  // there trips it; nothing throws and the call is already feature-guarded.
  const BENIGN = /navigator\.vibrate because user hasn't tapped/;
  page.on('console', (m) => {
    if (m.type() === 'error' && !BENIGN.test(m.text())) errors.push('console: ' + m.text());
  });

  // Mild is the smallest deck, so the finale is reachable inside one run.
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  for (const name of ['Alex', 'Sam', 'Jordan']) {
    await page.fill('#add-player', name);
    await page.press('#add-player', 'Enter');
  }
  await page.getByRole('button', { name: /^Start with 3 players$/ }).click();
  await page.waitForURL('**/game');
  await page.waitForTimeout(400);

  const seen = new Set();
  for (let i = 0; i < 20; i++) {
    seen.add(await cardText(page));
    await page.getByRole('button', { name: /next/i }).first().click();
    await page.waitForTimeout(160);
  }
  let record = await savedGame(page);
  check('Twenty cards deal without a repeat', seen.size === 20, `${seen.size} distinct`);
  check('The record tracks the deck', record.usedPromptIds.length === 20);
  check('The tally sums to the cards played',
    Object.values(record.turnsByName).reduce((a, b) => a + b, 0) === 20, JSON.stringify(record.turnsByName));
  check('The card on screen is not already spent',
    record.currentPromptId !== null && !record.usedPromptIds.includes(record.currentPromptId));

  const beforeSkip = record;
  await page.getByRole('button', { name: /^skip$/i }).click();
  await page.waitForTimeout(250);
  const afterSkip = await savedGame(page);
  check('Skip consumes a card without counting a turn',
    afterSkip.usedPromptIds.length === beforeSkip.usedPromptIds.length + 1 &&
      JSON.stringify(afterSkip.turnsByName) === JSON.stringify(beforeSkip.turnsByName));
  check('Skip keeps the same player up', afterSkip.currentPlayerIndex === beforeSkip.currentPlayerIndex);

  const skipped = await cardText(page);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  check('A refresh after a skip keeps the card', (await cardText(page)) === skipped);

  // --- Roster edits mid-game -----------------------------------------------
  await page.getByRole('button', { name: /^group$/i }).click();
  await page.waitForTimeout(400);
  await page.getByLabel('New player name').fill('Riley');
  await page.getByRole('button', { name: /^add player$/i }).click();
  await page.waitForTimeout(300);
  await page.getByLabel('New player name').fill('riley');
  await page.getByRole('button', { name: /^add player$/i }).click();
  await page.waitForTimeout(300);
  record = await savedGame(page);
  check('A player added mid-game persists', record.players.length === 4 && record.players[3] === 'Riley', JSON.stringify(record.players));
  check('A duplicate added mid-game is refused', record.players.filter((p) => p.toLowerCase() === 'riley').length === 1);

  await page.getByRole('button', { name: 'Remove Sam' }).click();
  await page.waitForTimeout(300);
  record = await savedGame(page);
  check('A player removed mid-game persists', record.players.length === 3 && !record.players.includes('Sam'), JSON.stringify(record.players));
  check('Seat numbers stay in range after a removal',
    record.currentPlayerIndex < record.players.length && record.upcomingTurns.every((n) => n < record.players.length));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  const usedBefore = (await savedGame(page)).usedPromptIds.length;
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  record = await savedGame(page);
  check('Roster edits survive a refresh',
    record.players.length === 3 && !record.players.includes('Sam') && record.usedPromptIds.length === usedBefore);

  // --- Run the deck out ----------------------------------------------------
  for (let i = 0; i < 120; i++) {
    const next = page.getByRole('button', { name: /next/i }).first();
    if (!(await next.isVisible().catch(() => false))) break;
    await next.click();
    await page.waitForTimeout(90);
  }
  check('Running the deck out reaches the finale', (await bodyText(page)).includes('Last Call'));
  check('The finale is recorded as ended', (await savedGame(page)).gameEnded === true);

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  check('A refresh on the finale stays on the finale', (await bodyText(page)).includes('Last Call'));

  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  check('A finished night is not offered as a resume', !(await bodyText(page)).includes('Game in progress'));

  check('No page errors during the whole run', errors.length === 0, errors.slice(0, 2).join(' | '));
  await context.close();
};
