import { describe, expect, it } from "vitest";
import { aggregateShipmentStatuses } from "../src/utils/dashboardPresentation.js";

describe("aggregateShipmentStatuses", () => {
  it("combines status counts from multiple providers", () => {
    const totals = aggregateShipmentStatuses([
      { provider: "Shipmozo", statuses: { ndr: 2, delivered: 7, inTransit: 3 } },
      { provider: "Delhivery", statuses: { ndr: 1, delivered: 5, inTransit: 4 } }
    ]);

    expect(totals.ndr).toBe(3);
    expect(totals.delivered).toBe(12);
    expect(totals.inTransit).toBe(7);
  });
});
