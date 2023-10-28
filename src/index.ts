import { execute } from "./services/service.execute";

/**
 * Returns the current system time.
 * @returns {string}
 */
const getTime = (): string => new Date().toISOString();

/**
 * Writes a log message for monitoring purposes.
 * @param {unknown[]} args The arguments to log.
 */
export const log = (...args: unknown[]): void =>
  console.info(getTime(), ...args);

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
      if (req.method === "POST" && parts[1] === "execute") {
        // Add body.
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
  hostname,
  port,
  development,
  cert: process.env.CERT,
  key: process.env.KEY,
  passphrase: process.env.PASSPHRASE !== undefined,
});
