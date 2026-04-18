import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { rankQuotes } from "../services/quoteEngine.js";
import { providerRegistry } from "../services/providers/providerRegistry.js";
import { fetchShopifyOrders } from "../services/shopify/shopifyClient.js";
import { matchesOrderStatusFilter, orderStatusFilters, orderStatusWorkflowGroups, parseOrderStatusFilter } from "../utils/orderStatuses.js";
import { getSharedOrderById, sharedDummyOrders } from "../data/sharedOrders.js";
import { mapMockOrderToRow } from "../utils/orderViewModel.js";

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

ordersRouter.get("/orders", requireAuth, async (req, res) => {
  const selectedStatus = parseOrderStatusFilter(req.query.status);
  const updatedOrder = typeof req.query.updatedOrder === "string" ? req.query.updatedOrder : "";

  const orderRows = sharedDummyOrders.map((order) => mapMockOrderToRow(order));
  const filteredOrders = orderRows.filter((order) => matchesOrderStatusFilter(order.operationalStatus, selectedStatus));

  res.render("orders", {
    orders: filteredOrders,
    updatedOrder,
    selectedStatus,
    statusOptions: orderStatusFilters,
    statusGroups: orderStatusWorkflowGroups
  });
});

ordersRouter.get("/orders/:id/quotes", requireAuth, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      shipments: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

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

ordersRouter.post("/orders/:id/print-label", requireAuth, (req, res) => {
  const order = getSharedOrderById(req.params.id);
  if (!order) {
    res.status(404).send("Order not found");
    return;
  }

  res.redirect(`/orders?status=pickupsAndManifests&updatedOrder=${encodeURIComponent(order.order_id)}`);
});

ordersRouter.post("/orders/:id/manifest", requireAuth, (req, res) => {
  const order = getSharedOrderById(req.params.id);
  if (!order) {
    res.status(404).send("Order not found");
    return;
  }

  res.redirect(`/orders?status=pickupsAndManifests&updatedOrder=${encodeURIComponent(order.order_id)}`);
});
