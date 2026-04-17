export type ShipmentForDisplay = {
  id: string;
  orderId: string;
  provider: string;
  serviceName: string;
  awbNumber: string;
  trackingUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const hasTrackingDetails = (shipment: ShipmentForDisplay) =>
  Boolean(shipment.awbNumber?.trim()) || Boolean(shipment.trackingUrl?.trim());

const dedupeFingerprint = (shipment: ShipmentForDisplay) => {
  const awb = shipment.awbNumber?.trim();
  if (awb) return `${shipment.orderId}::awb::${awb}`;

  const tracking = shipment.trackingUrl?.trim();
  if (tracking) return `${shipment.orderId}::tracking::${tracking}`;

  return `${shipment.orderId}::${shipment.provider}::${shipment.serviceName}`;
};

const compareRelevance = (a: ShipmentForDisplay, b: ShipmentForDisplay) => {
  const aHasTracking = hasTrackingDetails(a);
  const bHasTracking = hasTrackingDetails(b);

  if (aHasTracking !== bHasTracking) {
    return aHasTracking ? -1 : 1;
  }

  const updatedDiff = b.updatedAt.getTime() - a.updatedAt.getTime();
  if (updatedDiff !== 0) {
    return updatedDiff;
  }

  return b.createdAt.getTime() - a.createdAt.getTime();
};

export const selectShipmentsForDisplay = <T extends ShipmentForDisplay>(shipments: T[]): T[] => {
  const byOrder = new Map<string, T[]>();

  for (const shipment of shipments) {
    const existing = byOrder.get(shipment.orderId) ?? [];
    existing.push(shipment);
    byOrder.set(shipment.orderId, existing);
  }

  const result: T[] = [];

  for (const orderShipments of byOrder.values()) {
    const uniqueByFingerprint = new Map<string, T>();

    for (const shipment of orderShipments) {
      const key = dedupeFingerprint(shipment);
      const current = uniqueByFingerprint.get(key);

      if (!current || compareRelevance(shipment, current) < 0) {
        uniqueByFingerprint.set(key, shipment);
      }
    }

    const selected = Array.from(uniqueByFingerprint.values()).sort(compareRelevance)[0];
    if (selected) {
      result.push(selected);
    }
  }

  return result.sort(compareRelevance);
};
