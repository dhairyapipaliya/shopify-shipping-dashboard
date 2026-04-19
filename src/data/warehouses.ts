export type WarehouseRecord = {
  id: string;
  name: string;
  address: string;
  pincode: string;
};

const warehouseRecords: WarehouseRecord[] = [
  {
    id: "wh_blr_1",
    name: "Bangalore Main Warehouse",
    address: "No. 18, Electronic City Phase 1, Bengaluru, Karnataka",
    pincode: "560100"
  },
  {
    id: "wh_del_2",
    name: "Delhi NCR Hub",
    address: "Plot 77, Okhla Industrial Estate Phase 2, New Delhi, Delhi",
    pincode: "110020"
  },
  {
    id: "wh_mum_3",
    name: "Mumbai Dispatch Center",
    address: "Unit 5, Andheri Kurla Road, Mumbai, Maharashtra",
    pincode: "400059"
  }
];

export const listWarehouses = (): WarehouseRecord[] => warehouseRecords.map((warehouse) => ({ ...warehouse }));

export const getWarehouseById = (id: string): WarehouseRecord | undefined => warehouseRecords.find((warehouse) => warehouse.id === id);

export const createWarehouse = (input: Omit<WarehouseRecord, "id">): WarehouseRecord => {
  const warehouse: WarehouseRecord = {
    id: `wh_${crypto.randomUUID().slice(0, 8)}`,
    ...input
  };
  warehouseRecords.unshift(warehouse);
  return { ...warehouse };
};

export const updateWarehouse = (id: string, input: Omit<WarehouseRecord, "id">): WarehouseRecord | null => {
  const index = warehouseRecords.findIndex((warehouse) => warehouse.id === id);
  if (index === -1) {
    return null;
  }

  warehouseRecords[index] = {
    id,
    ...input
  };

  return { ...warehouseRecords[index] };
};
