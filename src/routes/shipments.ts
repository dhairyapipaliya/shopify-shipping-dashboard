import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { providerRegistry } from "../services/providers/providerRegistry.js";
import { syncFulfillmentToShopify } from "../services/shopify/fulfillmentSync.js";

export const shipmentRouter = Router();

shipmentRouter.post("/orders/:id/book", requireAuth, async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).send("Order not found");

  const provider = providerRegistry.get(req.body.provider);
  if (!provider) return res.status(400).send("Unknown provider");

  const booking = await provider.bookShipment({
    orderId: order.id,
    serviceName: String(req.body.serviceName),
    weightGrams: Number(req.body.weightGrams),
    lengthCm: Number(req.body.lengthCm),
    widthCm: Number(req.body.widthCm),
    heightCm: Number(req.body.heightCm),
    destinationPincode: order.pincode,
    orderValue: order.orderValue
  });

  const fulfillment = await syncFulfillmentToShopify({
    shopifyOrderId: order.shopifyOrderId,
    trackingNumber: booking.trackingNumber,
    trackingUrl: booking.trackingUrl
  });

  await prisma.shipment.create({
    data: {
      orderId: order.id,
      provider: booking.provider,
      serviceName: booking.serviceName,
      awbNumber: booking.awbNumber,
      awbSource: booking.awbSource,
      trackingNumber: booking.trackingNumber,
      trackingUrl: booking.trackingUrl,
      labelUrl: booking.labelUrl,
      providerPayload: booking.payload,
      shopifyFulfillmentId: fulfillment.fulfillmentId,
      shopifySyncStatus: fulfillment.status,
      shopifySyncError: fulfillment.error,
      status: "BOOKED"
    }
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      shopifySyncStatus: fulfillment.status,
      shopifySyncError: fulfillment.error ?? null
    }
  });

  res.redirect("/shipments");
});

shipmentRouter.get("/shipments", requireAuth, async (_req, res) => {
  const shipments = await prisma.shipment.findMany({ include: { order: true }, orderBy: { createdAt: "desc" } });
  res.render("shipments", { shipments });
});
