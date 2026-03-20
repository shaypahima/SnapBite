import { Hono } from "hono";
import { prisma } from "../lib/db";
import { getUser } from "../middleware/auth";

const stats = new Hono();

// Daily stats: totals + targets for a given date
stats.get("/daily", async (c) => {
  const user = getUser(c);
  const dateParam = c.req.query("date") || new Date().toISOString().split("T")[0];

  const start = new Date(dateParam);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateParam);
  end.setHours(23, 59, 59, 999);

  const meals = await prisma.meal.findMany({
    where: { userId: user.id, loggedAt: { gte: start, lte: end } },
    include: { items: true },
  });

  const totals = meals.reduce(
    (acc, meal) => {
      meal.items.forEach((item) => {
        acc.calories += item.calories;
        acc.protein += item.protein;
        acc.carbs += item.carbs;
        acc.fat += item.fat;
      });
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      calorieTarget: true,
      proteinTarget: true,
      carbsTarget: true,
      fatTarget: true,
    },
  });

  return c.json({
    date: dateParam,
    totals: {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat),
    },
    targets: {
      calories: profile?.calorieTarget || 0,
      protein: profile?.proteinTarget || 0,
      carbs: profile?.carbsTarget || 0,
      fat: profile?.fatTarget || 0,
    },
  });
});

// Trends: daily totals for a date range
stats.get("/trends", async (c) => {
  const user = getUser(c);
  const range = c.req.query("range") || "week";
  const days = range === "month" ? 30 : 7;

  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);

  const meals = await prisma.meal.findMany({
    where: { userId: user.id, loggedAt: { gte: start, lte: end } },
    include: { items: true },
  });

  // Group by date
  const byDate: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};

  for (let d = 0; d < days; d++) {
    const date = new Date(start);
    date.setDate(date.getDate() + d);
    byDate[date.toISOString().split("T")[0]] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  meals.forEach((meal) => {
    const key = meal.loggedAt.toISOString().split("T")[0];
    if (byDate[key]) {
      meal.items.forEach((item) => {
        byDate[key].calories += item.calories;
        byDate[key].protein += item.protein;
        byDate[key].carbs += item.carbs;
        byDate[key].fat += item.fat;
      });
    }
  });

  const data = Object.entries(byDate).map(([date, totals]) => ({
    date,
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fat: Math.round(totals.fat),
  }));

  return c.json(data);
});

export default stats;
