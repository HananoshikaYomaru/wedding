import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ["path"],
    }),
  ],

  // repo name
  base: "/wedding/",

  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
      "onnxruntime-web/all": path.join(
        process.cwd(),
        "node_modules/onnxruntime-web/dist/ort.all.bundle.min.mjs"
      ),
    },
  },

  optimizeDeps: {
    exclude: ["onnxruntime-web"],
  },

  server: {
    port: 3000,
  },
});
