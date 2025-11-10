import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chromium', // Deprecated in Vitest 3, but Vitest 4.x has bugs with headless mode
      provider: 'playwright',
      headless: true,
    },
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});

// Note: We're using Vitest 3.x instead of 4.x because:
// - Vitest 4.x @vitest/browser-playwright doesn't properly pass headless configuration
// - Browser launches in headed mode even with headless: true in launch config
// - This causes "Missing X server or $DISPLAY" errors in CI environments
// - Once Vitest 4.x fixes the headless bug, we can upgrade to the new instances API
