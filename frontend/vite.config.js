import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxies /api requests to the backend during local dev so the frontend
// can call relative paths without dealing with CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
