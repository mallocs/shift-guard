import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: path.join(__dirname, "src"),
  build: {
    emptyOutDir: false,
    outDir: path.resolve(__dirname, "dist"),
    minify: false,
    lib: {
      formats: ["iife"],
      entry: path.resolve(__dirname, "src/content-scripts/main.js"),
      name: "shiftguard",
    },
    rollupOptions: {
      output: {
        entryFileNames: "content-scripts/main.js",
        // extend: true,
      },
    },
  },
});
