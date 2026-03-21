import { describe, it, expect } from "vitest";
import { createTestUser, createTestApp } from "./helpers";

describe("Profile API", () => {
  it("returns profile for authenticated user", async () => {
    const user = await createTestUser({
      age: 30,
      gender: "male",
      weight: 80,
      height: 180,
    });
    const app = createTestApp(user.id);

    const res = await app.fetch(
      new Request("http://localhost/api/profile")
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.age).toBe(30);
    expect(body.gender).toBe("male");
    expect(body.weight).toBe(80);
  });

  it("creates profile and calculates targets", async () => {
    const user = await createTestUser();
    const app = createTestApp(user.id);

    const res = await app.fetch(
      new Request("http://localhost/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: 30,
          gender: "male",
          weight: 80,
          height: 180,
          activityLevel: "moderate",
          goal: "maintain",
          unitPreference: "metric",
        }),
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.age).toBe(30);
    expect(body.calorieTarget).toBe(2759);
    expect(body.proteinTarget).toBe(207);
  });

  it("updates profile and recalculates targets", async () => {
    const user = await createTestUser({
      age: 30,
      gender: "male",
      weight: 80,
      height: 180,
      activityLevel: "moderate",
      goal: "maintain",
      unitPreference: "metric",
      calorieTarget: 2759,
    });
    const app = createTestApp(user.id);

    const res = await app.fetch(
      new Request("http://localhost/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: 30,
          gender: "male",
          weight: 80,
          height: 180,
          activityLevel: "moderate",
          goal: "lose",
          unitPreference: "metric",
        }),
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    // Was 2759 (maintain), now lose: 2759 - 500 = 2259
    expect(body.calorieTarget).toBe(2259);
  });

  it("returns 401-like error without user context", async () => {
    // Test the real app without auth — import main app
    const { default: realApp } = await import("../src/index");
    const res = await realApp.fetch(
      new Request("http://localhost/api/profile")
    );
    expect(res.status).toBe(401);
  });
});
