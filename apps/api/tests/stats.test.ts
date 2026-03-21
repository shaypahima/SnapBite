import { describe, it, expect } from "vitest";
import { createTestUser, createTestApp } from "./helpers";

describe("Stats API", () => {
  it("returns daily totals and targets", async () => {
    const user = await createTestUser({
      calorieTarget: 2000,
      proteinTarget: 150,
      carbsTarget: 200,
      fatTarget: 67,
    });
    const app = createTestApp(user.id);

    // Log a meal
    await app.fetch(
      new Request("http://localhost/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            { name: "Eggs", calories: 200, protein: 14, carbs: 1, fat: 15, estimatedGrams: 120 },
            { name: "Toast", calories: 150, protein: 5, carbs: 28, fat: 2, estimatedGrams: 60 },
          ],
          category: "breakfast",
        }),
      })
    );

    const today = new Date().toISOString().split("T")[0];
    const res = await app.fetch(
      new Request(`http://localhost/api/stats/daily?date=${today}`)
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.totals.calories).toBe(350);
    expect(body.totals.protein).toBe(19);
    expect(body.totals.carbs).toBe(29);
    expect(body.totals.fat).toBe(17);
    expect(body.targets.calories).toBe(2000);
    expect(body.targets.protein).toBe(150);
  });

  it("returns zero totals for a day with no meals", async () => {
    const user = await createTestUser({ calorieTarget: 2000 });
    const app = createTestApp(user.id);

    const res = await app.fetch(
      new Request("http://localhost/api/stats/daily?date=2020-01-01")
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.totals.calories).toBe(0);
    expect(body.totals.protein).toBe(0);
  });

  it("returns weekly trends with all days filled", async () => {
    const user = await createTestUser();
    const app = createTestApp(user.id);

    const res = await app.fetch(
      new Request("http://localhost/api/stats/trends?range=week")
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(7);
    // Each entry has date and macros
    expect(body[0]).toHaveProperty("date");
    expect(body[0]).toHaveProperty("calories");
    expect(body[0]).toHaveProperty("protein");
  });

  it("returns monthly trends with 30 days", async () => {
    const user = await createTestUser();
    const app = createTestApp(user.id);

    const res = await app.fetch(
      new Request("http://localhost/api/stats/trends?range=month")
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(30);
  });
});
