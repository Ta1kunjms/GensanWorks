
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import path from "path";

import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
// Statically import optional plugins
// Use require for optional plugins for CJS/TypeScript compatibility
let cartographer, devBanner;
try {
  cartographer = require("@replit/vite-plugin-cartographer");
} catch (e) {
  cartographer = null;
}
try {
  devBanner = require("@replit/vite-plugin-dev-banner");
} catch (e) {
  devBanner = null;
}

const plugins = [
  react(),
  runtimeErrorOverlay(),
];
if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
  if (cartographer) plugins.push(cartographer());
  if (devBanner) plugins.push(devBanner());
}

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "client", "src"),
      "@shared": path.resolve(process.cwd(), "shared"),
      "@assets": path.resolve(process.cwd(), "attached_assets"),
    },
  },
  root: path.resolve(process.cwd(), "client"),
  build: {
    outDir: path.resolve(process.cwd(), "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  optimizeDeps: {
    // Pre-bundle heavy dependencies for faster dev server
    include: [
      'react',
      'react-dom',
      'wouter',
      '@tanstack/react-query',
      'lucide-react',
    ],
  },
});
