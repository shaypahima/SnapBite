import { z } from "zod";

export const genderSchema = z.enum(["male", "female"]);
export const activityLevelSchema = z.enum([
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
]);
export const goalSchema = z.enum(["lose", "maintain", "gain"]);
export const unitPreferenceSchema = z.enum(["metric", "imperial"]);

export const profileSchema = z.object({
  age: z.number().int().min(1).max(150),
  gender: genderSchema,
  weight: z.number().positive(), // kg
  height: z.number().positive(), // cm
  activityLevel: activityLevelSchema,
  goal: goalSchema,
  unitPreference: unitPreferenceSchema,
});

export type Gender = z.infer<typeof genderSchema>;
export type ActivityLevel = z.infer<typeof activityLevelSchema>;
export type Goal = z.infer<typeof goalSchema>;
export type UnitPreference = z.infer<typeof unitPreferenceSchema>;
export type Profile = z.infer<typeof profileSchema>;
