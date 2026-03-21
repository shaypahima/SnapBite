import { prisma } from "../src/lib/db";
import { afterAll, afterEach } from "vitest";

// Clean up test data after each test
afterEach(async () => {
  // Delete in order respecting foreign keys
  await prisma.mealItem.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.food.deleteMany();
  // Don't delete sessions/accounts — just users created in tests
  await prisma.session.deleteMany({ where: { user: { email: { contains: "@test.snapbite" } } } });
  await prisma.account.deleteMany({ where: { user: { email: { contains: "@test.snapbite" } } } });
  await prisma.user.deleteMany({ where: { email: { contains: "@test.snapbite" } } });
});

afterAll(async () => {
  await prisma.$disconnect();
});
