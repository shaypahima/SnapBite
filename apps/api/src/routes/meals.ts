import { Hono } from "hono";
import { prisma } from "../lib/db";
import { getUser } from "../middleware/auth";
import { analyzeText, analyzePhoto } from "../lib/ai";
import {
  analyzeTextRequestSchema,
  analyzePhotoRequestSchema,
  analyzeFormRequestSchema,
} from "shared";
import { log } from "../middleware/logger";

const meals = new Hono();

// Analyze text and return preview (don't save yet)
meals.post("/analyze-text", async (c) => {
  const body = await c.req.json();
  const { text } = analyzeTextRequestSchema.parse(body);

  const items = await analyzeText(text);
  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return c.json({ items, totals });
});

// Analyze photo and return preview
meals.post("/analyze-photo", async (c) => {
  const body = await c.req.json();
  const { image } = analyzePhotoRequestSchema.parse(body);

  const items = await analyzePhoto(image);
  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return c.json({ items, totals });
});

// Analyze structured form and return preview
meals.post("/analyze-form", async (c) => {
  const body = await c.req.json();
  const { items: formItems } = analyzeFormRequestSchema.parse(body);

  const text = formItems.map((i) => `${i.amount}g of ${i.name}`).join(", ");
  const items = await analyzeText(text);
  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return c.json({ items, totals });
});

// Save confirmed meal
meals.post("/", async (c) => {
  const user = getUser(c);
  const body = await c.req.json();
  const { items, category } = body;

  const meal = await prisma.meal.create({
    data: {
      userId: user.id,
      category: category || null,
      items: {
        create: await Promise.all(
          items.map(async (item: any) => {
            // Find or create food in cache
            let food = await prisma.food.findFirst({
              where: { name: { equals: item.name, mode: "insensitive" } },
            });

            if (!food) {
              const estimatedGrams = item.estimatedGrams || 100;
              food = await prisma.food.create({
                data: {
                  name: item.name,
                  description: item.description || null,
                  caloriesPer100g: Math.round((item.calories / estimatedGrams) * 100),
                  proteinPer100g: Math.round((item.protein / estimatedGrams) * 100 * 10) / 10,
                  carbsPer100g: Math.round((item.carbs / estimatedGrams) * 100 * 10) / 10,
                  fatPer100g: Math.round((item.fat / estimatedGrams) * 100 * 10) / 10,
                },
              });
            }

            return {
              foodId: food.id,
              quantity: item.estimatedGrams || 100,
              calories: item.calories,
              protein: item.protein,
              carbs: item.carbs,
              fat: item.fat,
            };
          })
        ),
      },
    },
    include: {
      items: { include: { food: true } },
    },
  });

  log.info({ mealId: meal.id }, "Meal saved");
  return c.json(meal, 201);
});

// Get meals by date
meals.get("/", async (c) => {
  const user = getUser(c);
  const date = c.req.query("date");

  const where: any = { userId: user.id };

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.loggedAt = { gte: start, lte: end };
  }

  const mealsList = await prisma.meal.findMany({
    where,
    include: { items: { include: { food: true } } },
    orderBy: { loggedAt: "desc" },
  });

  return c.json(mealsList);
});

export default meals;
