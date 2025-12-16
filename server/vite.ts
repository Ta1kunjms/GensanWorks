

// Always use process.cwd() for directory resolution (ESM/CJS safe)
const _dirname = process.cwd();


import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

// __dirname is available in CJS and polyfilled in ESM entrypoints
const resolvedViteConfig = viteConfig;

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Cache-bust the entrypoint once per dev-server run (not on every request).
  // Per-request busting forces a full module re-fetch which is especially slow over tunnels.
  const devBuildId = nanoid();

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...resolvedViteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        // Do not exit the process here — surface the error and allow
        // the host process to handle it so we can see full diagnostics.
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use(/.*/, async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.join(process.cwd(), "client", "index.html");

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${devBuildId}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(_dirname, "dist", "public");

  if (!fs.existsSync(distPath)) {
    console.warn(
      `[serveStatic] Missing build directory at ${distPath}. Skipping static middleware (API routes still available).`,
    );
    return;
  }

  app.use(
    express.static(distPath, {
      index: false,
      setHeaders: (res, filePath) => {
        // Aggressively cache fingerprinted build assets.
        // Keep HTML un-cached to allow new deployments to load immediately.
        if (filePath.endsWith(".html")) {
          res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          );
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
          return;
        }

        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      },
    }),
  );

  // fall through to index.html if the file doesn't exist
  app.use(/.*/, (_req, res) => {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
