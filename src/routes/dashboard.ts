import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", requireAuth, async (_req, res) => {
  const [ordersCount, shipmentsCount, latestOrders] = await Promise.all([
    prisma.order.count(),
    prisma.shipment.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        shipments: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    })
  ]);

  res.render("dashboard", { ordersCount, shipmentsCount, latestOrders });
});
