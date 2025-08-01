import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  build: {
    outDir: "../backend/dist", // <-- This is the correct place!
    emptyOutDir: true,         // Optional: clear the output folder before build
  },
});
