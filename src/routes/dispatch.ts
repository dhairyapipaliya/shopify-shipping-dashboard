import { Router } from "express";
import { getSharedOrderById, updateSharedOrderCourierAssignment } from "../data/sharedOrders.js";
import { requireAuth } from "../middleware/auth.js";
import { getDispatchRateOptions } from "../services/dispatchRates.js";

export const dispatchRouter = Router();

dispatchRouter.get("/dispatch/:orderId", requireAuth, (req, res) => {
  const order = getSharedOrderById(req.params.orderId);

  if (!order) {
    res.status(404).send("Order not found");
    return;
  }

  const rates = getDispatchRateOptions(order);
  const selectedRateId = typeof req.query.selectedRate === "string" ? req.query.selectedRate : "";
  const selectedRate = rates.find((rate) => rate.id === selectedRateId);

  res.render("dispatch", {
    order,
    rates,
    selectedRateId,
    selectedRate,
    selectedProvider: order.assigned_provider
  });
});

dispatchRouter.post("/dispatch/:orderId/select", requireAuth, (req, res) => {
  const order = getSharedOrderById(req.params.orderId);

  if (!order) {
    res.status(404).send("Order not found");
    return;
  }

  const selectedRateId = typeof req.body.rateId === "string" ? req.body.rateId : "";
  const rates = getDispatchRateOptions(order);
  const selectedRate = rates.find((rate) => rate.id === selectedRateId);

  if (!selectedRate) {
    res.redirect(`/dispatch/${encodeURIComponent(order.order_id)}?error=invalid-rate`);
    return;
  }

  updateSharedOrderCourierAssignment(order.order_id, selectedRate.providerName);

  res.redirect(`/dispatch/${encodeURIComponent(order.order_id)}?selectedRate=${encodeURIComponent(selectedRate.id)}`);
});
