import { z } from "zod";

export const mealCategorySchema = z.enum([
  "breakfast",
  "lunch",
  "dinner",
  "snack",
]);

export const analyzeTextRequestSchema = z.object({
  text: z.string().min(1),
  category: mealCategorySchema.optional(),
});

export const analyzePhotoRequestSchema = z.object({
  image: z.string().min(1), // base64
  category: mealCategorySchema.optional(),
});

export const analyzeFormItemSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(), // grams
});

export const analyzeFormRequestSchema = z.object({
  items: z.array(analyzeFormItemSchema).min(1),
  category: mealCategorySchema.optional(),
});

export const logFromFavoriteRequestSchema = z.object({
  foodId: z.string(),
  quantity: z.number().positive(), // grams
  category: mealCategorySchema.optional(),
});

export type MealCategory = z.infer<typeof mealCategorySchema>;
export type AnalyzeTextRequest = z.infer<typeof analyzeTextRequestSchema>;
export type AnalyzePhotoRequest = z.infer<typeof analyzePhotoRequestSchema>;
export type AnalyzeFormItem = z.infer<typeof analyzeFormItemSchema>;
export type AnalyzeFormRequest = z.infer<typeof analyzeFormRequestSchema>;
export type LogFromFavoriteRequest = z.infer<typeof logFromFavoriteRequestSchema>;
