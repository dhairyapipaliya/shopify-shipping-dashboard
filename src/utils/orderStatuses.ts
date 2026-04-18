export const orderStatusFilters = [
  { value: "new", label: "New" },
  { value: "courierAssigned", label: "Courier Assigned" },
  { value: "pickupsAndManifests", label: "Pickups & Manifests" },
  { value: "inTransit", label: "In Transit" },
  { value: "outForDelivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "ndr", label: "NDR" },
  { value: "rtoInTransit", label: "RTO In-Transit" },
  { value: "rtoDelivered", label: "RTO Delivered" },
  { value: "all", label: "All" },
  { value: "archive", label: "Archive" }
] as const;

export type OrderStatusFilter = (typeof orderStatusFilters)[number]["value"];
export type OperationalOrderStatus = Exclude<OrderStatusFilter, "all">;

export const orderStatusWorkflowGroups = [
  {
    title: "Shipment Booking",
    statuses: ["new", "courierAssigned", "pickupsAndManifests"]
  },
  {
    title: "Shipment Journey",
    statuses: ["inTransit", "outForDelivery", "delivered"]
  },
  {
    title: "NDR Exceptions",
    statuses: ["ndr", "rtoInTransit", "rtoDelivered"]
  },
  {
    title: "Utility",
    statuses: ["all", "archive"]
  }
] as const satisfies ReadonlyArray<{ title: string; statuses: readonly OrderStatusFilter[] }>;

export const dashboardShipmentStatusKeys = [
  "new",
  "courierAssigned",
  "pickupsAndManifests",
  "inTransit",
  "outForDelivery",
  "delivered",
  "ndr",
  "rtoInTransit",
  "rtoDelivered"
] as const satisfies OperationalOrderStatus[];

const statusLabelMap = Object.fromEntries(orderStatusFilters.map((status) => [status.value, status.label])) as Record<OrderStatusFilter, string>;

const legacyFilterMap: Partial<Record<string, OrderStatusFilter>> = {
  unbooked: "new",
  pickupScheduled: "pickupsAndManifests",
  undelivered: "ndr"
};

const shipmentStatusMap: Record<string, OperationalOrderStatus> = {
  UNBOOKED: "new",
  NEW: "new",
  ASSIGNED: "courierAssigned",
  COURIER_ASSIGNED: "courierAssigned",
  DRAFT: "pickupsAndManifests",
  BOOKED: "pickupsAndManifests",
  PICKUP_SCHEDULED: "pickupsAndManifests",
  PICKUPS_AND_MANIFESTS: "pickupsAndManifests",
  IN_TRANSIT: "inTransit",
  OUT_FOR_DELIVERY: "outForDelivery",
  DELIVERED: "delivered",
  NDR: "ndr",
  RTO_IN_TRANSIT: "rtoInTransit",
  RTO_DELIVERED: "rtoDelivered",
  UNDELIVERED: "ndr",
  CANCELLED: "archive",
  ARCHIVE: "archive",
  ARCHIVED: "archive"
};

export const parseOrderStatusFilter = (value: unknown): OrderStatusFilter => {
  if (typeof value !== "string") return "all";
  if (orderStatusFilters.some((status) => status.value === value)) {
    return value as OrderStatusFilter;
  }

  return legacyFilterMap[value] ?? "all";
};

export const normalizeShipmentStatus = (rawStatus: string | null | undefined): OperationalOrderStatus => {
  if (!rawStatus) return "pickupsAndManifests";
  return shipmentStatusMap[rawStatus.toUpperCase()] ?? "pickupsAndManifests";
};

export const deriveOrderOperationalStatus = (latestShipment?: { status: string } | null): OperationalOrderStatus => {
  if (!latestShipment) return "new";
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
    case "pickupsAndManifests":
    case "courierAssigned":
      return "badge-blue";
    case "new":
    case "archive":
      return "badge-slate";
    default:
      return "badge-amber";
  }
};
