import { Router } from "express";
import { logger } from "../utils/logger.js";

export const webhookRouter = Router();

webhookRouter.post("/webhooks/shopify", (req, res) => {
  logger.info("Received Shopify webhook placeholder", {
    topic: req.header("X-Shopify-Topic"),
    webhookId: req.header("X-Shopify-Webhook-Id")
  });
  res.status(202).json({ accepted: true, provider: "shopify", mode: "placeholder" });
});

webhookRouter.post("/webhooks/delhivery", (req, res) => {
  logger.info("Received Delhivery webhook placeholder", { body: req.body });
  res.status(202).json({ accepted: true, provider: "delhivery", mode: "placeholder" });
});

webhookRouter.post("/webhooks/shipmozo", (req, res) => {
  logger.info("Received Shipmozo webhook placeholder", { body: req.body });
  res.status(202).json({ accepted: true, provider: "shipmozo", mode: "placeholder" });
});
