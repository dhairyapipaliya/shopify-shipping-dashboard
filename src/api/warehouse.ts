import { apiFetch } from "./client.js";

export type Warehouse = {
  id: string;
  name: string;
  contact_person_name: string;
  phone: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
};

export const getWarehouses = () =>
  apiFetch<{ warehouses: Warehouse[]; pincodeDirectory: unknown }>("/api/warehouse");

export const saveWarehouse = (data: Partial<Warehouse> & { id?: string }) =>
  apiFetch<{ warehouse: Warehouse }>("/api/warehouse", {
    method: "POST",
    body: JSON.stringify(data)
  });

export const deleteWarehouse = (id: string) =>
  apiFetch<{ ok: boolean }>(`/api/warehouse/${id}`, { method: "DELETE" });

export const lookupPincode = (pincode: string) =>
  apiFetch<{ city: string; state: string; district: string }>(`/api/pincode/${pincode}`);
