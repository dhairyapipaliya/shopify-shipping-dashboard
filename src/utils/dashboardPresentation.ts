import { sharedDummyOrders } from "../data/sharedOrders.js";
import { dashboardShipmentStatusKeys, getOrderStatusBadgeClass, getOrderStatusLabel, type OperationalOrderStatus } from "./orderStatuses.js";

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
  status: string;
  statusBadgeClass: string;
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

const buildProviderSnapshotsFromSharedOrders = (): ProviderShipmentSnapshot[] => {
  const grouped = new Map<string, Partial<Record<OperationalOrderStatus, number>>>();

  for (const order of sharedDummyOrders) {
    if (!grouped.has(order.assigned_provider)) {
      grouped.set(order.assigned_provider, {});
    }

    const providerStatuses = grouped.get(order.assigned_provider);
    if (!providerStatuses) continue;

    providerStatuses[order.workflow_status] = (providerStatuses[order.workflow_status] ?? 0) + 1;
  }

  return Array.from(grouped.entries()).map(([provider, statuses]) => ({ provider, statuses }));
};

const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(isoDate));

export const getDashboardViewModel = (): DashboardViewModel => {
  const providerSnapshots = buildProviderSnapshotsFromSharedOrders();
  const totals = aggregateShipmentStatuses(providerSnapshots);
  const totalTrackedShipments = Object.values(totals).reduce((sum, value) => sum + value, 0);
  const unbookedCount = sharedDummyOrders.filter((order) => order.workflow_status === "new").length;
  const recentOrders: DashboardRecentOrder[] = sharedDummyOrders.map((order) => ({
    orderId: order.order_number,
    customerName: order.shipping_address.name,
    shipmentLabel: order.line_items.map((item) => item.title).join(", "),
    orderType: order.payment_type,
    status: getOrderStatusLabel(order.workflow_status),
    statusBadgeClass: getOrderStatusBadgeClass(order.workflow_status),
    date: formatDate(order.created_at)
  }));

  return {
    generatedAt: "Updated 5 mins ago",
    dateRangeLabel: "Last 30 days",
    kpis: [
      { key: "totalShipments", label: "Total Shipments", value: String(sharedDummyOrders.length), change: "Shared mock set", href: "/orders?status=all" },
      { key: "todayShipment", label: "Today Shipment", value: String(totals.pickupsAndManifests), change: "Dummy Shopify orders", href: "/orders?status=pickupsAndManifests" },
      { key: "avgShipmentCost", label: "Avg Shipment Cost", value: "₹86.40", change: "Mock benchmark", href: "/quotes" },
      { key: "unshippedOrders", label: "Unshipped Orders", value: String(unbookedCount), change: "Needs attention", href: "/orders?status=new" }
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
