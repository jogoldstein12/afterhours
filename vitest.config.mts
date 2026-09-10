import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    // Matches the `@/*` path alias in tsconfig.json.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    // Pure logic only — nothing here touches the DOM, so there is no reason to
    // pay for jsdom. The one module that reads `window.localStorage` stubs it.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
