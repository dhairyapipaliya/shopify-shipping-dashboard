export const orderStatusFilters = [
  { value: "all", label: "All" },
  { value: "unbooked", label: "Unbooked" },
  { value: "pickupScheduled", label: "Pickup Scheduled" },
  { value: "inTransit", label: "In Transit" },
  { value: "outForDelivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "ndr", label: "NDR" },
  { value: "rtoInTransit", label: "RTO In Transit" },
  { value: "rtoDelivered", label: "RTO Delivered" },
  { value: "undelivered", label: "Undelivered" }
] as const;

export type OrderStatusFilter = (typeof orderStatusFilters)[number]["value"];
export type OperationalOrderStatus = Exclude<OrderStatusFilter, "all">;

export const dashboardShipmentStatusKeys = [
  "pickupScheduled",
  "inTransit",
  "delivered",
  "undelivered",
  "outForDelivery",
  "rtoInTransit",
  "rtoDelivered",
  "ndr"
] as const satisfies OperationalOrderStatus[];

const statusLabelMap = Object.fromEntries(orderStatusFilters.map((status) => [status.value, status.label])) as Record<OrderStatusFilter, string>;

const shipmentStatusMap: Record<string, OperationalOrderStatus> = {
  DRAFT: "pickupScheduled",
  BOOKED: "pickupScheduled",
  PICKUP_SCHEDULED: "pickupScheduled",
  IN_TRANSIT: "inTransit",
  OUT_FOR_DELIVERY: "outForDelivery",
  DELIVERED: "delivered",
  NDR: "ndr",
  RTO_IN_TRANSIT: "rtoInTransit",
  RTO_DELIVERED: "rtoDelivered",
  UNDELIVERED: "undelivered",
  CANCELLED: "undelivered"
};

export const parseOrderStatusFilter = (value: unknown): OrderStatusFilter => {
  if (typeof value !== "string") return "all";
  return orderStatusFilters.some((status) => status.value === value) ? (value as OrderStatusFilter) : "all";
};

export const normalizeShipmentStatus = (rawStatus: string | null | undefined): OperationalOrderStatus => {
  if (!rawStatus) return "pickupScheduled";
  return shipmentStatusMap[rawStatus.toUpperCase()] ?? "pickupScheduled";
};

export const deriveOrderOperationalStatus = (latestShipment?: { status: string } | null): OperationalOrderStatus => {
  if (!latestShipment) return "unbooked";
  return normalizeShipmentStatus(latestShipment.status);
};

export const matchesOrderStatusFilter = (status: OperationalOrderStatus, selectedFilter: OrderStatusFilter): boolean => {
  if (selectedFilter === "all") return true;
  return status === selectedFilter;
};

export const getOrderStatusLabel = (status: OperationalOrderStatus): string => statusLabelMap[status];

export const getOrderStatusBadgeClass = (status: OperationalOrderStatus): string => {
  switch (status) {
    case "delivered":
      return "badge-green";
    case "inTransit":
    case "outForDelivery":
    case "pickupScheduled":
      return "badge-blue";
    case "unbooked":
      return "badge-slate";
    default:
      return "badge-amber";
  }
};
