import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { rankQuotes } from "../services/quoteEngine.js";
import { providerRegistry } from "../services/providers/providerRegistry.js";
import { fetchShopifyOrders } from "../services/shopify/shopifyClient.js";

export const ordersRouter = Router();

ordersRouter.post("/orders/sync", requireAuth, async (_req, res) => {
  const incoming = await fetchShopifyOrders();

  for (const order of incoming) {
    await prisma.order.upsert({
      where: { shopifyOrderId: order.shopifyOrderId },
      update: { ...order, syncedAt: new Date(), shopifySyncStatus: "SYNCED", shopifySyncError: null },
      create: { ...order, shopifySyncStatus: "SYNCED" }
    });
  }

  res.redirect("/orders");
});

ordersRouter.get("/orders", requireAuth, async (_req, res) => {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  res.render("orders", { orders });
});

ordersRouter.get("/orders/:id/dispatch", requireAuth, async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).send("Order not found");

  const providersToCompare = providerRegistry.list().filter((p) => ["delhivery_direct", "shipmozo_delhivery"].includes(p.name));

  const quotes = (await Promise.all(providersToCompare.map((provider) => provider.getQuotes({
    orderId: order.id,
    weightGrams: order.totalWeightGrams,
    lengthCm: order.lengthCm,
    widthCm: order.widthCm,
    heightCm: order.heightCm,
    destinationPincode: order.pincode,
    orderValue: order.orderValue
  })))).flat();

  const ranked = rankQuotes(quotes);

  await prisma.shipmentQuote.deleteMany({ where: { orderId: order.id } });
  if (ranked.ranked.length) {
    await prisma.shipmentQuote.createMany({
      data: ranked.ranked.map((quote) => ({
        orderId: order.id,
        provider: quote.provider,
        serviceName: quote.serviceName,
        etaDays: quote.etaDays,
        shippingCost: quote.shippingCost,
        totalCost: quote.totalCost,
        labelReady: quote.labelReady,
        trackingReady: quote.trackingReady,
        recommendation: quote.tags.includes("recommended"),
        rawResponse: quote.rawResponse
      }))
    });
  }

  res.render("dispatchReview", { order, ranked: ranked.ranked, cheapest: ranked.cheapest, savingsAmount: ranked.savingsAmount });
});
