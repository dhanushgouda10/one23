import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // sockjs-client (used for the WebSocket connection) expects a Node-style
  // `global` variable. Browsers call it `globalThis`, so we map one to the other.
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
});
