import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: path.join(__dirname, "src"),
  build: {
    outDir: path.join(__dirname, "dist"),
    emptyOutDir: false,
    minify: false,
    rollupOptions: {
      input: {
        popup: new URL("./src/popup/index.html", import.meta.url).pathname,
        background: path.resolve(__dirname, "src", "background/main.ts"),
      },
      output: {
        entryFileNames: "[name]/main.js",
      },
    },
  },
});
