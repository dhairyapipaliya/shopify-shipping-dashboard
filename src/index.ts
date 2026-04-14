import { app } from "./server.js";
import { env } from "./config/env.js";
import { prisma } from "./db.js";
import { hashPassword } from "./utils/password.js";

const bootstrapAdmin = async () => {
  const existing = await prisma.adminUser.findUnique({ where: { email: env.ADMIN_EMAIL } });
  if (!existing) {
    await prisma.adminUser.create({
      data: {
        email: env.ADMIN_EMAIL,
        passwordHash: await hashPassword(env.ADMIN_PASSWORD)
      }
    });
    console.log(`Bootstrapped admin user: ${env.ADMIN_EMAIL}`);
  }
};

const start = async () => {
  await bootstrapAdmin();
  app.listen(env.PORT, () => {
    console.log(`Server running at ${env.APP_BASE_URL}`);
  });
};

start().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
