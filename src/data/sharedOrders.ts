import type { OperationalOrderStatus } from "../utils/orderStatuses.js";
import type { DispatchRateOption } from "../services/dispatchRates.js";
import { derivePackageMode, normalizePackageBoxes, PACKAGE_MODE, sumBoxWeights, type PackageBox, type PackageMode } from "../utils/packageMode.js";

export type ShopifyReadyLineItem = {
  title: string;
  sku?: string;
  quantity: number;
};

export type ShopifyReadyAddress = {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
};

export type ShopifyReadyPackageDetails = {
  package_mode: PackageMode;
  total_weight_kg: number;
  boxes: PackageBox[];
};

export type SharedShopifyOrder = {
  order_id: string;
  order_number: string;
  reference_id: string;
  created_at: string;
  line_items: ShopifyReadyLineItem[];
  total_price: number;
  payment_type: "Prepaid" | "COD";
  assigned_provider: "Unassigned" | "Shipmozo" | "Delhivery" | "Blue Dart" | "XpressBees" | "Ecom Express";
  shipping_address: ShopifyReadyAddress;
  pickup_address: ShopifyReadyAddress;
  workflow_status: OperationalOrderStatus;
  selected_courier?: {
    option_id: string;
    provider_name: string;
    source_name: string;
    service_name: string;
    service_type: string;
    price: number;
    eta_days: number;
    selected_at: string;
    label_reference?: string;
    label_url?: string;
    manifest_reference?: string;
    manifest_url?: string;
  };
  package_details: ShopifyReadyPackageDetails;
  tracking_status?: string;
  awb_number?: string;
  is_archived?: boolean;
};

export type NewSharedOrderInput = Omit<SharedShopifyOrder, "workflow_status" | "pickup_address" | "package_details"> & {
  workflow_status?: OperationalOrderStatus;
  pickup_address?: ShopifyReadyAddress;
  package_details?: Partial<ShopifyReadyPackageDetails> & {
    boxes?: PackageBox[];
  };
};

const defaultPickupAddress: ShopifyReadyAddress = {
  name: "NexFulfilment Hub",
  address1: "Warehouse 9, Logistics Park",
  address2: "Phase II",
  city: "Gurugram",
  province: "Haryana",
  zip: "122004",
  country: "India"
};

const createDefaultBox = (weightKg: number, dimensions: { length: number; width: number; height: number }): PackageBox => ({
  id: crypto.randomUUID(),
  length_cm: dimensions.length,
  width_cm: dimensions.width,
  height_cm: dimensions.height,
  weight_kg: weightKg
});

const resolvePackageDetails = (packageDetails?: NewSharedOrderInput["package_details"]): ShopifyReadyPackageDetails => {
  const defaultBox = createDefaultBox(0.5, { length: 20, width: 14, height: 7 });
  const requestedBoxes = packageDetails?.boxes?.length ? packageDetails.boxes : [defaultBox];
  const safeTotalWeight = packageDetails?.total_weight_kg ?? sumBoxWeights(requestedBoxes);
  const derivedMode = derivePackageMode(requestedBoxes, safeTotalWeight);
  const requestedMode = packageDetails?.package_mode ?? derivedMode;
  const normalizedBoxes = normalizePackageBoxes(requestedBoxes, requestedMode);
  const normalizedTotalWeight = Math.max(packageDetails?.total_weight_kg ?? sumBoxWeights(normalizedBoxes), sumBoxWeights(normalizedBoxes));

  return {
    package_mode: derivePackageMode(normalizedBoxes, normalizedTotalWeight),
    total_weight_kg: normalizedTotalWeight,
    boxes: normalizedBoxes
  };
};

export const createSharedOrder = (order: NewSharedOrderInput): SharedShopifyOrder => ({
  ...order,
  assigned_provider: order.assigned_provider ?? "Unassigned",
  workflow_status: order.workflow_status ?? "new",
  pickup_address: order.pickup_address ?? defaultPickupAddress,
  package_details: resolvePackageDetails(order.package_details)
});

const createPackageDetails = (weightKg: number, dimensions: { length: number; width: number; height: number }, packageMode: PackageMode = PACKAGE_MODE.SINGLE_PACKAGE_B2C): ShopifyReadyPackageDetails => {
  const boxes = [createDefaultBox(weightKg, dimensions)];
  const resolved = resolvePackageDetails({ package_mode: packageMode, boxes, total_weight_kg: weightKg });
  return resolved;
};

export const sharedDummyOrders: SharedShopifyOrder[] = [
  {
    order_id: "gid://shopify/Order/6100001001",
    order_number: "NFM1001",
    reference_id: "REF-NFM-001",
    created_at: "2026-04-18T10:15:00+05:30",
    line_items: [{ title: "Boat Airdopes 141", sku: "AUDIO-BOAT-141", quantity: 1 }],
    total_price: 1499,
    payment_type: "Prepaid",
    assigned_provider: "Unassigned",
    shipping_address: {
      name: "Aarav Mehta",
      address1: "Flat 804, Magnolia Residency",
      address2: "Sector 62",
      city: "Noida",
      province: "Uttar Pradesh",
      zip: "201309",
      country: "India"
    },
    pickup_address: defaultPickupAddress,
    workflow_status: "new",
    package_details: createPackageDetails(0.45, { length: 21, width: 15, height: 6 })
  },
  {
    order_id: "gid://shopify/Order/6100001002",
    order_number: "NFM1002",
    reference_id: "REF-NFM-002",
    created_at: "2026-04-18T09:40:00+05:30",
    line_items: [{ title: "Mamaearth Skincare Combo", sku: "BEAUTY-MAMA-SET", quantity: 1 }],
    total_price: 899,
    payment_type: "COD",
    assigned_provider: "Unassigned",
    shipping_address: {
      name: "Riya Sharma",
      address1: "B-1203, Shree Heights",
      address2: "Powai",
      city: "Mumbai",
      province: "Maharashtra",
      zip: "400076",
      country: "India"
    },
    pickup_address: defaultPickupAddress,
    workflow_status: "new",
    package_details: createPackageDetails(0.7, { length: 24, width: 18, height: 10 })
  },
  {
    order_id: "gid://shopify/Order/6100001003",
    order_number: "NFM1003",
    reference_id: "REF-NFM-003",
    created_at: "2026-04-17T18:05:00+05:30",
    line_items: [{ title: "Milton Sports Bottle Pack", sku: "HOME-MILTON-3PK", quantity: 2 }],
    total_price: 1298,
    payment_type: "Prepaid",
    assigned_provider: "Shipmozo",
    shipping_address: {
      name: "Kabir Khan",
      address1: "House 17, Green Avenue",
      address2: "Banjara Hills",
      city: "Hyderabad",
      province: "Telangana",
      zip: "500034",
      country: "India"
    },
    pickup_address: defaultPickupAddress,
    workflow_status: "archive",
    is_archived: true,
    tracking_status: "Archived",
    awb_number: "SHPMZ700031884",
    package_details: createPackageDetails(1.2, { length: 30, width: 22, height: 14 })
  },
  {
    order_id: "gid://shopify/Order/6100001004",
    order_number: "NFM1004",
    reference_id: "REF-NFM-004",
    created_at: "2026-04-17T16:30:00+05:30",
    line_items: [{ title: "Noise Buds VS104", sku: "AUDIO-NOISE-104", quantity: 1 }],
    total_price: 1699,
    payment_type: "COD",
    assigned_provider: "Unassigned",
    shipping_address: {
      name: "Neha Verma",
      address1: "Plot 22, Shivaji Nagar",
      city: "Pune",
      province: "Maharashtra",
      zip: "411005",
      country: "India"
    },
    pickup_address: defaultPickupAddress,
    workflow_status: "new",
    package_details: createPackageDetails(0.5, { length: 20, width: 14, height: 7 })
  },
  {
    order_id: "gid://shopify/Order/6100001005",
    order_number: "NFM1005",
    reference_id: "REF-NFM-005",
    created_at: "2026-04-17T12:20:00+05:30",
    line_items: [{ title: "HRX Cotton T-Shirt Set", sku: "APPAREL-HRX-TS2", quantity: 2 }],
    total_price: 1899,
    payment_type: "Prepaid",
    assigned_provider: "Shipmozo",
    shipping_address: {
      name: "Ishaan Das",
      address1: "16 Lake View Road",
      address2: "Salt Lake",
      city: "Kolkata",
      province: "West Bengal",
      zip: "700091",
      country: "India"
    },
    pickup_address: defaultPickupAddress,
    workflow_status: "delivered",
    tracking_status: "Delivered",
    awb_number: "SHIP510050312",
    package_details: createPackageDetails(0.9, { length: 32, width: 26, height: 8 })
  },
  {
    order_id: "gid://shopify/Order/6100001006",
    order_number: "NFM1006",
    reference_id: "REF-NFM-006",
    created_at: "2026-04-16T15:00:00+05:30",
    line_items: [{ title: "Home Puff Kitchen Organizer", sku: "HOME-ORG-SET", quantity: 1 }],
    total_price: 1099,
    payment_type: "COD",
    assigned_provider: "Delhivery",
    shipping_address: {
      name: "Diya Iyer",
      address1: "21, East Main Road",
      address2: "Anna Nagar",
      city: "Chennai",
      province: "Tamil Nadu",
      zip: "600040",
      country: "India"
    },
    pickup_address: defaultPickupAddress,
    workflow_status: "ndr",
    tracking_status: "Delivery attempt failed",
    awb_number: "DLV600401129",
    package_details: createPackageDetails(1.6, { length: 36, width: 25, height: 18 })
  },
  {
    order_id: "gid://shopify/Order/6100001007",
    order_number: "NFM1007",
    reference_id: "REF-NFM-007",
    created_at: "2026-04-16T11:50:00+05:30",
    line_items: [{ title: "Boldfit Resistance Bands", sku: "FIT-BANDS-SET", quantity: 1 }],
    total_price: 799,
    payment_type: "Prepaid",
    assigned_provider: "Shipmozo",
    shipping_address: {
      name: "Arjun Patel",
      address1: "405, Riverfront Enclave",
      address2: "Navrangpura",
      city: "Ahmedabad",
      province: "Gujarat",
      zip: "380009",
      country: "India"
    },
    pickup_address: defaultPickupAddress,
    workflow_status: "rtoInTransit",
    tracking_status: "RTO in transit",
    awb_number: "SHPMZ380009777",
    package_details: createPackageDetails(0.8, { length: 28, width: 20, height: 9 })
  },
  {
    order_id: "gid://shopify/Order/6100001008",
    order_number: "NFM1008",
    reference_id: "REF-NFM-008",
    created_at: "2026-04-15T19:10:00+05:30",
    line_items: [{ title: "Spigen Case Duo Pack", sku: "MOB-SPIGEN-2PK", quantity: 1 }],
    total_price: 1199,
    payment_type: "COD",
    assigned_provider: "Delhivery",
    shipping_address: {
      name: "Myra Sen",
      address1: "Tower 2, Palm Residency",
      address2: "Dwarka Sector 10",
      city: "New Delhi",
      province: "Delhi",
      zip: "110075",
      country: "India"
    },
    pickup_address: defaultPickupAddress,
    workflow_status: "rtoDelivered",
    tracking_status: "RTO delivered",
    awb_number: "DLV110075444",
    package_details: createPackageDetails(0.35, { length: 18, width: 11, height: 4 })
  },
  {
    order_id: "gid://shopify/Order/6100001009",
    order_number: "NFM1009",
    reference_id: "REF-NFM-009",
    created_at: "2026-04-15T14:35:00+05:30",
    line_items: [{ title: "Safari Travel Pouch", sku: "TRAVEL-SAFARI-POUCH", quantity: 3 }],
    total_price: 1497,
    payment_type: "Prepaid",
    assigned_provider: "Unassigned",
    shipping_address: {
      name: "Yash Gupta",
      address1: "79, Civil Lines",
      city: "Jaipur",
      province: "Rajasthan",
      zip: "302006",
      country: "India"
    },
    pickup_address: defaultPickupAddress,
    workflow_status: "new",
    package_details: createPackageDetails(0.95, { length: 34, width: 24, height: 13 })
  },
  {
    order_id: "gid://shopify/Order/6100001010",
    order_number: "NFM1010",
    reference_id: "REF-NFM-010",
    created_at: "2026-04-14T17:25:00+05:30",
    line_items: [{ title: "Borossil Coffee Mug Gift Box", sku: "HOME-MUG-GIFT", quantity: 1 }],
    total_price: 999,
    payment_type: "COD",
    assigned_provider: "Delhivery",
    shipping_address: {
      name: "Anaya Roy",
      address1: "Flat 7C, Skyline Apartments",
      address2: "Lalbagh",
      city: "Bengaluru",
      province: "Karnataka",
      zip: "560027",
      country: "India"
    },
    pickup_address: defaultPickupAddress,
    workflow_status: "pickupsAndManifests",
    tracking_status: "Pickup scheduled",
    awb_number: "DLV5600271010",
    selected_courier: {
      option_id: "gid://shopify/Order/6100001010-shipmozo_delhivery_surface-1",
      provider_name: "Shipmozo",
      source_name: "shipmozo",
      service_name: "Delhivery",
      service_type: "Surface",
      price: 228,
      eta_days: 4,
      selected_at: "2026-04-14T18:00:00+05:30",
      label_reference: "LBL-NFM1010-SHPMZ-DELH-001",
      manifest_reference: "MNF-NFM1010-0414"
    },
    package_details: createPackageDetails(1.1, { length: 27, width: 21, height: 15 })
  }
];

export const getSharedOrderById = (orderId: string): SharedShopifyOrder | undefined =>
  sharedDummyOrders.find((order) => order.order_id === orderId);

export const addSharedOrder = (order: NewSharedOrderInput): SharedShopifyOrder => {
  const normalizedOrder = createSharedOrder(order);
  sharedDummyOrders.unshift(normalizedOrder);
  return normalizedOrder;
};

export const updateSharedOrderCourierAssignment = (orderId: string, selectedRate: DispatchRateOption): SharedShopifyOrder | undefined => {
  const order = getSharedOrderById(orderId);
  if (!order) return undefined;

  order.assigned_provider = selectedRate.provider_name;
  order.workflow_status = "pickupsAndManifests";
  order.tracking_status = "Courier assigned";
  order.awb_number = `AWB-${order.order_number}-${Math.floor(100000 + Math.random() * 900000)}`;
  order.selected_courier = {
    option_id: selectedRate.option_id,
    provider_name: selectedRate.provider_name,
    source_name: selectedRate.source_name,
    service_name: selectedRate.service_name,
    service_type: selectedRate.service_type,
    price: selectedRate.price,
    eta_days: selectedRate.eta_days,
    selected_at: new Date().toISOString(),
    label_reference: `LBL-${order.order_number}-${selectedRate.source_name}-${selectedRate.service_name}`.toUpperCase().replace(/\s+/g, "-"),
    manifest_reference: `MNF-${order.order_number}-${new Date().toISOString().slice(0, 10)}`
  };

  return order;
};

export const updateSharedOrderPackageDetails = (
  orderId: string,
  update: { package_mode: PackageMode; boxes: PackageBox[]; total_weight_kg: number }
): SharedShopifyOrder | undefined => {
  const order = getSharedOrderById(orderId);
  if (!order) return undefined;

  const boxesWithIds = update.boxes.map((box) => ({ ...box, id: box.id || crypto.randomUUID() }));
  const normalizedBoxes = normalizePackageBoxes(boxesWithIds, update.package_mode);
  const normalizedTotalWeight = Math.max(update.total_weight_kg, sumBoxWeights(normalizedBoxes));

  order.package_details = {
    package_mode: derivePackageMode(normalizedBoxes, normalizedTotalWeight),
    boxes: normalizedBoxes,
    total_weight_kg: normalizedTotalWeight
  };

  return order;
};

export const archiveSharedOrder = (orderId: string): SharedShopifyOrder | undefined => {
  const order = getSharedOrderById(orderId);
  if (!order) return undefined;
  order.workflow_status = "archive";
  order.is_archived = true;
  order.tracking_status = order.tracking_status ?? "Archived";
  return order;
};

export const cloneSharedOrder = (orderId: string): SharedShopifyOrder | undefined => {
  const order = getSharedOrderById(orderId);
  if (!order) return undefined;

  const clonedOrder = createSharedOrder({
    ...order,
    order_id: `gid://shopify/Order/${Date.now()}`,
    order_number: `${order.order_number}-CLONE`,
    reference_id: `${order.reference_id}-CLONE`,
    created_at: new Date().toISOString(),
    workflow_status: "new",
    selected_courier: undefined,
    tracking_status: undefined,
    awb_number: undefined,
    is_archived: false,
    assigned_provider: "Unassigned",
    package_details: {
      ...order.package_details,
      boxes: order.package_details.boxes.map((box) => ({ ...box, id: crypto.randomUUID() }))
    }
  });

  sharedDummyOrders.unshift(clonedOrder);
  return clonedOrder;
};

export const deleteSharedOrder = (orderId: string): boolean => {
  const index = sharedDummyOrders.findIndex((order) => order.order_id === orderId);
  if (index === -1) return false;
  sharedDummyOrders.splice(index, 1);
  return true;
};

export const updateSharedOrderPickupAddress = (orderId: string): SharedShopifyOrder | undefined => {
  const order = getSharedOrderById(orderId);
  if (!order) return undefined;
  order.pickup_address = {
    ...order.pickup_address,
    address1: `${order.pickup_address.address1} · Updated`
  };
  return order;
};
