import { apiFetch } from "./client.js";

export type DispatchRate = {
  option_id: string;
  label: string;
  provider: string;
  etaDays: number;
  price: number;
  [key: string]: unknown;
};

export type DispatchRateGroup = {
  provider: string;
  options: DispatchRate[];
};

export type DispatchResponse = {
  order: unknown;
  rateGroups: DispatchRateGroup[];
  rates: DispatchRate[];
  selectedProvider: string;
};

export const getDispatch = (orderId: string) =>
  apiFetch<DispatchResponse>(`/api/dispatch/${orderId}`);

export const selectDispatchRate = (orderId: string, rateId: string) =>
  apiFetch<{ ok: boolean; orderId: string; selectedRate: DispatchRate }>(
    `/api/dispatch/${orderId}/select`,
    { method: "POST", body: JSON.stringify({ rateId }) }
  );
