import type { SharedShopifyOrder } from "../data/sharedOrders.js";

export type DispatchRateTag = "cheapest" | "fastest" | "recommended";
export type DispatchProviderGroupType = "direct" | "aggregator";

export type DispatchRateOption = {
  option_id: string;
  order_id: string;
  provider_name: SharedShopifyOrder["assigned_provider"];
  source_name: "delhivery_direct" | "shipmozo";
  partner_name?: string;
  service_name: string;
  service_type: "Air" | "Surface" | "Express" | "LTL" | "10 CFT";
  price: number;
  eta_days: number;
  tags: DispatchRateTag[];
};

export type DispatchRateProviderGroup = {
  provider_group_id: "direct_delhivery" | "shipmozo";
  provider_group_name: string;
  provider_group_type: DispatchProviderGroupType;
  options: DispatchRateOption[];
};

type MockRateTemplate = {
  template_id: string;
  provider_group_id: DispatchRateProviderGroup["provider_group_id"];
  provider_group_name: string;
  provider_group_type: DispatchProviderGroupType;
  provider_name: DispatchRateOption["provider_name"];
  source_name: DispatchRateOption["source_name"];
  partner_name?: string;
  service_name: string;
  service_type: DispatchRateOption["service_type"];
};

const mockRateTemplates: MockRateTemplate[] = [
  {
    template_id: "delhivery_direct_express",
    provider_group_id: "direct_delhivery",
    provider_group_name: "Direct Delhivery",
    provider_group_type: "direct",
    provider_name: "Delhivery",
    source_name: "delhivery_direct",
    service_name: "Priority Express",
    service_type: "Express"
  },
  {
    template_id: "shipmozo_delhivery_surface",
    provider_group_id: "shipmozo",
    provider_group_name: "Shipmozo",
    provider_group_type: "aggregator",
    provider_name: "Shipmozo",
    source_name: "shipmozo",
    partner_name: "Delhivery",
    service_name: "Delhivery Surface",
    service_type: "Surface"
  },
  {
    template_id: "shipmozo_ltl",
    provider_group_id: "shipmozo",
    provider_group_name: "Shipmozo",
    provider_group_type: "aggregator",
    provider_name: "Shipmozo",
    source_name: "shipmozo",
    partner_name: "LTL Partner",
    service_name: "LTL Freight",
    service_type: "LTL"
  },
  {
    template_id: "shipmozo_10_cft",
    provider_group_id: "shipmozo",
    provider_group_name: "Shipmozo",
    provider_group_type: "aggregator",
    provider_name: "Shipmozo",
    source_name: "shipmozo",
    partner_name: "10 CFT Partner",
    service_name: "10 CFT Cargo",
    service_type: "10 CFT"
  },
  {
    template_id: "shipmozo_amazon_air",
    provider_group_id: "shipmozo",
    provider_group_name: "Shipmozo",
    provider_group_type: "aggregator",
    provider_name: "Shipmozo",
    source_name: "shipmozo",
    partner_name: "Amazon Shipping",
    service_name: "Amazon Air",
    service_type: "Air"
  }
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

const safeNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getOrderPackageMetrics = (order: SharedShopifyOrder) => {
  const packageRows = Array.isArray(order.package_details?.boxes) ? order.package_details.boxes : [];
  const totalWeightKg = packageRows.reduce((sum, row) => {
    const quantity = Math.max(1, Math.round(safeNumber(row?.no_of_boxes) || 1));
    return sum + quantity * Math.max(0, safeNumber(row?.per_box_weight_kg));
  }, 0);

  const maxDimensionSum = packageRows.reduce((max, row) => {
    const dimensionSum = safeNumber(row?.length_cm) + safeNumber(row?.width_cm) + safeNumber(row?.height_cm);
    return Math.max(max, dimensionSum);
  }, 0);

  return {
    totalWeightKg,
    maxDimensionSum,
    packageRows
  };
};

export const getDispatchRateProviderGroups = (order: SharedShopifyOrder): DispatchRateProviderGroup[] => {
  const templates = Array.isArray(mockRateTemplates) ? mockRateTemplates : [];
  if (!templates.length || !order?.order_id) {
    return [];
  }

  const hash = hashOrderId(order.order_id);
  const { totalWeightKg, maxDimensionSum } = getOrderPackageMetrics(order);
  const effectiveWeight = Math.max(totalWeightKg, safeNumber(order.package_details?.total_weight_kg));
  const weightPremium = Math.round(effectiveWeight * 32);
  const dimensionPremium = Math.round(maxDimensionSum * 0.72);

  const options = templates.map((template, index) => {
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

  if (!options.length) {
    return [];
  }

  const cheapestPrice = Math.min(...options.map((option) => option.price));
  const fastestEta = Math.min(...options.map((option) => option.eta_days));
  const taggedOptions = options.map((option, index) => {
    const tags: DispatchRateTag[] = [];

    if (option.price === cheapestPrice) tags.push("cheapest");
    if (option.eta_days === fastestEta) tags.push("fastest");
    if (!tags.length && index === 0) tags.push("recommended");

    return {
      ...option,
      tags
    };
  });

  const groupMap = new Map<DispatchRateProviderGroup["provider_group_id"], DispatchRateProviderGroup>();

  taggedOptions.forEach((option) => {
    const group = groupMap.get(option.provider_group_id);
    if (group) {
      group.options.push({
        option_id: option.option_id,
        order_id: option.order_id,
        provider_name: option.provider_name,
        source_name: option.source_name,
        partner_name: option.partner_name,
        service_name: option.service_name,
        service_type: option.service_type,
        price: option.price,
        eta_days: option.eta_days,
        tags: option.tags
      });
      return;
    }

    groupMap.set(option.provider_group_id, {
      provider_group_id: option.provider_group_id,
      provider_group_name: option.provider_group_name,
      provider_group_type: option.provider_group_type,
      options: [{
        option_id: option.option_id,
        order_id: option.order_id,
        provider_name: option.provider_name,
        source_name: option.source_name,
        partner_name: option.partner_name,
        service_name: option.service_name,
        service_type: option.service_type,
        price: option.price,
        eta_days: option.eta_days,
        tags: option.tags
      }]
    });
  });

  return Array.from(groupMap.values());
};

export const getDispatchRateOptions = (order: SharedShopifyOrder): DispatchRateOption[] =>
  getDispatchRateProviderGroups(order).flatMap((group) => group.options);
