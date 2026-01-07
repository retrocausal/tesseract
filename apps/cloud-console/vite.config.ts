import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

export default defineConfig({
  base: "/apps/cloud-console",
  plugins: [
    tsconfigPaths({
      // THE FIX: Use 'resolve' to force absolute paths.
      // This tells the plugin exactly where the files are, ignoring process.cwd()
      projects: [
        resolve(__dirname, "../../tsconfig.base.json"),
        resolve(__dirname, "tsconfig.json"),
      ],
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: {
      clientPort: 5111,
    },
    allowedHosts: ["tesseract.schrodingers.cat"],
  },
  build: {
    outDir: resolve(__dirname, "../../dist/cloud-console"),
    emptyOutDir: true,
  },
});
