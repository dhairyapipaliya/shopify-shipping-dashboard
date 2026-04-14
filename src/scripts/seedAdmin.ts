import { env } from "../config/env.js";
import { prisma } from "../db.js";
import { hashPassword } from "../utils/password.js";

const run = async () => {
  const existing = await prisma.adminUser.findUnique({ where: { email: env.ADMIN_EMAIL } });
  if (existing) {
    console.log("Admin already exists.");
    return;
  }

  await prisma.adminUser.create({
    data: {
      email: env.ADMIN_EMAIL,
      passwordHash: await hashPassword(env.ADMIN_PASSWORD)
    }
  });

  console.log(`Admin user created: ${env.ADMIN_EMAIL}`);
};

run().finally(async () => prisma.$disconnect());
