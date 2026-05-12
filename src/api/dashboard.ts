import { apiFetch } from "./client.js";

export type DashboardKpi = {
  key: string;
  label: string;
  value: string;
  change: string;
  href: string;
};

export type DashboardViewModel = {
  generatedAt: string;
  dateRangeLabel: string;
  kpis: DashboardKpi[];
  shipmentStatuses: Array<{ key: string; label: string; count: number; href: string }>;
  providerDistribution: Array<{ provider: string; shipments: number; share: number }>;
  quickActions: Array<{ label: string; helper: string; href: string; disabled?: boolean }>;
  activity: Array<{ title: string; helper: string; time: string }>;
  walletTransactions: Array<{ title: string; amount: string; type: "credit" | "debit"; date: string }>;
  recentOrders: Array<{
    orderId: string;
    customerName: string;
    shipmentLabel: string;
    orderType: string;
    status: string;
    statusBadgeClass: string;
    date: string;
  }>;
};

export const getDashboard = () => apiFetch<{ dashboard: DashboardViewModel }>("/api/dashboard");
