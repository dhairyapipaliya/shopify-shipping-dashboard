import { apiFetch } from "./client.js";

export type OrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  operationalStatus: string;
  [key: string]: unknown;
};

export type OrdersResponse = {
  orders: OrderRow[];
  selectedStatus: string;
  statusOptions: Array<{ value: string; label: string }>;
  statusGroups: unknown;
  statusCounts: Record<string, number>;
};

export const getOrders = (status?: string) => {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<OrdersResponse>(`/api/orders${qs}`);
};

export const syncOrders = () =>
  apiFetch<{ synced: number }>("/api/orders/sync", { method: "POST" });

export const getNewOrderForm = () => apiFetch<unknown>("/api/orders/new-form");

export const getOrderQuotes = (id: string) => apiFetch<unknown>(`/api/orders/${id}/quotes`);

export const bookOrder = (id: string, provider: string, serviceName: string) =>
  apiFetch<unknown>(`/api/orders/${id}/book`, {
    method: "POST",
    body: JSON.stringify({ provider, serviceName })
  });

export const updateOrderPackage = (id: string, data: unknown) =>
  apiFetch<unknown>(`/api/orders/${id}/package`, {
    method: "POST",
    body: JSON.stringify(data)
  });

export const orderAction = (id: string, action: string) =>
  apiFetch<unknown>(`/api/orders/${id}/actions`, {
    method: "POST",
    body: JSON.stringify({ action })
  });
