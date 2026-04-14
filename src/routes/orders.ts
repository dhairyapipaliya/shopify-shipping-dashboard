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
      update: { ...order, syncedAt: new Date() },
      create: order
    });
  }

  res.redirect("/orders");
});

ordersRouter.get("/orders", requireAuth, async (_req, res) => {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  res.render("orders", { orders });
});

ordersRouter.get("/orders/:id/quotes", requireAuth, async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });

  if (!order) {
    res.status(404).send("Order not found");
    return;
  }

  const providersToCompare = providerRegistry
    .list()
    .filter((provider) => provider.name === "delhivery_direct" || provider.name === "shipmozo_delhivery");

  const quotes = (
    await Promise.all(providersToCompare.map((provider) => provider.getQuotes({
      orderId: order.id,
      weightGrams: order.totalWeightGrams,
      lengthCm: order.lengthCm,
      widthCm: order.widthCm,
      heightCm: order.heightCm,
      destinationPincode: order.pincode,
      paymentMode: order.paymentMode,
      orderValue: order.orderValue
    })))
  ).flat();

  await prisma.shipmentQuote.deleteMany({ where: { orderId: order.id } });

  const ranked = rankQuotes(quotes);

  if (ranked.ranked.length) {
    await prisma.shipmentQuote.createMany({
      data: ranked.ranked.map((quote) => ({
        orderId: order.id,
        provider: quote.provider,
        serviceName: quote.serviceName,
        etaDays: quote.etaDays,
        shippingCost: quote.shippingCost,
        codCharges: quote.codCharges,
        score: 0,
        supportsCod: quote.supportsCod,
        supportsPrepaid: quote.supportsPrepaid,
        rawResponse: quote.rawResponse
      }))
    });
  }

  res.render("quotes", { order, ranked: ranked.ranked, cheapest: ranked.cheapest, savingsAmount: ranked.savingsAmount });
});
