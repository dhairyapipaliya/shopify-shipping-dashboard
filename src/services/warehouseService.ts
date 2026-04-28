import { lookupIndianPincode } from "./pincodeLookupService.js";
import { normalizeWarehouseRecord, type WarehouseRecordInput } from "../data/warehouses.js";

export const normalizeWarehouseInput = async (input: WarehouseRecordInput): Promise<WarehouseRecordInput> => {
  const normalized = normalizeWarehouseRecord(input);

  if (!normalized.city || !normalized.state) {
    const lookup = await lookupIndianPincode(normalized.pincode);
    if (lookup) {
      return {
        ...normalized,
        city: normalized.city || lookup.city,
        state: normalized.state || lookup.state
      };
    }
  }

  return normalized;
};
