import { Router } from "express";
import { prisma } from "../db.js";
import { verifyPassword } from "../utils/password.js";

export const authRouter = Router();

authRouter.get("/login", (_req, res) => {
  res.render("login", { error: null });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.adminUser.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).render("login", { error: "Invalid email/password." });
    return;
  }

  req.session.adminUserId = user.id;
  res.redirect("/");
});

authRouter.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});
