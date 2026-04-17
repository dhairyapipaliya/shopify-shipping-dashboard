import { describe, expect, it } from "vitest";
import { selectShipmentsForDisplay, type ShipmentForDisplay } from "../src/utils/shipmentDisplay.js";

const baseShipment = (overrides: Partial<ShipmentForDisplay>): ShipmentForDisplay => ({
  id: "s-1",
  orderId: "o-1",
  provider: "delhivery",
  serviceName: "surface",
  awbNumber: "AWB-1",
  trackingUrl: "https://tracking/1",
  createdAt: new Date("2026-01-01T10:00:00.000Z"),
  updatedAt: new Date("2026-01-01T10:00:00.000Z"),
  ...overrides
});

describe("selectShipmentsForDisplay", () => {
  it("keeps only one most relevant shipment per order", () => {
    const result = selectShipmentsForDisplay([
      baseShipment({ id: "s-older", orderId: "o-1", awbNumber: "", trackingUrl: null, updatedAt: new Date("2026-01-01T09:00:00.000Z") }),
      baseShipment({ id: "s-newer", orderId: "o-1", awbNumber: "AWB-99", trackingUrl: "https://tracking/99", updatedAt: new Date("2026-01-01T11:00:00.000Z") }),
      baseShipment({ id: "s-other", orderId: "o-2", awbNumber: "AWB-2", trackingUrl: "https://tracking/2" })
    ]);

    expect(result).toHaveLength(2);
    expect(result.find((row) => row.orderId === "o-1")?.id).toBe("s-newer");
    expect(result.find((row) => row.orderId === "o-2")?.id).toBe("s-other");
  });

  it("prefers records with tracking details over newer incomplete records", () => {
    const result = selectShipmentsForDisplay([
      baseShipment({ id: "s-complete", orderId: "o-3", awbNumber: "AWB-3", trackingUrl: "https://tracking/3", updatedAt: new Date("2026-01-01T10:00:00.000Z") }),
      baseShipment({ id: "s-incomplete", orderId: "o-3", awbNumber: "", trackingUrl: null, updatedAt: new Date("2026-01-01T12:00:00.000Z") })
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("s-complete");
  });
});
