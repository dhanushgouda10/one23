import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // sockjs-client expects Node's `global` — without this the app can show a blank page
  define: {
    global: "globalThis"
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true
      },
      "/ws": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true
      }
    }
  }
});
