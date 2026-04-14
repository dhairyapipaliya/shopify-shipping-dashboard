import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { rankQuotes } from "../services/quoteEngine.js";
import { providerRegistry } from "../services/providers/providerRegistry.js";

export const adminToolsRouter = Router();

adminToolsRouter.get("/admin/test-quotes", requireAuth, (_req, res) => {
  res.render("testQuotes", {
    result: null,
    form: { destinationPincode: "", weightGrams: "", lengthCm: "", widthCm: "", heightCm: "", orderValue: "0" }
  });
});

adminToolsRouter.post("/admin/test-quotes", requireAuth, async (req, res) => {
  const form = {
    destinationPincode: String(req.body.destinationPincode ?? "").trim(),
    weightGrams: Number(req.body.weightGrams ?? 0),
    lengthCm: Number(req.body.lengthCm ?? 0),
    widthCm: Number(req.body.widthCm ?? 0),
    heightCm: Number(req.body.heightCm ?? 0),
    orderValue: Number(req.body.orderValue ?? 0)
  };

  const providersToCompare = providerRegistry.list().filter((p) => ["delhivery_direct", "shipmozo_delhivery"].includes(p.name));

  const quotes = (
    await Promise.all(providersToCompare.map((provider) => provider.getQuotes({
      orderId: "manual-test",
      weightGrams: form.weightGrams,
      lengthCm: form.lengthCm,
      widthCm: form.widthCm,
      heightCm: form.heightCm,
      destinationPincode: form.destinationPincode,
      orderValue: form.orderValue
    })))
  ).flat();

  res.render("testQuotes", { form, result: rankQuotes(quotes) });
});
