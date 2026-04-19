import { Router } from "express";
import { getSharedOrderById, updateSharedOrderCourierAssignment } from "../data/sharedOrders.js";
import { requireAuth } from "../middleware/auth.js";
import { getDispatchRateOptions, getDispatchRateProviderGroups } from "../services/dispatchRates.js";

export const dispatchRouter = Router();

dispatchRouter.get("/dispatch/:orderId", requireAuth, (req, res) => {
  const order = getSharedOrderById(req.params.orderId);

  if (!order) {
    res.status(404).send("Order not found");
    return;
  }

  const rateGroups = getDispatchRateProviderGroups(order);
  const rates = rateGroups.flatMap((group) => group.options);
  const selectedRateId = typeof req.query.selectedRate === "string" ? req.query.selectedRate : "";
  const selectedRate = rates.find((rate) => rate.option_id === selectedRateId);
  const errorCode = typeof req.query.error === "string" ? req.query.error : "";

  res.render("dispatch", {
    order,
    rateGroups,
    rates,
    selectedRateId,
    selectedRate,
    errorCode,
    selectedProvider: order.assigned_provider
  });
});

dispatchRouter.post("/dispatch/:orderId/select", requireAuth, (req, res) => {
  const order = getSharedOrderById(req.params.orderId);

  if (!order) {
    res.status(404).send("Order not found");
    return;
  }

  if (order.workflow_status !== "new") {
    res.redirect(`/dispatch/${encodeURIComponent(order.order_id)}?error=status-locked`);
    return;
  }

  const selectedRateId = typeof req.body.rateId === "string" ? req.body.rateId : "";
  const rates = getDispatchRateOptions(order);
  const selectedRate = rates.find((rate) => rate.option_id === selectedRateId);

  if (!selectedRate) {
    res.redirect(`/dispatch/${encodeURIComponent(order.order_id)}?error=invalid-rate`);
    return;
  }

  updateSharedOrderCourierAssignment(order.order_id, selectedRate);

  res.redirect(`/orders?status=pickupsAndManifests&updatedOrder=${encodeURIComponent(order.order_id)}`);
});
