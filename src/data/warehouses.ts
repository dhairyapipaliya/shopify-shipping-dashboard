export type WarehouseRecord = {
  id: string;
  name: string;
  contact_person_name: string;
  phone: string;
  address: string;
  pincode: string;
};

const warehouseRecords: WarehouseRecord[] = [
  {
    id: "wh_blr_1",
    name: "Bangalore Main Warehouse",
    contact_person_name: "Rohit Kumar",
    phone: "+91 90000 11111",
    address: "No. 18, Electronic City Phase 1, Bengaluru, Karnataka",
    pincode: "560100"
  },
  {
    id: "wh_del_2",
    name: "Delhi NCR Hub",
    contact_person_name: "Aditi Mehra",
    phone: "+91 90000 22222",
    address: "Plot 77, Okhla Industrial Estate Phase 2, New Delhi, Delhi",
    pincode: "110020"
  },
  {
    id: "wh_mum_3",
    name: "Mumbai Dispatch Center",
    contact_person_name: "Vikram Patil",
    phone: "+91 90000 33333",
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

export const deleteWarehouse = (id: string): boolean => {
  const index = warehouseRecords.findIndex((warehouse) => warehouse.id === id);
  if (index === -1) {
    return false;
  }

  warehouseRecords.splice(index, 1);
  return true;
};
