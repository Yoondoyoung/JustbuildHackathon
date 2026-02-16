import { defineConfig } from "vite";
import { resolve } from "path";
import { cpSync, mkdirSync, copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, "src/ui/sidepanel.html"),
        service_worker: resolve(__dirname, "src/background/service_worker.ts"),
        contentScript: resolve(__dirname, "src/content/contentScript.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
  plugins: [
    {
      name: "copy-extension-assets",
      closeBundle() {
        const outDir = resolve(__dirname, "dist");
        copyFileSync(
          resolve(__dirname, "manifest.json"),
          resolve(outDir, "manifest.json"),
        );

        const iconsSrc = resolve(__dirname, "public/icons");
        const iconsDest = resolve(outDir, "icons");
        if (existsSync(iconsSrc)) {
          mkdirSync(iconsDest, { recursive: true });
          cpSync(iconsSrc, iconsDest, { recursive: true });
        }

        // Side panel is at dist/src/ui/sidepanel.html; fix asset paths to be relative
        const sidepanelPath = resolve(outDir, "src/ui/sidepanel.html");
        if (existsSync(sidepanelPath)) {
          let html = readFileSync(sidepanelPath, "utf-8");
          html = html.replace(/(href|src)="\/(?!\/)/g, '$1="../../');
          writeFileSync(sidepanelPath, html);
        }
      },
    },
  ],
});
