import { env } from "../../config/env.js";
import { withRetry } from "../../utils/retry.js";

export type FulfillmentSyncInput = {
  shopifyOrderId: string;
  trackingNumber: string;
  trackingUrl?: string;
};

export type FulfillmentSyncResult = {
  fulfillmentId: string;
  status: "SYNCED" | "FAILED";
  error?: string;
};

export const syncFulfillmentToShopify = async (input: FulfillmentSyncInput): Promise<FulfillmentSyncResult> => {
  if (env.SHOPIFY_USE_MOCK_DATA) {
    return { fulfillmentId: `mock-fulfillment-${input.shopifyOrderId}`, status: "SYNCED" };
  }

  return withRetry(async () => {
    throw new Error("Shopify sandbox API integration pending for fulfillment + tracking sync.");
  }, { context: { provider: "shopify", operation: "fulfillment_sync", shopifyOrderId: input.shopifyOrderId } });
};
