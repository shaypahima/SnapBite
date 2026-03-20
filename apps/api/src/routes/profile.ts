import { Hono } from "hono";
import { prisma } from "../lib/db";
import { getUser } from "../middleware/auth";
import { profileSchema } from "shared";
import { calculateTargets } from "../lib/targets";

const profile = new Hono();

profile.get("/", async (c) => {
  const user = getUser(c);
  const data = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      age: true,
      gender: true,
      weight: true,
      height: true,
      activityLevel: true,
      goal: true,
      unitPreference: true,
      calorieTarget: true,
      proteinTarget: true,
      carbsTarget: true,
      fatTarget: true,
    },
  });
  return c.json(data);
});

profile.post("/", async (c) => {
  const user = getUser(c);
  const body = await c.req.json();
  const parsed = profileSchema.parse(body);

  const targets = calculateTargets(parsed);

  const data = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...parsed,
      ...targets,
    },
    select: {
      age: true,
      gender: true,
      weight: true,
      height: true,
      activityLevel: true,
      goal: true,
      unitPreference: true,
      calorieTarget: true,
      proteinTarget: true,
      carbsTarget: true,
      fatTarget: true,
    },
  });

  return c.json(data);
});

profile.put("/", async (c) => {
  const user = getUser(c);
  const body = await c.req.json();
  const parsed = profileSchema.parse(body);

  const targets = calculateTargets(parsed);

  const data = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...parsed,
      ...targets,
    },
    select: {
      age: true,
      gender: true,
      weight: true,
      height: true,
      activityLevel: true,
      goal: true,
      unitPreference: true,
      calorieTarget: true,
      proteinTarget: true,
      carbsTarget: true,
      fatTarget: true,
    },
  });

  return c.json(data);
});

export default profile;
