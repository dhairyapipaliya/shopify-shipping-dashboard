import type { SharedShopifyOrder } from "../data/sharedOrders.js";

export type DispatchRateTag = "cheapest" | "fastest" | "recommended";

export type DispatchRateOption = {
  id: string;
  providerKey: string;
  providerName: SharedShopifyOrder["assigned_provider"];
  source: "shipmozo" | "delhivery_direct" | "aggregated";
  serviceType: "Air" | "Surface" | "Express";
  priceInr: number;
  etaDays: number;
  tags: DispatchRateTag[];
};

const mockRateTemplates: Omit<DispatchRateOption, "id" | "priceInr" | "etaDays" | "tags">[] = [
  { providerKey: "shipmozo_delhivery", providerName: "Delhivery", source: "shipmozo", serviceType: "Surface" },
  { providerKey: "shipmozo_xpressbees", providerName: "XpressBees", source: "shipmozo", serviceType: "Air" },
  { providerKey: "delhivery_direct", providerName: "Delhivery", source: "delhivery_direct", serviceType: "Express" },
  { providerKey: "ecom_express", providerName: "Ecom Express", source: "aggregated", serviceType: "Surface" },
  { providerKey: "blue_dart", providerName: "Blue Dart", source: "aggregated", serviceType: "Air" }
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hashOrderId = (orderId: string): number => {
  let hash = 0;
  for (let index = 0; index < orderId.length; index += 1) {
    hash = (hash << 5) - hash + orderId.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
};

export const getDispatchRateOptions = (order: SharedShopifyOrder): DispatchRateOption[] => {
  const hash = hashOrderId(order.order_id);
  const weightPremium = Math.round(order.package_details.weight_kg * 24);
  const dimensionPremium = Math.round((order.package_details.dimensions_cm.length + order.package_details.dimensions_cm.width + order.package_details.dimensions_cm.height) * 0.65);

  const options = mockRateTemplates.map((template, index) => {
    const basePrice = 95 + ((hash + index * 29) % 240);
    const priceInr = clamp(basePrice + weightPremium + dimensionPremium, 80, 500);

    const rawEta = 2 + ((hash + index * 7) % 6);
    const etaDays = template.serviceType === "Express" ? Math.max(2, rawEta - 2) : rawEta;

    return {
      ...template,
      id: `${order.order_id}-${template.providerKey}-${index}`,
      priceInr,
      etaDays,
      tags: []
    };
  });

  const cheapestPrice = Math.min(...options.map((option) => option.priceInr));
  const fastestEta = Math.min(...options.map((option) => option.etaDays));

  return options.map((option, index) => {
    const tags: DispatchRateTag[] = [];

    if (option.priceInr === cheapestPrice) tags.push("cheapest");
    if (option.etaDays === fastestEta) tags.push("fastest");
    if (!tags.length && index === 0) tags.push("recommended");

    return {
      ...option,
      tags
    };
  });
};
