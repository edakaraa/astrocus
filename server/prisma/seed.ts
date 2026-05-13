import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { stars } from "../src/constants";

const prisma = new PrismaClient();

const main = async () => {
  const email = "demo@astrocus.dev";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash("demo1234", 10);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      username: "demo",
      avatar: "🌙",
      galaxyName: "Astrocus",
      language: "tr",
      targetStarId: stars[0].id,
      onboardingCompleted: true,
    },
  });
};

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
