import { dashboardShipmentStatusKeys, getOrderStatusLabel, type OperationalOrderStatus } from "./orderStatuses.js";

export type ProviderShipmentSnapshot = {
  provider: string;
  statuses: Partial<Record<OperationalOrderStatus, number>>;
};

export type DashboardKpi = {
  key: "totalShipments" | "todayShipment" | "avgShipmentCost" | "unshippedOrders";
  label: string;
  value: string;
  change: string;
  href: string;
};

export type DashboardQuickAction = {
  label: string;
  helper: string;
  href: string;
  disabled?: boolean;
};

export type DashboardRecentOrder = {
  orderId: string;
  customerName: string;
  shipmentLabel: string;
  orderType: "Prepaid" | "COD";
  status: "Pending" | "Booked" | "In Transit" | "Delivered";
  date: string;
};

export type DashboardActivityItem = {
  title: string;
  helper: string;
  time: string;
};

export type DashboardViewModel = {
  generatedAt: string;
  dateRangeLabel: string;
  kpis: DashboardKpi[];
  shipmentStatuses: Array<{ key: OperationalOrderStatus; label: string; count: number; href: string }>;
  providerDistribution: Array<{ provider: string; shipments: number; share: number }>;
  quickActions: DashboardQuickAction[];
  activity: DashboardActivityItem[];
  walletTransactions: Array<{ title: string; amount: string; type: "credit" | "debit"; date: string }>;
  recentOrders: DashboardRecentOrder[];
};

export const aggregateShipmentStatuses = (snapshots: ProviderShipmentSnapshot[]) => {
  const totals = Object.fromEntries(dashboardShipmentStatusKeys.map((status) => [status, 0])) as Record<
    (typeof dashboardShipmentStatusKeys)[number],
    number
  >;

  for (const snapshot of snapshots) {
    for (const status of dashboardShipmentStatusKeys) {
      totals[status] += snapshot.statuses[status] ?? 0;
    }
  }

  return totals;
};

const providerSnapshots: ProviderShipmentSnapshot[] = [
  {
    provider: "Shipmozo",
    statuses: {
      pickupScheduled: 42,
      inTransit: 116,
      delivered: 804,
      undelivered: 22,
      outForDelivery: 37,
      rtoInTransit: 12,
      rtoDelivered: 6,
      ndr: 2
    }
  },
  {
    provider: "Delhivery",
    statuses: {
      pickupScheduled: 31,
      inTransit: 98,
      delivered: 702,
      undelivered: 18,
      outForDelivery: 29,
      rtoInTransit: 11,
      rtoDelivered: 8,
      ndr: 1
    }
  }
];

const recentOrders: DashboardRecentOrder[] = [
  { orderId: "#100451", customerName: "Aarav Mehta", shipmentLabel: "Wireless Keyboard", orderType: "Prepaid", status: "Booked", date: "Apr 17, 2026" },
  { orderId: "#100450", customerName: "Riya Sharma", shipmentLabel: "Skincare Combo", orderType: "COD", status: "In Transit", date: "Apr 17, 2026" },
  { orderId: "#100449", customerName: "Kabir Khan", shipmentLabel: "Sports Bottle Pack", orderType: "Prepaid", status: "Pending", date: "Apr 17, 2026" },
  { orderId: "#100448", customerName: "Neha Verma", shipmentLabel: "Noise Cancelling Earbuds", orderType: "COD", status: "Delivered", date: "Apr 16, 2026" },
  { orderId: "#100447", customerName: "Ishaan Das", shipmentLabel: "Cotton T-Shirt Set", orderType: "Prepaid", status: "Booked", date: "Apr 16, 2026" },
  { orderId: "#100446", customerName: "Diya Iyer", shipmentLabel: "Kitchen Organizer", orderType: "COD", status: "In Transit", date: "Apr 16, 2026" },
  { orderId: "#100445", customerName: "Arjun Patel", shipmentLabel: "Fitness Resistance Bands", orderType: "Prepaid", status: "Delivered", date: "Apr 15, 2026" },
  { orderId: "#100444", customerName: "Myra Sen", shipmentLabel: "Phone Case Duo", orderType: "COD", status: "Booked", date: "Apr 15, 2026" },
  { orderId: "#100443", customerName: "Yash Gupta", shipmentLabel: "Travel Pouch", orderType: "Prepaid", status: "Pending", date: "Apr 15, 2026" },
  { orderId: "#100442", customerName: "Anaya Roy", shipmentLabel: "Coffee Mug Gift Box", orderType: "COD", status: "In Transit", date: "Apr 14, 2026" }
];

export const getDashboardViewModel = (): DashboardViewModel => {
  const totals = aggregateShipmentStatuses(providerSnapshots);
  const totalTrackedShipments = Object.values(totals).reduce((sum, value) => sum + value, 0);

  return {
    generatedAt: "Updated 5 mins ago",
    dateRangeLabel: "Last 30 days",
    kpis: [
      { key: "totalShipments", label: "Total Shipments", value: "2,146", change: "+12.4% vs last month", href: "/shipments" },
      { key: "todayShipment", label: "Today Shipment", value: "87", change: "+8 since yesterday", href: "/orders?status=bookedScheduled" },
      { key: "avgShipmentCost", label: "Avg Shipment Cost", value: "₹86.40", change: "-₹3.20 optimization", href: "/quotes" },
      { key: "unshippedOrders", label: "Unshipped Orders", value: "39", change: "Needs attention", href: "/orders?status=unbooked" }
    ],
    shipmentStatuses: dashboardShipmentStatusKeys.map((status) => ({
      key: status,
      label: getOrderStatusLabel(status),
      count: totals[status],
      href: `/orders?status=${status}`
    })),
    providerDistribution: providerSnapshots.map((snapshot) => {
      const shipments = dashboardShipmentStatusKeys.reduce((sum, key) => sum + (snapshot.statuses[key] ?? 0), 0);
      return {
        provider: snapshot.provider,
        shipments,
        share: totalTrackedShipments ? Math.round((shipments / totalTrackedShipments) * 100) : 0
      };
    }),
    quickActions: [
      { label: "Rate Calculator", helper: "Compare prices instantly", href: "/quotes" },
      { label: "Add Warehouse", helper: "Configure pickup location", href: "#" },
      { label: "Recharge Wallet", helper: "Top up for uninterrupted booking", href: "#" },
      { label: "My Profile", helper: "Manage account details", href: "#" },
      { label: "Early COD Plan", helper: "Enable early remittance", href: "#" },
      { label: "Transporter ID", helper: "Update transporter information", href: "#" }
    ],
    activity: [
      { title: "Bulk booking completed", helper: "24 shipments booked via Shipmozo", time: "10 mins ago" },
      { title: "Wallet low-balance alert", helper: "Balance below ₹2,000", time: "32 mins ago" },
      { title: "NDR flagged", helper: "1 Delhivery shipment requires action", time: "1 hr ago" }
    ],
    walletTransactions: [
      { title: "Wallet Recharge", amount: "+₹10,000", type: "credit", date: "Apr 17" },
      { title: "Shipment Booking Debits", amount: "-₹3,742", type: "debit", date: "Apr 17" },
      { title: "COD Remittance", amount: "+₹6,280", type: "credit", date: "Apr 16" }
    ],
    recentOrders
  };
};
