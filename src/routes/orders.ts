import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { rankQuotes } from "../services/quoteEngine.js";
import { providerRegistry } from "../services/providers/providerRegistry.js";
import { fetchShopifyOrders } from "../services/shopify/shopifyClient.js";
import {
  archiveSharedOrder,
  cloneSharedOrder,
  deleteSharedOrder,
  getSharedOrderById,
  sharedDummyOrders,
  updateSharedOrderPackageDetails,
  updateSharedOrderPickupAddress
} from "../data/sharedOrders.js";
import { PACKAGE_MODE, type PackageBox, type PackageMode } from "../utils/packageMode.js";
import { matchesOrderStatusFilter, orderStatusFilters, orderStatusWorkflowGroups, parseOrderStatusFilter } from "../utils/orderStatuses.js";
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

  const statusCounts = orderStatusFilters.reduce<Record<string, number>>((acc, filter) => {
    if (filter.value === "all") {
      acc[filter.value] = orderRows.length;
    } else {
      acc[filter.value] = orderRows.filter((order) => order.operationalStatus === filter.value).length;
    }
    return acc;
  }, {});

  res.render("orders", {
    orders: filteredOrders,
    updatedOrder,
    selectedStatus,
    statusOptions: orderStatusFilters,
    statusGroups: orderStatusWorkflowGroups,
    statusCounts
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

  res.redirect(`/orders?status=${encodeURIComponent(order.workflow_status)}&updatedOrder=${encodeURIComponent(order.order_id)}`);
});

ordersRouter.post("/orders/:id/manifest", requireAuth, (req, res) => {
  const order = getSharedOrderById(req.params.id);
  if (!order) {
    res.status(404).send("Order not found");
    return;
  }

  res.redirect(`/orders?status=${encodeURIComponent(order.workflow_status)}&updatedOrder=${encodeURIComponent(order.order_id)}`);
});

ordersRouter.post("/orders/:id/package", requireAuth, (req, res) => {
  const order = getSharedOrderById(req.params.id);
  if (!order) {
    res.status(404).send("Order not found");
    return;
  }

  if (order.workflow_status !== "new") {
    res.redirect(`/orders?status=${encodeURIComponent(order.workflow_status)}`);
    return;
  }

  const rawMode = typeof req.body.packageMode === "string" ? req.body.packageMode : PACKAGE_MODE.SINGLE_PACKAGE_B2C;
  const packageMode: PackageMode = rawMode === PACKAGE_MODE.MULTI_PACKAGE_B2B ? PACKAGE_MODE.MULTI_PACKAGE_B2B : PACKAGE_MODE.SINGLE_PACKAGE_B2C;

  const quantities = Array.isArray(req.body.boxQuantity) ? req.body.boxQuantity : [req.body.boxQuantity];
  const lengths = Array.isArray(req.body.boxLengthCm) ? req.body.boxLengthCm : [req.body.boxLengthCm];
  const widths = Array.isArray(req.body.boxWidthCm) ? req.body.boxWidthCm : [req.body.boxWidthCm];
  const heights = Array.isArray(req.body.boxHeightCm) ? req.body.boxHeightCm : [req.body.boxHeightCm];
  const perBoxWeights = Array.isArray(req.body.boxPerWeightKg) ? req.body.boxPerWeightKg : [req.body.boxPerWeightKg];

  const boxes: PackageBox[] = quantities
    .map((_, index) => {
      const no_of_boxes = Math.max(1, Math.round(Number(quantities[index]) || 1));
      const length_cm = Number(lengths[index]);
      const width_cm = Number(widths[index]);
      const height_cm = Number(heights[index]);
      const per_box_weight_kg = Number(perBoxWeights[index]);
      if (!length_cm || !width_cm || !height_cm || !per_box_weight_kg) {
        return null;
      }
      return {
        id: `pkg-${index + 1}`,
        no_of_boxes,
        per_box_weight_kg,
        length_cm,
        width_cm,
        height_cm
      };
    })
    .filter((box): box is PackageBox => box !== null);

  const totalWeight = boxes.reduce((sum, box) => sum + box.no_of_boxes * box.per_box_weight_kg, 0);

  updateSharedOrderPackageDetails(order.order_id, {
    package_mode: packageMode,
    boxes,
    total_weight_kg: totalWeight
  });

  res.redirect(`/orders?status=new&updatedOrder=${encodeURIComponent(order.order_id)}`);
});

ordersRouter.post("/orders/:id/actions", requireAuth, (req, res) => {
  const order = getSharedOrderById(req.params.id);
  if (!order) {
    res.status(404).send("Order not found");
    return;
  }

  const action = typeof req.body.action === "string" ? req.body.action : "";

  switch (action) {
    case "archive":
      archiveSharedOrder(order.order_id);
      res.redirect(`/orders?status=archive&updatedOrder=${encodeURIComponent(order.order_id)}`);
      return;
    case "clone": {
      const clone = cloneSharedOrder(order.order_id);
      res.redirect(`/orders?status=new&updatedOrder=${encodeURIComponent(clone?.order_id ?? order.order_id)}`);
      return;
    }
    case "delete":
      deleteSharedOrder(order.order_id);
      res.redirect("/orders?status=all");
      return;
    case "changePickupAddress":
      updateSharedOrderPickupAddress(order.order_id);
      res.redirect(`/orders?status=new&updatedOrder=${encodeURIComponent(order.order_id)}`);
      return;
    case "editOrder":
      res.redirect(`/orders?status=new&updatedOrder=${encodeURIComponent(order.order_id)}`);
      return;
    default:
      res.redirect(`/orders?status=${encodeURIComponent(order.workflow_status)}`);
  }
});
