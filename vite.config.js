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
        popup: path.resolve(__dirname, "src", "popup/index.html"),
        background: path.resolve(__dirname, "src", "background/main.js"),
      },
      output: {
        entryFileNames: "[name]/main.js",
      },
    },
  },
});
