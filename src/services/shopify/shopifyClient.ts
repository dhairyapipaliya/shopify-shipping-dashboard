import type { PaymentMode } from "@prisma/client";
import { assertLiveCredential, env } from "../../config/env.js";
import { withRetry } from "../../utils/retry.js";

export type ShopifyOrderPayload = {
  shopifyOrderId: string;
  orderNumber: string;
  customerName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  totalWeightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  paymentMode: PaymentMode;
  orderValue: number;
  createdAt: Date;
};

const mockOrders = (): ShopifyOrderPayload[] => [
  {
    shopifyOrderId: "1001",
    orderNumber: "#1001",
    customerName: "Aarav Gupta",
    phone: "+91-9999999999",
    addressLine1: "22 MG Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    country: "IN",
    totalWeightGrams: 1200,
    lengthCm: 25,
    widthCm: 18,
    heightCm: 10,
    paymentMode: "PREPAID",
    orderValue: 1299,
    createdAt: new Date()
  },
  {
    shopifyOrderId: "1002",
    orderNumber: "#1002",
    customerName: "Sneha Rao",
    phone: "+91-9888888888",
    addressLine1: "14 Residency Road",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
    country: "IN",
    totalWeightGrams: 2400,
    lengthCm: 35,
    widthCm: 28,
    heightCm: 18,
    paymentMode: "COD",
    orderValue: 2299,
    createdAt: new Date()
  }
];

export const fetchShopifyOrders = async (): Promise<ShopifyOrderPayload[]> => {
  if (env.SHOPIFY_USE_MOCK_DATA) {
    return mockOrders();
  }

  assertLiveCredential("Shopify", env.SHOPIFY_USE_MOCK_DATA, {
    SHOPIFY_SHOP_DOMAIN: env.SHOPIFY_SHOP_DOMAIN,
    SHOPIFY_ACCESS_TOKEN: env.SHOPIFY_ACCESS_TOKEN,
    SHOPIFY_API_VERSION: env.SHOPIFY_API_VERSION
  });

  return withRetry(async () => {
    // Placeholder: wire to Shopify Admin GraphQL API in sandbox live mode.
    throw new Error("Shopify sandbox API integration pending for order sync.");
  }, { context: { provider: "shopify", operation: "order_sync" } });
};
