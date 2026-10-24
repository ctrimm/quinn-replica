import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    hookTimeout: 240_000,
    testTimeout: 60_000,
  },
});
