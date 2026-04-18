import type { SharedShopifyOrder } from "../data/sharedOrders.js";

export type DispatchRateTag = "cheapest" | "fastest" | "recommended";

export type DispatchRateOption = {
  option_id: string;
  order_id: string;
  provider_name: SharedShopifyOrder["assigned_provider"];
  source_name: "delhivery_direct" | "shipmozo";
  service_name: string;
  service_type: "Air" | "Surface" | "Express" | "LTL" | "10 CFT";
  price: number;
  eta_days: number;
  tags: DispatchRateTag[];
};

type MockRateTemplate = {
  template_id: string;
  provider_name: DispatchRateOption["provider_name"];
  source_name: DispatchRateOption["source_name"];
  service_name: string;
  service_type: DispatchRateOption["service_type"];
};

const mockRateTemplates: MockRateTemplate[] = [
  { template_id: "delhivery_direct_express", provider_name: "Delhivery", source_name: "delhivery_direct", service_name: "Delhivery Direct", service_type: "Express" },
  { template_id: "shipmozo_delhivery_surface", provider_name: "Shipmozo", source_name: "shipmozo", service_name: "Delhivery", service_type: "Surface" },
  { template_id: "shipmozo_ltl", provider_name: "Shipmozo", source_name: "shipmozo", service_name: "LTL", service_type: "LTL" },
  { template_id: "shipmozo_10_cft", provider_name: "Shipmozo", source_name: "shipmozo", service_name: "10 CFT", service_type: "10 CFT" },
  { template_id: "shipmozo_amazon_air", provider_name: "Shipmozo", source_name: "shipmozo", service_name: "Amazon", service_type: "Air" }
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
  const weightPremium = Math.round(order.package_details.weight_kg * 32);
  const dimensionPremium = Math.round((order.package_details.dimensions_cm.length + order.package_details.dimensions_cm.width + order.package_details.dimensions_cm.height) * 0.72);

  const options = mockRateTemplates.map((template, index) => {
    const basePrice = 110 + ((hash + index * 37) % 360);
    const price = clamp(basePrice + weightPremium + dimensionPremium, 120, 980);

    const rawEta = 2 + ((hash + index * 5) % 5);
    const eta_days = template.service_type === "Express" ? Math.max(2, rawEta - 1) : rawEta;

    return {
      ...template,
      option_id: `${order.order_id}-${template.template_id}-${index}`,
      order_id: order.order_id,
      price,
      eta_days,
      tags: []
    };
  });

  const cheapestPrice = Math.min(...options.map((option) => option.price));
  const fastestEta = Math.min(...options.map((option) => option.eta_days));

  return options.map((option, index) => {
    const tags: DispatchRateTag[] = [];

    if (option.price === cheapestPrice) tags.push("cheapest");
    if (option.eta_days === fastestEta) tags.push("fastest");
    if (!tags.length && index === 0) tags.push("recommended");

    return {
      ...option,
      tags
    };
  });
};
