import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { logger } from "./middleware/logger";
import { auth } from "./lib/auth";
import { authMiddleware } from "./middleware/auth";

const app = new Hono();

// Middleware
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("*", logger());

// Auth routes (unprotected)
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Protected routes
app.use("/api/*", authMiddleware());

export default {
  port: 3000,
  fetch: app.fetch,
};
