import { Hono } from "hono";
import { getUser } from "../middleware/auth";
import { lookupFood } from "../lib/ai";
import { prisma } from "../lib/db";
import { log } from "../middleware/logger";

const foods = new Hono();

// Lookup food by name (DB cache first, AI fallback)
foods.get("/lookup", async (c) => {
  const q = c.req.query("q");
  if (!q || q.trim().length === 0) {
    return c.json({ error: "Query required" }, 400);
  }

  const food = await lookupFood(q.trim());
  return c.json(food);
});

// Get user favorites
foods.get("/favorites", async (c) => {
  const user = getUser(c);

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { food: true },
    orderBy: { createdAt: "desc" },
  });

  return c.json(favorites);
});

// Add to favorites
foods.post("/favorites", async (c) => {
  const user = getUser(c);
  const { foodId } = await c.req.json();

  const existing = await prisma.favorite.findUnique({
    where: { userId_foodId: { userId: user.id, foodId } },
  });

  if (existing) {
    return c.json({ error: "Already in favorites" }, 409);
  }

  const favorite = await prisma.favorite.create({
    data: { userId: user.id, foodId },
    include: { food: true },
  });

  log.info({ foodId }, "Added to favorites");
  return c.json(favorite, 201);
});

// Remove from favorites
foods.delete("/favorites/:id", async (c) => {
  const user = getUser(c);
  const id = c.req.param("id");

  const favorite = await prisma.favorite.findFirst({
    where: { id, userId: user.id },
  });

  if (!favorite) return c.json({ error: "Not found" }, 404);

  await prisma.favorite.delete({ where: { id } });
  log.info({ id }, "Removed from favorites");
  return c.json({ success: true });
});

// Quick-log from favorite
foods.post("/favorites/log", async (c) => {
  const user = getUser(c);
  const body = await c.req.json();
  const { foodId, quantity, category } = body;

  const food = await prisma.food.findUnique({ where: { id: foodId } });
  if (!food) return c.json({ error: "Food not found" }, 404);

  const multiplier = quantity / 100;
  const meal = await prisma.meal.create({
    data: {
      userId: user.id,
      category: category || null,
      items: {
        create: {
          foodId: food.id,
          quantity,
          calories: food.caloriesPer100g * multiplier,
          protein: food.proteinPer100g * multiplier,
          carbs: food.carbsPer100g * multiplier,
          fat: food.fatPer100g * multiplier,
        },
      },
    },
    include: { items: { include: { food: true } } },
  });

  log.info({ mealId: meal.id }, "Quick-logged from favorite");
  return c.json(meal, 201);
});

export default foods;
