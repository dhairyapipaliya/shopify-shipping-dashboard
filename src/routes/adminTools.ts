import { Router } from "express";
import type { PaymentMode } from "@prisma/client";
import { requireAuth } from "../middleware/auth.js";
import { rankQuotes } from "../services/quoteEngine.js";
import { providerRegistry } from "../services/providers/providerRegistry.js";

export const adminToolsRouter = Router();

adminToolsRouter.get("/admin/test-quotes", requireAuth, (_req, res) => {
  res.render("testQuotes", {
    result: null,
    form: { destinationPincode: "", weightGrams: "", lengthCm: "", widthCm: "", heightCm: "", paymentMode: "PREPAID", orderValue: "0" }
  });
});

adminToolsRouter.post("/admin/test-quotes", requireAuth, async (req, res) => {
  const form = {
    destinationPincode: String(req.body.destinationPincode ?? "").trim(),
    weightGrams: Number(req.body.weightGrams ?? 0),
    lengthCm: Number(req.body.lengthCm ?? 0),
    widthCm: Number(req.body.widthCm ?? 0),
    heightCm: Number(req.body.heightCm ?? 0),
    paymentMode: (req.body.paymentMode === "COD" ? "COD" : "PREPAID") as PaymentMode,
    orderValue: Number(req.body.orderValue ?? 0)
  };

  const providersToCompare = providerRegistry
    .list()
    .filter((provider) => provider.name === "delhivery_direct" || provider.name === "shipmozo_delhivery");

  const quotes = (
    await Promise.all(providersToCompare.map((provider) => provider.getQuotes({
      orderId: "manual-test",
      weightGrams: form.weightGrams,
      lengthCm: form.lengthCm,
      widthCm: form.widthCm,
      heightCm: form.heightCm,
      destinationPincode: form.destinationPincode,
      paymentMode: form.paymentMode,
      orderValue: form.orderValue
    })))
  ).flat();

  const result = rankQuotes(quotes);

  res.render("testQuotes", {
    form,
    result
  });
});
