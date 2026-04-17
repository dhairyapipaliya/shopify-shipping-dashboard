import { describe, expect, it } from "vitest";
import {
  deriveOrderOperationalStatus,
  matchesOrderStatusFilter,
  parseOrderStatusFilter
} from "../src/utils/orderStatuses.js";

describe("orderStatuses", () => {
  it("derives unbooked status when shipment does not exist", () => {
    expect(deriveOrderOperationalStatus(null)).toBe("unbooked");
  });

  it("normalizes known shipment statuses", () => {
    expect(deriveOrderOperationalStatus({ status: "IN_TRANSIT" })).toBe("inTransit");
    expect(deriveOrderOperationalStatus({ status: "RTO_DELIVERED" })).toBe("rtoDelivered");
  });

  it("matches direct status filters", () => {
    expect(matchesOrderStatusFilter("pickupScheduled", "pickupScheduled")).toBe(true);
    expect(matchesOrderStatusFilter("inTransit", "pickupScheduled")).toBe(false);
  });

  it("parses invalid filter values safely", () => {
    expect(parseOrderStatusFilter("unknown")).toBe("all");
  });
});
