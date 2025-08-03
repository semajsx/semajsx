import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Browser mode configuration (Vitest 3.x syntax)
    browser: {
      enabled: true,
      instances: [
        {
          browser: "chromium",
        },
      ],
      provider: "playwright",
      headless: true,
    },

    // Include browser test files
    include: [
      "packages/**/*.browser.test.{js,ts,tsx}",
      "packages/**/*.component.test.{js,ts,tsx}",
    ],

    // Global setup
    globals: true,

    // Reporter
    reporters: ["verbose"],

    // Coverage (disabled for now)
    coverage: {
      enabled: false,
    },
  },
});
