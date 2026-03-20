import { z } from "zod";

export const foodItemSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
});

export const foodPer100gSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  caloriesPer100g: z.number(),
  proteinPer100g: z.number(),
  carbsPer100g: z.number(),
  fatPer100g: z.number(),
});

export const analyzeMealResponseSchema = z.object({
  items: z.array(foodItemSchema),
  totals: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
  }),
});

export type FoodItem = z.infer<typeof foodItemSchema>;
export type FoodPer100g = z.infer<typeof foodPer100gSchema>;
export type AnalyzeMealResponse = z.infer<typeof analyzeMealResponseSchema>;
