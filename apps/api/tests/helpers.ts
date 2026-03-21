import { Hono } from "hono";
import { prisma } from "../src/lib/db";
import crypto from "crypto";
import profileRoutes from "../src/routes/profile";
import mealsRoutes from "../src/routes/meals";
import statsRoutes from "../src/routes/stats";
import foodsRoutes from "../src/routes/foods";

/**
 * Create a test user in the DB.
 */
export async function createTestUser(overrides: Record<string, unknown> = {}) {
  const id = crypto.randomUUID();
  const email = `${id}@test.snapbite`;

  const user = await prisma.user.create({
    data: {
      id,
      email,
      name: "Test User",
      emailVerified: true,
      ...overrides,
    },
  });

  return user;
}

/**
 * Create a test Hono app that skips auth and injects user into context.
 */
export function createTestApp(userId: string) {
  const app = new Hono();

  // Mock auth: inject user into context
  app.use("*", async (c, next) => {
    c.set("user", { id: userId });
    c.set("session", { id: "test-session" });
    await next();
  });

  app.route("/api/profile", profileRoutes);
  app.route("/api/meals", mealsRoutes);
  app.route("/api/stats", statsRoutes);
  app.route("/api/foods", foodsRoutes);

  return app;
}
