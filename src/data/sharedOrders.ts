import type { OperationalOrderStatus } from "../utils/orderStatuses.js";

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
  weight_kg: number;
  dimensions_cm: {
    length: number;
    width: number;
    height: number;
  };
};

export type SharedShopifyOrder = {
  order_id: string;
  order_number: string;
  reference_id: string;
  created_at: string;
  line_items: ShopifyReadyLineItem[];
  total_price: number;
  payment_type: "Prepaid" | "COD";
  shipping_address: ShopifyReadyAddress;
  fulfillment_status: OperationalOrderStatus;
  package_details: ShopifyReadyPackageDetails;
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
    shipping_address: {
      name: "Aarav Mehta",
      address1: "Flat 804, Magnolia Residency",
      address2: "Sector 62",
      city: "Noida",
      province: "Uttar Pradesh",
      zip: "201309",
      country: "India"
    },
    fulfillment_status: "unbooked",
    package_details: {
      weight_kg: 0.45,
      dimensions_cm: { length: 21, width: 15, height: 6 }
    }
  },
  {
    order_id: "gid://shopify/Order/6100001002",
    order_number: "NFM1002",
    reference_id: "REF-NFM-002",
    created_at: "2026-04-18T09:40:00+05:30",
    line_items: [{ title: "Mamaearth Skincare Combo", sku: "BEAUTY-MAMA-SET", quantity: 1 }],
    total_price: 899,
    payment_type: "COD",
    shipping_address: {
      name: "Riya Sharma",
      address1: "B-1203, Shree Heights",
      address2: "Powai",
      city: "Mumbai",
      province: "Maharashtra",
      zip: "400076",
      country: "India"
    },
    fulfillment_status: "pickupScheduled",
    package_details: {
      weight_kg: 0.7,
      dimensions_cm: { length: 24, width: 18, height: 10 }
    }
  },
  {
    order_id: "gid://shopify/Order/6100001003",
    order_number: "NFM1003",
    reference_id: "REF-NFM-003",
    created_at: "2026-04-17T18:05:00+05:30",
    line_items: [{ title: "Milton Sports Bottle Pack", sku: "HOME-MILTON-3PK", quantity: 2 }],
    total_price: 1298,
    payment_type: "Prepaid",
    shipping_address: {
      name: "Kabir Khan",
      address1: "House 17, Green Avenue",
      address2: "Banjara Hills",
      city: "Hyderabad",
      province: "Telangana",
      zip: "500034",
      country: "India"
    },
    fulfillment_status: "inTransit",
    package_details: {
      weight_kg: 1.2,
      dimensions_cm: { length: 30, width: 22, height: 14 }
    }
  },
  {
    order_id: "gid://shopify/Order/6100001004",
    order_number: "NFM1004",
    reference_id: "REF-NFM-004",
    created_at: "2026-04-17T16:30:00+05:30",
    line_items: [{ title: "Noise Buds VS104", sku: "AUDIO-NOISE-104", quantity: 1 }],
    total_price: 1699,
    payment_type: "COD",
    shipping_address: {
      name: "Neha Verma",
      address1: "Plot 22, Shivaji Nagar",
      city: "Pune",
      province: "Maharashtra",
      zip: "411005",
      country: "India"
    },
    fulfillment_status: "outForDelivery",
    package_details: {
      weight_kg: 0.5,
      dimensions_cm: { length: 20, width: 14, height: 7 }
    }
  },
  {
    order_id: "gid://shopify/Order/6100001005",
    order_number: "NFM1005",
    reference_id: "REF-NFM-005",
    created_at: "2026-04-17T12:20:00+05:30",
    line_items: [{ title: "HRX Cotton T-Shirt Set", sku: "APPAREL-HRX-TS2", quantity: 2 }],
    total_price: 1899,
    payment_type: "Prepaid",
    shipping_address: {
      name: "Ishaan Das",
      address1: "16 Lake View Road",
      address2: "Salt Lake",
      city: "Kolkata",
      province: "West Bengal",
      zip: "700091",
      country: "India"
    },
    fulfillment_status: "delivered",
    package_details: {
      weight_kg: 0.9,
      dimensions_cm: { length: 32, width: 26, height: 8 }
    }
  },
  {
    order_id: "gid://shopify/Order/6100001006",
    order_number: "NFM1006",
    reference_id: "REF-NFM-006",
    created_at: "2026-04-16T15:00:00+05:30",
    line_items: [{ title: "Home Puff Kitchen Organizer", sku: "HOME-ORG-SET", quantity: 1 }],
    total_price: 1099,
    payment_type: "COD",
    shipping_address: {
      name: "Diya Iyer",
      address1: "21, East Main Road",
      address2: "Anna Nagar",
      city: "Chennai",
      province: "Tamil Nadu",
      zip: "600040",
      country: "India"
    },
    fulfillment_status: "ndr",
    package_details: {
      weight_kg: 1.6,
      dimensions_cm: { length: 36, width: 25, height: 18 }
    }
  },
  {
    order_id: "gid://shopify/Order/6100001007",
    order_number: "NFM1007",
    reference_id: "REF-NFM-007",
    created_at: "2026-04-16T11:50:00+05:30",
    line_items: [{ title: "Boldfit Resistance Bands", sku: "FIT-BANDS-SET", quantity: 1 }],
    total_price: 799,
    payment_type: "Prepaid",
    shipping_address: {
      name: "Arjun Patel",
      address1: "405, Riverfront Enclave",
      address2: "Navrangpura",
      city: "Ahmedabad",
      province: "Gujarat",
      zip: "380009",
      country: "India"
    },
    fulfillment_status: "rtoInTransit",
    package_details: {
      weight_kg: 0.8,
      dimensions_cm: { length: 28, width: 20, height: 9 }
    }
  },
  {
    order_id: "gid://shopify/Order/6100001008",
    order_number: "NFM1008",
    reference_id: "REF-NFM-008",
    created_at: "2026-04-15T19:10:00+05:30",
    line_items: [{ title: "Spigen Case Duo Pack", sku: "MOB-SPIGEN-2PK", quantity: 1 }],
    total_price: 1199,
    payment_type: "COD",
    shipping_address: {
      name: "Myra Sen",
      address1: "Tower 2, Palm Residency",
      address2: "Dwarka Sector 10",
      city: "New Delhi",
      province: "Delhi",
      zip: "110075",
      country: "India"
    },
    fulfillment_status: "rtoDelivered",
    package_details: {
      weight_kg: 0.35,
      dimensions_cm: { length: 18, width: 11, height: 4 }
    }
  },
  {
    order_id: "gid://shopify/Order/6100001009",
    order_number: "NFM1009",
    reference_id: "REF-NFM-009",
    created_at: "2026-04-15T14:35:00+05:30",
    line_items: [{ title: "Safari Travel Pouch", sku: "TRAVEL-SAFARI-POUCH", quantity: 3 }],
    total_price: 1497,
    payment_type: "Prepaid",
    shipping_address: {
      name: "Yash Gupta",
      address1: "79, Civil Lines",
      city: "Jaipur",
      province: "Rajasthan",
      zip: "302006",
      country: "India"
    },
    fulfillment_status: "undelivered",
    package_details: {
      weight_kg: 0.95,
      dimensions_cm: { length: 34, width: 24, height: 13 }
    }
  },
  {
    order_id: "gid://shopify/Order/6100001010",
    order_number: "NFM1010",
    reference_id: "REF-NFM-010",
    created_at: "2026-04-14T17:25:00+05:30",
    line_items: [{ title: "Borossil Coffee Mug Gift Box", sku: "HOME-MUG-GIFT", quantity: 1 }],
    total_price: 999,
    payment_type: "COD",
    shipping_address: {
      name: "Anaya Roy",
      address1: "Flat 7C, Skyline Apartments",
      address2: "Lalbagh",
      city: "Bengaluru",
      province: "Karnataka",
      zip: "560027",
      country: "India"
    },
    fulfillment_status: "pickupScheduled",
    package_details: {
      weight_kg: 1.1,
      dimensions_cm: { length: 27, width: 21, height: 15 }
    }
  }
];
