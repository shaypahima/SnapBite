import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { prisma } from "./db";
import { log } from "../middleware/logger";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const aiFoodItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  estimatedGrams: z.number(),
});

const aiMealResponseSchema = z.object({
  items: z.array(aiFoodItemSchema),
});

type AiFoodItem = z.infer<typeof aiFoodItemSchema>;

const SYSTEM_PROMPT = `You are a nutrition analysis assistant. When given a description of food, return a structured breakdown of each food item with estimated nutritional data per the amount described.

For each item provide:
- name: the food name
- description: brief description
- calories: total kcal for the amount described
- protein: grams of protein
- carbs: grams of carbohydrates
- fat: grams of fat
- estimatedGrams: estimated weight in grams

Be accurate and realistic with your estimates. If amounts are specified, use them. If not, estimate typical serving sizes.`;

export async function analyzeText(text: string): Promise<AiFoodItem[]> {
  log.info({ text }, "Analyzing text meal");

  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: text },
    ],
    response_format: zodResponseFormat(aiMealResponseSchema, "meal_analysis"),
  });

  const parsed = response.choices[0].message.parsed;
  if (!parsed) throw new Error("Failed to parse AI response");

  return parsed.items;
}

export async function analyzePhoto(base64Image: string): Promise<AiFoodItem[]> {
  log.info("Analyzing photo meal");

  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Identify all foods in this image and provide nutritional breakdown for each.",
          },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
        ],
      },
    ],
    response_format: zodResponseFormat(aiMealResponseSchema, "meal_analysis"),
  });

  const parsed = response.choices[0].message.parsed;
  if (!parsed) throw new Error("Could not identify food in the image. Please retake the photo.");

  if (parsed.items.length === 0) {
    throw new Error("Could not identify food in the image. Please retake the photo.");
  }

  return parsed.items;
}

export async function lookupFood(name: string) {
  // Check cache first
  const cached = await prisma.food.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  if (cached) {
    log.info({ name }, "Food found in cache");
    return cached;
  }

  log.info({ name }, "Looking up food via AI");

  const lookupSchema = z.object({
    name: z.string(),
    description: z.string(),
    caloriesPer100g: z.number(),
    proteinPer100g: z.number(),
    carbsPer100g: z.number(),
    fatPer100g: z.number(),
  });

  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a nutrition database. Return accurate per-100g nutritional data for the requested food.",
      },
      { role: "user", content: `Nutritional data per 100g for: ${name}` },
    ],
    response_format: zodResponseFormat(z.object({ food: lookupSchema }), "food_lookup"),
  });

  const parsed = response.choices[0].message.parsed;
  if (!parsed) throw new Error("Failed to look up food");

  // Cache in DB
  const food = await prisma.food.create({
    data: parsed.food,
  });

  return food;
}
