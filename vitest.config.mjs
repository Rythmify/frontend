import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));
const compiledRoot = resolve(rootDir, "./.vitest-out/src");

export default defineConfig({
  root: resolve(rootDir, "./.vitest-out"),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": compiledRoot,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./.vitest-out/src/test/setup.js"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
