import type { Context, MiddlewareHandler } from "hono";
import { auth } from "../lib/auth";

export const authMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    c.set("user", session.user);
    c.set("session", session.session);
    await next();
  };
};

export const getUser = (c: Context) => c.get("user");
