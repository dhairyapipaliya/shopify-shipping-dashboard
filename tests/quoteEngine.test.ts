import { describe, expect, it } from "vitest";
import { rankQuotes } from "../src/services/quoteEngine.js";

describe("rankQuotes", () => {
  it("selects cheapest quote and computes savings", () => {
    const result = rankQuotes([
      { provider: "delhivery_direct", serviceName: "Direct", etaDays: 0, shippingCost: 82, codCharges: 10, supportsCod: true, supportsPrepaid: true, rawResponse: {} },
      { provider: "shipmozo_delhivery", serviceName: "Shipmozo", etaDays: 0, shippingCost: 70, codCharges: 10, supportsCod: true, supportsPrepaid: true, rawResponse: {} }
    ]);

    expect(result.cheapest?.provider).toBe("shipmozo_delhivery");
    expect(result.savingsAmount).toBe(12);
    expect(result.ranked[0].tags).toContain("cheapest");
  });
});
