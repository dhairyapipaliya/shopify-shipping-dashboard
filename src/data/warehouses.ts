export type WarehouseRecord = {
  id: string;
  name: string;
  contact_person_name: string;
  phone: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
};

export type WarehouseRecordInput = Omit<WarehouseRecord, "id">;

export const normalizeWarehouseRecord = (input: WarehouseRecordInput): WarehouseRecordInput => ({
  name: input.name.trim(),
  contact_person_name: input.contact_person_name.trim(),
  phone: input.phone.trim(),
  address: input.address.trim(),
  pincode: input.pincode.trim(),
  city: input.city.trim(),
  state: input.state.trim()
});

const warehouseRecords: WarehouseRecord[] = [
  {
    id: "wh_blr_1",
    name: "Bangalore Main Warehouse",
    contact_person_name: "Rohit Kumar",
    phone: "+91 90000 11111",
    address: "No. 18, Electronic City Phase 1, Bengaluru, Karnataka",
    pincode: "560100",
    city: "Bengaluru",
    state: "Karnataka"
  },
  {
    id: "wh_del_2",
    name: "Delhi NCR Hub",
    contact_person_name: "Aditi Mehra",
    phone: "+91 90000 22222",
    address: "Plot 77, Okhla Industrial Estate Phase 2, New Delhi, Delhi",
    pincode: "110020",
    city: "New Delhi",
    state: "Delhi"
  },
  {
    id: "wh_mum_3",
    name: "Mumbai Dispatch Center",
    contact_person_name: "Vikram Patil",
    phone: "+91 90000 33333",
    address: "Unit 5, Andheri Kurla Road, Mumbai, Maharashtra",
    pincode: "400059",
    city: "Mumbai",
    state: "Maharashtra"
  }
];

export const listWarehouses = (): WarehouseRecord[] => warehouseRecords.map((warehouse) => ({ ...warehouse }));

export const getWarehouseById = (id: string): WarehouseRecord | undefined => warehouseRecords.find((warehouse) => warehouse.id === id);

export const createWarehouse = (input: WarehouseRecordInput): WarehouseRecord => {
  const warehouse: WarehouseRecord = {
    id: `wh_${crypto.randomUUID().slice(0, 8)}`,
    ...normalizeWarehouseRecord(input)
  };
  warehouseRecords.unshift(warehouse);
  return { ...warehouse };
};

export const updateWarehouse = (id: string, input: WarehouseRecordInput): WarehouseRecord | null => {
  const index = warehouseRecords.findIndex((warehouse) => warehouse.id === id);
  if (index === -1) {
    return null;
  }

  warehouseRecords[index] = {
    id,
    ...normalizeWarehouseRecord(input)
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
