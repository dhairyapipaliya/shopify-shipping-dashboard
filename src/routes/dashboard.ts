import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getDashboardViewModel } from "../utils/dashboardPresentation.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", requireAuth, async (_req, res) => {
  const dashboard = getDashboardViewModel();
  res.render("dashboard", { dashboard });
});
