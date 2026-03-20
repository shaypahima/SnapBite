import type { ActivityLevel, Gender, Goal } from "shared";

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENTS: Record<string, number> = {
  lose: -500,
  maintain: 0,
  gain: 500,
};

export function calculateTargets(profile: {
  age: number;
  gender: Gender;
  weight: number; // kg
  height: number; // cm
  activityLevel: ActivityLevel;
  goal: Goal;
}) {
  // Mifflin-St Jeor
  let bmr: number;
  if (profile.gender === "male") {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  }

  const tdee = bmr * ACTIVITY_MULTIPLIERS[profile.activityLevel];
  const calories = Math.round(tdee + GOAL_ADJUSTMENTS[profile.goal]);

  // Macro split: 30% protein, 40% carbs, 30% fat
  const proteinCalories = calories * 0.3;
  const carbsCalories = calories * 0.4;
  const fatCalories = calories * 0.3;

  return {
    calorieTarget: calories,
    proteinTarget: Math.round(proteinCalories / 4), // 4 cal/g
    carbsTarget: Math.round(carbsCalories / 4), // 4 cal/g
    fatTarget: Math.round(fatCalories / 9), // 9 cal/g
  };
}
