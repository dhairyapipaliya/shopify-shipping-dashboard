import { describe, expect, it } from "vitest";
import {
  deriveOrderOperationalStatus,
  matchesOrderStatusFilter,
  parseOrderStatusFilter
} from "../src/utils/orderStatuses.js";

describe("orderStatuses", () => {
  it("derives new status when shipment does not exist", () => {
    expect(deriveOrderOperationalStatus(null)).toBe("new");
  });

  it("normalizes known shipment statuses", () => {
    expect(deriveOrderOperationalStatus({ status: "COURIER_ASSIGNED" })).toBe("courierAssigned");
    expect(deriveOrderOperationalStatus({ status: "RTO_DELIVERED" })).toBe("rtoDelivered");
  });

  it("supports legacy and current filter values", () => {
    expect(parseOrderStatusFilter("pickupScheduled")).toBe("pickupsAndManifests");
    expect(parseOrderStatusFilter("new")).toBe("new");
  });

  it("matches direct status filters", () => {
    expect(matchesOrderStatusFilter("pickupsAndManifests", "pickupsAndManifests")).toBe(true);
    expect(matchesOrderStatusFilter("inTransit", "pickupsAndManifests")).toBe(false);
  });

  it("parses invalid filter values safely", () => {
    expect(parseOrderStatusFilter("unknown")).toBe("all");
  });
});
