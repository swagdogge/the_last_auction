import { fileURLToPath } from "node:url";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// A static, server-free build for Firebase Hosting. No Base44 plugin, no
// Cloudflare worker: the game is a single-page app in the browser.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Only Base44's error capture imports this; the static build never runs it.
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
});