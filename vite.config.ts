import { defineConfig } from "vite";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/",
  plugins: [
    // This plugin reads the root tsconfig.json, sees the reference
    // to apps/cloud-console, and automatically resolves '@cloud/*'
    tsconfigPaths(),
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5111,
      port: 5173,
    },
    allowedHosts: ["tesseract.schrodingers.cat"],
  },
  build: {
    rollupOptions: {
      input: {
        cloudConsole: resolve(__dirname, "apps/cloud-console/index.html"),
      },
    },
  },
});
