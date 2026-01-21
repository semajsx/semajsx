import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Tests requiring DOM or framework dependencies
    exclude: ["src/react.test.ts", "src/vue.test.ts", "src/inject.test.ts", "src/registry.test.ts"],
  },
});
