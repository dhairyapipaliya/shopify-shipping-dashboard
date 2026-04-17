import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { providerRegistry } from "../services/providers/providerRegistry.js";
import { selectShipmentsForDisplay } from "../utils/shipmentDisplay.js";

export const shipmentRouter = Router();

shipmentRouter.post("/orders/:id/book", requireAuth, async (req, res) => {
  const { provider: providerName, serviceName } = req.body;
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });

  if (!order) {
    res.status(404).send("Order not found");
    return;
  }

  const provider = providerRegistry.get(providerName);
  if (!provider) {
    res.status(400).send("Unknown provider");
    return;
  }

  const booking = await provider.bookShipment({
    orderId: order.id,
    serviceName,
    weightGrams: order.totalWeightGrams,
    lengthCm: order.lengthCm,
    widthCm: order.widthCm,
    heightCm: order.heightCm,
    destinationPincode: order.pincode,
    paymentMode: order.paymentMode,
    orderValue: order.orderValue
  });

  await prisma.shipment.create({
    data: {
      orderId: order.id,
      provider: booking.provider,
      serviceName: booking.serviceName,
      awbNumber: booking.awbNumber,
      trackingUrl: booking.trackingUrl,
      labelUrl: booking.labelUrl,
      providerPayload: booking.payload,
      status: "BOOKED"
    }
  });

  res.redirect("/shipments");
});

shipmentRouter.get("/shipments", requireAuth, async (_req, res) => {
  const shipments = await prisma.shipment.findMany({
    include: { order: true },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }]
  });

  const shipmentRows = selectShipmentsForDisplay(shipments);

  res.render("shipments", { shipments: shipmentRows });
});
