'use strict';

/**
 * The saved game: how it is written, how it is read back, and what happens to
 * a record that has been tampered with, corrupted, or left over from an older
 * build. Everything here exercises the boundary in `src/lib/session.ts` through
 * a real browser rather than a stub.
 */

const { makeCheck, freshContext, bodyText, storageItem, savedGame, cardText, settledCard, addPlayers } = require('./lib');

module.exports = async function session(browser, BASE, results) {
  const check = makeCheck(results);

  // --- Setup to play to refresh, with the card intact -----------------------
  let context = await freshContext(browser);
  let page = await context.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await addPlayers(page, ['Alex', 'Sam', 'Jordan']);
  await page.locator('label[for="nsfw-extreme"]').click();
  await page.getByRole('button', { name: /^Start with 3 players$/ }).click();
  await page.waitForURL('**/game', { timeout: 5000 });
  await page.waitForTimeout(500);
  check('Start navigates to a bare /game, with no query string', new URL(page.url()).search === '', page.url());

  let previous;
  for (let i = 0; i < 3; i++) {
    previous = await settledCard(page, { not: previous });
    await page.getByRole('button', { name: /next/i }).first().click();
  }
  // Wait for the last deal to land before reading either the screen or the
  // record, so the two are never sampled from different renders.
  const before = await settledCard(page, { not: previous });
  const first = await savedGame(page);
  check('The saved game records deck progress', first.usedPromptIds.length === 3, `used: ${first.usedPromptIds.length}`);
  check('The saved game holds the roster', JSON.stringify(first.players) === '["Alex","Sam","Jordan"]', JSON.stringify(first.players));

  await page.reload({ waitUntil: 'networkidle' });
  const onScreen = await cardText(page, { expect: before });
  const after = await savedGame(page);
  check('A refresh keeps the same card on screen', onScreen === before, JSON.stringify(before.slice(0, 55)));
  check('A refresh keeps deck progress', after.usedPromptIds.length === 3, `used: ${after.usedPromptIds.length}`);
  check('A refresh keeps whose turn it is', after.currentPlayerIndex === first.currentPlayerIndex);
  check('A refresh keeps the turn tally', JSON.stringify(after.turnsByName) === JSON.stringify(first.turnsByName), JSON.stringify(after.turnsByName));

  await page.getByRole('button', { name: /undo/i }).first().click();
  await page.waitForTimeout(300);
  check('Undo works against the restored history', (await savedGame(page)).usedPromptIds.length === 2);
  await context.close();

  // --- Resume from the home screen -----------------------------------------
  context = await freshContext(browser);
  page = await context.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await addPlayers(page, ['Ash', 'Robin']);
  await page.getByRole('button', { name: /^Start with 2 players$/ }).click();
  await page.waitForURL('**/game');
  await page.getByRole('button', { name: /next/i }).first().click();
  await page.waitForTimeout(300);
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  let home = await bodyText(page);
  check('Home offers to resume a game in progress', home.includes('Game in progress') && /2 players/.test(home));
  await page.getByRole('button', { name: /^Resume$/ }).click();
  await page.waitForURL('**/game');
  await page.waitForTimeout(500);
  check('Resume continues the game rather than restarting it', (await savedGame(page)).usedPromptIds.length === 1);
  await context.close();

  // --- Back to Setup ends the game and keeps the crew ----------------------
  context = await freshContext(browser);
  page = await context.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await addPlayers(page, ['Kai', 'Noor', 'Wren']);
  await page.getByRole('button', { name: /^Start with 3 players$/ }).click();
  await page.waitForURL('**/game');
  await page.getByRole('button', { name: /next/i }).first().click();
  await page.waitForTimeout(250);
  await page.getByRole('button', { name: /^end$/i }).click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: /back to setup/i }).click();
  await page.waitForURL((url) => new URL(url).pathname === '/');
  await page.waitForTimeout(500);
  home = await bodyText(page);
  check('Back to Setup lands on a bare /', page.url().replace(BASE, '') === '/', page.url());
  check('Back to Setup keeps the crew', ['Kai', 'Noor', 'Wren'].every((n) => home.includes(n)));
  check('Back to Setup clears the saved game', (await storageItem(page, 'afterhours.game')) === null);
  check('Back to Setup offers no resume', !home.includes('Game in progress'));
  await context.close();

  // --- Name validation at the setup screen ---------------------------------
  context = await freshContext(browser);
  page = await context.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await addPlayers(page, ['Sam', 'sam']);
  await page.waitForTimeout(300);
  let chips = await page.locator('main ul li span.truncate').allInnerTexts();
  check('A case-insensitive duplicate is refused', chips.length === 1 && chips[0] === 'Sam', JSON.stringify(chips));
  check('The refusal explains itself', (await bodyText(page)).includes('already in'));

  await page.fill('#add-player', 'x'.repeat(120));
  check('maxLength caps what can be typed or pasted', (await page.inputValue('#add-player')).length === 20);
  await page.press('#add-player', 'Enter');
  await page.waitForTimeout(200);
  chips = await page.locator('main ul li span.truncate').allInnerTexts();
  check('A long name is stored at the cap', chips[1] && chips[1].length === 20, String(chips[1] && chips[1].length));

  // A right-to-left override and a zero-width space, set the way a paste would.
  await page.evaluate(() => {
    const input = document.querySelector('#add-player');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, String.fromCharCode(0x202e) + 'Zoe' + String.fromCharCode(0x200b));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.press('#add-player', 'Enter');
  await page.waitForTimeout(200);
  chips = await page.locator('main ul li span.truncate').allInnerTexts();
  check('Bidi and zero-width characters are stripped from a name', chips[2] === 'Zoe', JSON.stringify(chips[2]));
  await context.close();

  // --- A restored card must keep naming the same person --------------------
  // Regression guard. `{{randomOtherPlayer}}` is substituted at draw time, so
  // a restore that re-derives the text instead of using the stored copy picks
  // a different player — the card silently changes who it is pointing at
  // between one refresh and the next. Four players, so a re-roll has a two in
  // three chance of showing up on any given load.
  {
    const CARD = 602; // "...Demonstrate it on {{randomOtherPlayer}}."
    const stored = "What emoji do you send when you're flirting? Demonstrate it on Sam.";
    context = await freshContext(browser, {
      'afterhours.game': JSON.stringify({
        v: 1, savedAt: Date.now(), players: ['Alex', 'Sam', 'Jordan', 'Riley'], nsfwLevel: 'Mild',
        currentPlayerIndex: 0, currentPromptId: CARD, processedPromptText: stored,
        usedPromptIds: [1, 2, 3], upcomingTurns: [1, 2, 3], turnsByName: { Alex: 1 },
        history: [], gameEnded: false,
      }),
    });
    page = await context.newPage();
    const rendered = new Set();
    for (let i = 0; i < 8; i++) {
      await page.goto(BASE + '/game', { waitUntil: 'networkidle' });
      rendered.add(await cardText(page, { expect: stored }));
    }
    check('A restored card names the same player on every load',
      rendered.size === 1 && rendered.has(stored),
      [...rendered].map((t) => JSON.stringify(t.slice(-24))).join(' vs '));
    await context.close();
  }

  // --- A legacy play URL still opens, and cleans up after itself -----------
  context = await freshContext(browser);
  page = await context.newPage();
  await page.goto(BASE + '/game?player=Alex&player=Sam&player=Jordan&nsfwLevel=Extreme', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  check('A legacy /game link still starts a game', /Alex|Sam|Jordan/.test(await bodyText(page)));
  check('A legacy /game link is scrubbed from the address bar', new URL(page.url()).search === '', page.url());
  const migrated = await savedGame(page);
  check('A legacy /game link is migrated into storage',
    JSON.stringify(migrated.players) === '["Alex","Sam","Jordan"]' && migrated.nsfwLevel === 'Extreme');
  await context.close();

  context = await freshContext(browser);
  page = await context.newPage();
  await page.goto(BASE + '/game?' + Array.from({ length: 500 }, (_, i) => `player=P${i}`).join('&'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  check('A 500-name link is capped at ten players', (await savedGame(page)).players.length === 10);
  await context.close();

  // --- Records that must never reach the game screen -----------------------
  const rejected = {
    'not JSON at all': '{{{',
    'a newer schema version': JSON.stringify({ v: 99, savedAt: Date.now(), players: ['A', 'B'], nsfwLevel: 'Mild' }),
    'an expired record': JSON.stringify({ v: 1, savedAt: Date.now() - 13 * 3600 * 1000, players: ['A', 'B'], nsfwLevel: 'Mild', usedPromptIds: [1] }),
    'an unknown game mode': JSON.stringify({ v: 1, savedAt: Date.now(), players: ['A', 'B'], nsfwLevel: 'Nuclear', usedPromptIds: [1] }),
    'a roster below the minimum': JSON.stringify({ v: 1, savedAt: Date.now(), players: ['A'], nsfwLevel: 'Mild', usedPromptIds: [1] }),
    'a roster that is not an array': JSON.stringify({ v: 1, savedAt: Date.now(), players: 'Alex', nsfwLevel: 'Mild' }),
  };
  for (const [label, value] of Object.entries(rejected)) {
    context = await freshContext(browser, { 'afterhours.game': value });
    page = await context.newPage();
    await page.goto(BASE + '/game', { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    check(`Bounced to setup: ${label}`, new URL(page.url()).pathname === '/', page.url());
    await context.close();
  }

  // --- A hostile record is repaired into something playable ----------------
  context = await freshContext(browser, {
    'afterhours.game': JSON.stringify({
      v: 1, savedAt: Date.now(), players: ['A', 'B'], nsfwLevel: 'Mild',
      currentPlayerIndex: 99, upcomingTurns: [0, 7, 1, -3], usedPromptIds: [1, 'x', 2.5, -1, 1],
      currentPromptId: 99999, turnsByName: { A: -4, B: 3, C: 'nope' },
      history: [{ promptId: 1, playerIndex: 42 }], processedPromptText: 'z'.repeat(9000), gameEnded: false,
    }),
  });
  page = await context.newPage();
  await page.goto(BASE + '/game', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  check('A hostile record loads a playable game instead of crashing', new URL(page.url()).pathname === '/game', page.url());
  const repaired = await savedGame(page);
  check('An out-of-range seat is clamped', repaired.currentPlayerIndex >= 0 && repaired.currentPlayerIndex < 2);
  check('Out-of-range queue entries are dropped', repaired.upcomingTurns.every((n) => n >= 0 && n < 2), JSON.stringify(repaired.upcomingTurns));
  check('Non-integer prompt ids are dropped', repaired.usedPromptIds.every(Number.isInteger), JSON.stringify(repaired.usedPromptIds));
  check('A card id that has left the deck is replaced, not left blank',
    (await cardText(page)).length > 0 && repaired.currentPromptId !== null, `id: ${repaired.currentPromptId}`);
  check('Oversized card text is bounded', repaired.processedPromptText.length <= 240, `${repaired.processedPromptText.length} chars`);
  await context.close();
};
