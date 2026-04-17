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

  it("treats booked/scheduled filter as umbrella for booked and pickup scheduled", () => {
    expect(matchesOrderStatusFilter("bookedScheduled", "bookedScheduled")).toBe(true);
    expect(matchesOrderStatusFilter("pickupScheduled", "bookedScheduled")).toBe(true);
    expect(matchesOrderStatusFilter("inTransit", "bookedScheduled")).toBe(false);
  });

  it("parses invalid filter values safely", () => {
    expect(parseOrderStatusFilter("unknown")).toBe("all");
  });
});
