import { describe, it, expect } from "vitest";
import { prisma } from "../src/lib/db";
import { createTestUser, createTestApp } from "./helpers";

async function createFood(name?: string) {
  return prisma.food.create({
    data: {
      name: name || `TestFood_${Date.now()}_${Math.random()}`,
      caloriesPer100g: 165,
      proteinPer100g: 31,
      carbsPer100g: 0,
      fatPer100g: 3.6,
    },
  });
}

describe("Foods & Favorites API", () => {
  it("looks up a cached food from DB", async () => {
    const user = await createTestUser();
    const app = createTestApp(user.id);
    const food = await createFood("CachedChicken");

    const res = await app.fetch(
      new Request(`http://localhost/api/foods/lookup?q=CachedChicken`)
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(food.id);
    expect(body.caloriesPer100g).toBe(165);
  });

  it("returns 400 for empty lookup query", async () => {
    const user = await createTestUser();
    const app = createTestApp(user.id);

    const res = await app.fetch(
      new Request("http://localhost/api/foods/lookup?q=")
    );

    expect(res.status).toBe(400);
  });

  it("adds a food to favorites", async () => {
    const user = await createTestUser();
    const app = createTestApp(user.id);
    const food = await createFood();

    const res = await app.fetch(
      new Request("http://localhost/api/foods/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodId: food.id }),
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.food.id).toBe(food.id);
  });

  it("prevents duplicate favorites", async () => {
    const user = await createTestUser();
    const app = createTestApp(user.id);
    const food = await createFood();

    await app.fetch(
      new Request("http://localhost/api/foods/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodId: food.id }),
      })
    );

    const res = await app.fetch(
      new Request("http://localhost/api/foods/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodId: food.id }),
      })
    );

    expect(res.status).toBe(409);
  });

  it("lists user favorites", async () => {
    const user = await createTestUser();
    const app = createTestApp(user.id);
    const food = await createFood();

    await app.fetch(
      new Request("http://localhost/api/foods/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodId: food.id }),
      })
    );

    const res = await app.fetch(
      new Request("http://localhost/api/foods/favorites")
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].food.caloriesPer100g).toBe(165);
  });

  it("deletes a favorite", async () => {
    const user = await createTestUser();
    const app = createTestApp(user.id);
    const food = await createFood();

    const createRes = await app.fetch(
      new Request("http://localhost/api/foods/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodId: food.id }),
      })
    );
    const fav = await createRes.json();

    const deleteRes = await app.fetch(
      new Request(`http://localhost/api/foods/favorites/${fav.id}`, { method: "DELETE" })
    );

    expect(deleteRes.status).toBe(200);

    const listRes = await app.fetch(
      new Request("http://localhost/api/foods/favorites")
    );
    const body = await listRes.json();
    expect(body).toHaveLength(0);
  });

  it("quick-logs a meal from a favorite food", async () => {
    const user = await createTestUser();
    const app = createTestApp(user.id);
    const food = await createFood();

    const res = await app.fetch(
      new Request("http://localhost/api/foods/favorites/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodId: food.id, quantity: 200, category: "lunch" }),
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.category).toBe("lunch");
    expect(body.items).toHaveLength(1);
    // 200g of food with 165 cal/100g = 330 cal
    expect(body.items[0].calories).toBe(330);
    expect(body.items[0].protein).toBe(62);
    expect(body.items[0].quantity).toBe(200);
  });
});
