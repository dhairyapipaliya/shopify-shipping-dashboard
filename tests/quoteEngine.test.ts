import { describe, expect, it } from "vitest";
import { rankQuotes } from "../src/services/quoteEngine.js";

describe("rankQuotes", () => {
  it("marks lowest total cost as advisory recommendation", () => {
    const result = rankQuotes([
      { provider: "delhivery_direct", serviceName: "Direct", etaDays: 3, shippingCost: 82, totalCost: 82, labelReady: true, trackingReady: true, rawResponse: {} },
      { provider: "shipmozo_delhivery", serviceName: "Via Shipmozo", etaDays: 2, shippingCost: 70, totalCost: 70, labelReady: true, trackingReady: true, rawResponse: {} }
    ]);

    expect(result.cheapest?.provider).toBe("shipmozo_delhivery");
    expect(result.savingsAmount).toBe(12);
    expect(result.ranked[0].tags).toContain("recommended");
  });
});
