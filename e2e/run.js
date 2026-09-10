'use strict';

/**
 * The browser suite. Builds nothing and installs nothing: it expects a
 * production build on disk, serves it on a spare port, and runs each spec
 * against it.
 *
 *   npm run build && npm run test:e2e
 *
 * This is the slow half of the test suite and is not wired into CI. Run it
 * when a change is structural — the game loop, the saved game, routing, or
 * anything visual — rather than after every edit. `npm test` is the fast half
 * and should be run freely.
 */

const { existsSync } = require('node:fs');
const { spawn } = require('node:child_process');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.E2E_PORT || 9123);
const BASE = `http://127.0.0.1:${PORT}`;
const SPECS = [
  ['saved game and input validation', require('./session')],
  ['a full night of play', require('./play')],
  ['WCAG AA text contrast', require('./contrast')],
];

function loadPlaywright() {
  try {
    return require('playwright');
  } catch {
    console.error(
      'Playwright is not installed. It is deliberately not a dependency of this\n' +
        'repo — it pulls a browser down with it, and the browser suite is meant to\n' +
        'be run occasionally rather than on every change.\n\n' +
        '  npm i -D playwright && npx playwright install chromium\n\n' +
        'If Playwright is installed globally, point Node at it instead:\n' +
        '  NODE_PATH=$(npm root -g) npm run test:e2e',
    );
    process.exit(1);
  }
}

async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE + '/');
      if (response.ok) return true;
    } catch {
      // Not listening yet.
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

(async () => {
  if (!existsSync(path.join(ROOT, '.next', 'BUILD_ID'))) {
    console.error('No production build found. Run `npm run build` first.');
    process.exit(1);
  }

  const { chromium } = loadPlaywright();
  // Next's own bin, run directly rather than through npx: npx wraps it in a
  // shell, and killing the wrapper leaves the real server holding the port.
  const server = spawn(process.execPath, [path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next'), 'start', '-p', String(PORT)], {
    cwd: ROOT,
    stdio: 'ignore',
  });
  const stop = () => {
    try {
      server.kill('SIGKILL');
    } catch {
      // Already gone.
    }
  };
  process.on('exit', stop);
  process.on('SIGINT', () => {
    stop();
    process.exit(130);
  });

  if (!(await waitForServer())) {
    stop();
    console.error(`Server never came up on ${BASE}. Is the port already in use?`);
    process.exit(1);
  }

  // Set when the browser is not where Playwright expects it, e.g. a container
  // that ships Chromium separately.
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const results = [];
  let crashed = null;

  try {
    for (const [name, spec] of SPECS) {
      console.log(`\n${name}`);
      await spec(browser, BASE, results);
    }
  } catch (error) {
    crashed = error;
  } finally {
    await browser.close().catch(() => {});
    stop();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
  if (crashed) {
    console.error('\nThe suite crashed before it finished:\n', crashed.stack || crashed.message);
    process.exit(1);
  }
  process.exit(failed.length ? 1 : 0);
})();
