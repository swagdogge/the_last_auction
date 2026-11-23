import { fileURLToPath } from "node:url";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Static HTML5 build for itch.io. Everything is relative so the game works
// from itch's game mirror, and no server, Base44, or Cloudflare code is used.
export default defineConfig({
  base: "./",
  define: {
    "import.meta.env.VITE_ITCH_STATIC": JSON.stringify("1"),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "cloudflare:workers": fileURLToPath(
        new URL("./firebase/cloudflare-workers-stub.js", import.meta.url),
      ),
    },
  },
  plugins: [
    tanstackStart({
      srcDirectory: "src",
      spa: { enabled: true },
    }),
    react(),
  ],
  build: {
    outDir: "dist/itch",
    emptyOutDir: true,
  },
});
