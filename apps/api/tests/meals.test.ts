import { describe, it, expect } from "vitest";
import { prisma } from "../src/lib/db";
import { createTestUser, createTestApp } from "./helpers";

async function createFood(name = "Chicken Breast") {
  return prisma.food.create({
    data: {
      name: `${name}_${Date.now()}`,
      caloriesPer100g: 165,
      proteinPer100g: 31,
      carbsPer100g: 0,
      fatPer100g: 3.6,
    },
  });
}

async function createMeal(app: ReturnType<typeof createTestApp>, items: any[], category?: string) {
  return app.fetch(
    new Request("http://localhost/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, category }),
    })
  );
}

describe("Meals API", () => {
  it("creates a meal with food items", async () => {
    const user = await createTestUser();
    const app = createTestApp(user.id);

    const res = await createMeal(app, [
      { name: "Grilled Chicken", calories: 330, protein: 62, carbs: 0, fat: 7.2, estimatedGrams: 200 },
    ], "lunch");

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.category).toBe("lunch");
    expect(body.items).toHaveLength(1);
    expect(body.items[0].calories).toBe(330);
    expect(body.items[0].food.name).toBe("Grilled Chicken");
  });

  it("caches food in DB on meal creation", async () => {
    const user = await createTestUser();
    const app = createTestApp(user.id);
    const foodName = `CacheTest_${Date.now()}`;

    await createMeal(app, [
      { name: foodName, calories: 100, protein: 10, carbs: 20, fat: 5, estimatedGrams: 100 },
    ]);

    const food = await prisma.food.findFirst({ where: { name: { equals: foodName, mode: "insensitive" } } });
    expect(food).not.toBeNull();
    expect(food!.caloriesPer100g).toBe(100);
  });

  it("gets meals by date", async () => {
    const user = await createTestUser();
    const app = createTestApp(user.id);

    await createMeal(app, [
      { name: "Oats", calories: 150, protein: 5, carbs: 27, fat: 3, estimatedGrams: 100 },
    ], "breakfast");

    const today = new Date().toISOString().split("T")[0];
    const res = await app.fetch(
      new Request(`http://localhost/api/meals?date=${today}`)
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.length).toBeGreaterThanOrEqual(1);
    expect(body[0].items[0].food.name).toBe("Oats");
  });

  it("updates a meal", async () => {
    const user = await createTestUser();
    const app = createTestApp(user.id);

    const createRes = await createMeal(app, [
      { name: "Rice", calories: 200, protein: 4, carbs: 44, fat: 0.4, estimatedGrams: 150 },
    ]);
    const meal = await createRes.json();

    const updateRes = await app.fetch(
      new Request(`http://localhost/api/meals/${meal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            { name: "Rice", quantity: 200, calories: 260, protein: 5, carbs: 58, fat: 0.5 },
          ],
        }),
      })
    );

    expect(updateRes.status).toBe(200);
    const updated = await updateRes.json();
    expect(updated.items[0].calories).toBe(260);
    expect(updated.items[0].quantity).toBe(200);
  });

  it("deletes a meal", async () => {
    const user = await createTestUser();
    const app = createTestApp(user.id);

    const createRes = await createMeal(app, [
      { name: "Pasta", calories: 300, protein: 10, carbs: 60, fat: 2, estimatedGrams: 200 },
    ]);
    const meal = await createRes.json();

    const deleteRes = await app.fetch(
      new Request(`http://localhost/api/meals/${meal.id}`, { method: "DELETE" })
    );

    expect(deleteRes.status).toBe(200);

    // Verify gone
    const dbMeal = await prisma.meal.findUnique({ where: { id: meal.id } });
    expect(dbMeal).toBeNull();
  });

  it("returns 404 when deleting another user's meal", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const app1 = createTestApp(user1.id);
    const app2 = createTestApp(user2.id);

    const createRes = await createMeal(app1, [
      { name: "Salad", calories: 50, protein: 3, carbs: 8, fat: 1, estimatedGrams: 100 },
    ]);
    const meal = await createRes.json();

    // User 2 tries to delete user 1's meal
    const deleteRes = await app2.fetch(
      new Request(`http://localhost/api/meals/${meal.id}`, { method: "DELETE" })
    );

    expect(deleteRes.status).toBe(404);
  });
});
