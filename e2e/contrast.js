'use strict';

/**
 * WCAG 2.1 AA text contrast, measured off the rendered page rather than read
 * off the stylesheet — the app layers translucent whites over translucent
 * panels over a near-black page, and the only reliable way to know what a
 * ratio really is, is to composite what the browser actually computed.
 *
 * Two known limits, both of which make this stricter rather than laxer:
 * `background-image` (the Atmosphere gradients) is not composited, and an
 * ancestor `opacity` is folded into the text alpha but not into the panel
 * behind it.
 */

const { MIN_CONTRAST, makeCheck, freshContext, addPlayers } = require('./lib');

/** Runs in the page: returns every visible text run that misses AA. */
const AUDIT = (minRatio) => {
  const parse = (css) => {
    const m = String(css).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a] = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r, g, b, a: a === undefined ? 1 : a };
  };
  const composite = (fg, bg) => ({
    r: fg.a * fg.r + (1 - fg.a) * bg.r,
    g: fg.a * fg.g + (1 - fg.a) * bg.g,
    b: fg.a * fg.b + (1 - fg.a) * bg.b,
    a: 1,
  });
  const luminance = ({ r, g, b }) => {
    const f = (v) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (x, y) => {
    const [hi, lo] = [luminance(x), luminance(y)].sort((a, b) => b - a);
    return (hi + 0.05) / (lo + 0.05);
  };

  const backgroundBehind = (el) => {
    const layers = [];
    for (let node = el; node; node = node.parentElement) {
      const colour = parse(getComputedStyle(node).backgroundColor);
      if (colour && colour.a > 0) layers.push(colour);
      if (colour && colour.a === 1) break;
    }
    let bg = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) bg = composite(layers[i], bg);
    return bg;
  };

  const opacityChain = (el) => {
    let total = 1;
    for (let node = el; node; node = node.parentElement) total *= Number(getComputedStyle(node).opacity);
    return total;
  };

  const findings = [];
  for (const el of document.querySelectorAll('body *')) {
    // Only elements that render text themselves.
    const own = [...el.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent.trim())
      .join(' ')
      .trim();
    if (!own) continue;
    // Content hidden from assistive technology is decoration, not text.
    if (el.closest('[aria-hidden="true"]')) continue;
    // WCAG 1.4.3 exempts an inactive user interface component. Anything a
    // disabled control still needs to say has to be said some other way.
    if (el.closest(':disabled, [aria-disabled="true"]')) continue;
    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') continue;
    const box = el.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) continue;

    const colour = parse(style.color);
    if (!colour) continue;
    const alpha = colour.a * opacityChain(el);
    if (alpha === 0) continue;

    const bg = backgroundBehind(el);
    const value = ratio(composite({ ...colour, a: alpha }, bg), bg);

    // WCAG large text: 18.66px+ bold, or 24px+ at any weight.
    const size = parseFloat(style.fontSize);
    const bold = Number(style.fontWeight) >= 700;
    const threshold = size >= 24 || (bold && size >= 18.66) ? 3 : minRatio;

    if (value < threshold) {
      findings.push({
        text: own.slice(0, 42),
        ratio: Math.round(value * 100) / 100,
        threshold,
        size,
        colour: style.color,
        classes: el.className.toString().slice(0, 60),
      });
    }
  }
  return findings;
};

module.exports = async function contrast(browser, BASE, results) {
  const check = makeCheck(results);
  const context = await freshContext(browser);
  const page = await context.newPage();

  const audit = async (label) => {
    const findings = await page.evaluate(AUDIT, MIN_CONTRAST);
    const detail = findings
      .slice(0, 6)
      .map((f) => `"${f.text}" ${f.ratio}:1 (needs ${f.threshold}) ${f.colour}`)
      .join(' | ');
    check(`Every text run meets AA: ${label}`, findings.length === 0, detail);
  };

  // The age gate is the first thing anyone sees, so it is audited before it is
  // dismissed — with a context that has not confirmed anything.
  const gateContext = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const gatePage = await gateContext.newPage();
  await gatePage.goto(BASE + '/', { waitUntil: 'networkidle' });
  await gatePage.waitForTimeout(400);
  const gateFindings = await gatePage.evaluate(AUDIT, MIN_CONTRAST);
  check('Every text run meets AA: age gate', gateFindings.length === 0,
    gateFindings.slice(0, 4).map((f) => `"${f.text}" ${f.ratio}:1`).join(' | '));
  await gateContext.close();

  await page.goto(BASE + '/terms', { waitUntil: 'networkidle' });
  await audit('terms');
  await page.goto(BASE + '/privacy', { waitUntil: 'networkidle' });
  await audit('privacy');

  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await audit('setup, empty');

  await addPlayers(page, ['Alex', 'Sam', 'Jordan']);
  await page.waitForTimeout(200);
  await audit('setup, with a roster');

  // Every mode, because each one repaints the chips, pills and spice meter.
  for (const mode of ['mild', 'medium', 'extreme', 'nhie']) {
    await page.locator(`label[for="nsfw-${mode}"]`).click();
    await page.waitForTimeout(200);
    await audit(`setup, ${mode} selected`);
  }

  for (const mode of ['mild', 'medium', 'extreme', 'nhie']) {
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    // A reload only restores the crew once a game has been started, so the
    // roster is entered fresh each time round.
    const chips = await page.locator('main ul li span.truncate').count();
    if (chips === 0) await addPlayers(page, ['Alex', 'Sam', 'Jordan']);
    await page.locator(`label[for="nsfw-${mode}"]`).click();
    await page.getByRole('button', { name: /^Start with 3 players$/ }).click();
    await page.waitForURL('**/game');
    await page.waitForTimeout(500);
    // The first card has no history, so Undo is disabled here — which is the
    // state the audit flagged.
    await audit(`play screen, ${mode}, Undo disabled`);

    await page.getByRole('button', { name: /next/i }).first().click();
    await page.waitForTimeout(300);
    await audit(`play screen, ${mode}, mid-game`);

    await page.getByRole('button', { name: /^group$/i }).click();
    await page.waitForTimeout(400);
    await audit(`game settings sheet, ${mode}`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  await context.close();
};
