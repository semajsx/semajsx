import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chromium', // Note: deprecated in Vitest 3, will migrate to instances when stable
      provider: 'playwright',
      headless: true,
    },
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
