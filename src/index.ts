import { execute } from "./services/service.execute";
import { resolve } from "node:path";
import { log } from "./utilities/utilities.logging";

export const FILES_MAX_COUNT = Number(process.env.FILES_MAX_COUNT || 0);
export const FILES_MAX_SIZE_IN_KB = Number(
  process.env.FILES_MAX_SIZE_IN_KB || 0
);
export const FILES_EXTENSIONS = (process.env.FILES_EXTENSIONS || "")
  .replace(/\s/g, "")
  .replace(/\./g, "")
  .split(",");
export const FILES_DIR = resolve(process.env.FILES_DIR || "./files");

/**
 * Starts the server.
 */
const server = Bun.serve({
  hostname: process.env.HOSTNAME || "localhost",
  port: process.env.PORT || 3000,
  tls: {
    cert: process.env.CERT && Bun.file(process.env.CERT),
    key: process.env.KEY && Bun.file(process.env.KEY),
    passphrase: process.env.PASSPHRASE,
  },
  fetch: (req) => {
    try {
      const url = new URL(req.url);
      const parts = url.pathname.split("/");
      log(req.method, "=>", url.pathname);
      // Endpoints.
      if (req.method === "POST" && parts[1] === "exec") {
        return execute(req);
      }
      // Fallback.
      log(req.method, "=>", url.pathname, "is unsupported.");
      return new Response(null, { status: 404 });
    } catch (error) {
      log(error);
      return new Response(null, { status: 500 });
    }
  },
});

const { hostname, port, development } = server;

log({
  server: {
    hostname,
    port,
    development,
    cert: process.env.CERT,
    key: process.env.KEY,
    passphrase: process.env.PASSPHRASE !== undefined,
  },
  other: {
    FILES_MAX_COUNT,
    FILES_MAX_SIZE_IN_KB: `${FILES_MAX_SIZE_IN_KB} KB (${Math.round(
      FILES_MAX_SIZE_IN_KB / 1024
    )} MB)`,
    FILES_EXTENSIONS,
    FILES_DIR,
  },
});
