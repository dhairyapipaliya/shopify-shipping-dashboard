import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", requireAuth, async (_req, res) => {
  const [ordersCount, shipmentsCount, latestOrders, syncSummary] = await Promise.all([
    prisma.order.count(),
    prisma.shipment.count(),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.shipment.groupBy({ by: ["shopifySyncStatus"], _count: true })
  ]);

  res.render("dashboard", { ordersCount, shipmentsCount, latestOrders, syncSummary });
});

dashboardRouter.get("/shopify-sync-status", requireAuth, async (_req, res) => {
  const orders = await prisma.order.findMany({ orderBy: { syncedAt: "desc" }, take: 30 });
  const shipments = await prisma.shipment.findMany({ orderBy: { updatedAt: "desc" }, take: 30, include: { order: true } });
  res.render("shopifySyncStatus", { orders, shipments });
});
