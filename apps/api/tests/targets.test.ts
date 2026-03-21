import { describe, it, expect } from "vitest";
import { calculateTargets } from "../src/lib/targets";

describe("calculateTargets", () => {
  it("calculates correct targets for a male maintaining weight", () => {
    const result = calculateTargets({
      age: 30,
      gender: "male",
      weight: 80, // kg
      height: 180, // cm
      activityLevel: "moderate",
      goal: "maintain",
    });

    // Mifflin-St Jeor male: 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    // TDEE: 1780 * 1.55 = 2759
    // Maintain: +0 = 2759
    expect(result.calorieTarget).toBe(2759);
    // Protein: 2759 * 0.3 / 4 = 207
    expect(result.proteinTarget).toBe(207);
    // Carbs: 2759 * 0.4 / 4 = 276
    expect(result.carbsTarget).toBe(276);
    // Fat: 2759 * 0.3 / 9 = 92
    expect(result.fatTarget).toBe(92);
  });

  it("calculates correct targets for a female losing weight", () => {
    const result = calculateTargets({
      age: 25,
      gender: "female",
      weight: 65,
      height: 165,
      activityLevel: "light",
      goal: "lose",
    });

    // Mifflin-St Jeor female: 10*65 + 6.25*165 - 5*25 - 161 = 650 + 1031.25 - 125 - 161 = 1395.25
    // TDEE: 1395.25 * 1.375 = 1918.47 → round = 1918
    // Lose: -500 = 1418
    expect(result.calorieTarget).toBe(1418);
    expect(result.proteinTarget).toBe(Math.round(1418 * 0.3 / 4)); // 106
    expect(result.carbsTarget).toBe(Math.round(1418 * 0.4 / 4)); // 142
    expect(result.fatTarget).toBe(Math.round(1418 * 0.3 / 9)); // 47
  });

  it("applies gain adjustment correctly", () => {
    const result = calculateTargets({
      age: 20,
      gender: "male",
      weight: 70,
      height: 175,
      activityLevel: "active",
      goal: "gain",
    });

    // BMR: 10*70 + 6.25*175 - 5*20 + 5 = 700 + 1093.75 - 100 + 5 = 1698.75
    // TDEE: 1698.75 * 1.725 = 2930.34 → round = 2930
    // Gain: +500 = 3430
    expect(result.calorieTarget).toBe(3430);
  });
});
