import pino from "pino";
import type { MiddlewareHandler } from "hono";

export const log = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

export const logger = (): MiddlewareHandler => {
  return async (c, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    log.info({ method: c.req.method, path: c.req.path, status: c.res.status, ms });
  };
};
