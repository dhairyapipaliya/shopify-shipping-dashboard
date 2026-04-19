import { PACKAGE_MODE, type PackageMode } from "./packageMode.js";

export const MANUAL_ORDER_PROVIDERS = {
  DELHIVERY_DIRECT: "delhivery_direct",
  SHIPMOZO: "shipmozo",
  FUTURE_AGGREGATOR: "future_aggregator"
} as const;

export type ManualOrderProvider = (typeof MANUAL_ORDER_PROVIDERS)[keyof typeof MANUAL_ORDER_PROVIDERS];
export type ShipmentType = "B2C" | "B2B";
export type PaymentMode = "PREPAID" | "COD";

export type ManualOrderAddress = {
  contact_name: string;
  phone: string;
  email: string;
  gstin: string;
  address_line_1: string;
  address_line_2: string;
  pincode: string;
  city: string;
  state: string;
};

export type ManualOrderLineItem = {
  id: string;
  product_name: string;
  sku: string;
  hsn: string;
  category: string;
  quantity: number;
  unit_price: number;
  tax_percent: number;
};

export type ManualPackageRow = {
  id: string;
  no_of_boxes: number;
  per_box_weight_kg: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
};

export type UploadedDoc = {
  id: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
};

export type ManualOrderDraft = {
  order_source: "manual";
  provider_target: ManualOrderProvider;
  shipment_type: ShipmentType;
  shipping_zone: "domestic";
  order_id: string;
  reference_id: string;
  order_date: string;
  buyer_details: ManualOrderAddress;
  consignee_details: ManualOrderAddress;
  billing_details: ManualOrderAddress;
  billing_same_as_consignee: boolean;
  warehouse_or_pickup_address: {
    selected_pickup_id: string;
    saved_pickup_ids: string[];
  };
  line_items: ManualOrderLineItem[];
  package_mode: PackageMode;
  package_rows: ManualPackageRow[];
  total_weight: number;
  payment_mode: PaymentMode;
  invoice_number: string;
  invoice_amount: number;
  invoice_document: UploadedDoc | null;
  eway_bill_number: string;
  eway_bill_document: UploadedDoc | null;
  gstin: string;
  transporter_id: string;
  secondary_document: UploadedDoc | null;
  shipping_mode: string;
  save_mode: "save" | "create" | "create_and_assign" | null;
  selected_courier: string;
  selected_service: string;
  validation_state: {
    is_valid: boolean;
    errors: Record<string, string>;
  };
};

export type ProviderFieldRules = {
  visible: string[];
  required: string[];
};

export type ProviderCapabilities = {
  provider: ManualOrderProvider;
  label: string;
  description: string;
  supports_shipping_mode: boolean;
  supports_assign_later: boolean;
  supports_documents: boolean;
  field_rules: Record<ShipmentType, ProviderFieldRules>;
};

export const MANUAL_ORDER_RULES = {
  defaultShippingZone: "domestic" as const,
  ewayBillAutoThreshold: 50000
};

const baseVisibleFields = [
  "invoice_number",
  "invoice_amount",
  "invoice_document",
  "eway_bill_number",
  "eway_bill_document",
  "secondary_document",
  "gstin",
  "transporter_id",
  "shipping_mode"
];

export const providerCapabilities: Record<ManualOrderProvider, ProviderCapabilities> = {
  [MANUAL_ORDER_PROVIDERS.DELHIVERY_DIRECT]: {
    provider: MANUAL_ORDER_PROVIDERS.DELHIVERY_DIRECT,
    label: "Delhivery Direct",
    description: "Direct API integration profile with B2B/B2C capability differences.",
    supports_shipping_mode: true,
    supports_assign_later: true,
    supports_documents: true,
    field_rules: {
      B2B: {
        visible: baseVisibleFields,
        required: ["invoice_number", "invoice_amount", "invoice_document", "gstin", "shipping_mode"]
      },
      B2C: {
        visible: ["invoice_number", "invoice_amount", "shipping_mode"],
        required: ["shipping_mode"]
      }
    }
  },
  [MANUAL_ORDER_PROVIDERS.SHIPMOZO]: {
    provider: MANUAL_ORDER_PROVIDERS.SHIPMOZO,
    label: "Shipmozo",
    description: "Aggregator-ready profile with configurable document and assign-courier flow.",
    supports_shipping_mode: true,
    supports_assign_later: true,
    supports_documents: true,
    field_rules: {
      B2B: {
        visible: ["invoice_number", "invoice_amount", "invoice_document", "gstin", "secondary_document", "shipping_mode"],
        required: ["invoice_number", "invoice_amount"]
      },
      B2C: {
        visible: ["invoice_number", "shipping_mode"],
        required: []
      }
    }
  },
  [MANUAL_ORDER_PROVIDERS.FUTURE_AGGREGATOR]: {
    provider: MANUAL_ORDER_PROVIDERS.FUTURE_AGGREGATOR,
    label: "Future Aggregator",
    description: "Placeholder provider profile for upcoming courier integrations.",
    supports_shipping_mode: true,
    supports_assign_later: true,
    supports_documents: true,
    field_rules: {
      B2B: {
        visible: ["invoice_number", "invoice_amount", "invoice_document", "eway_bill_number", "secondary_document", "shipping_mode"],
        required: ["invoice_number"]
      },
      B2C: {
        visible: ["shipping_mode"],
        required: []
      }
    }
  }
};

const defaultAddress = (): ManualOrderAddress => ({
  contact_name: "",
  phone: "",
  email: "",
  gstin: "",
  address_line_1: "",
  address_line_2: "",
  pincode: "",
  city: "",
  state: ""
});

export const createDefaultManualOrder = (): ManualOrderDraft => ({
  order_source: "manual",
  provider_target: MANUAL_ORDER_PROVIDERS.DELHIVERY_DIRECT,
  shipment_type: "B2C",
  shipping_zone: "domestic",
  order_id: `MO-${new Date().getTime()}`,
  reference_id: "",
  order_date: new Date().toISOString().slice(0, 10),
  buyer_details: defaultAddress(),
  consignee_details: defaultAddress(),
  billing_details: defaultAddress(),
  billing_same_as_consignee: true,
  warehouse_or_pickup_address: {
    selected_pickup_id: "wh_blr_1",
    saved_pickup_ids: ["wh_blr_1", "wh_del_2", "wh_mum_3"]
  },
  line_items: [{
    id: crypto.randomUUID(),
    product_name: "",
    sku: "",
    hsn: "",
    category: "",
    quantity: 1,
    unit_price: 0,
    tax_percent: 0
  }],
  package_mode: PACKAGE_MODE.SINGLE_PACKAGE_B2C,
  package_rows: [{
    id: crypto.randomUUID(),
    no_of_boxes: 1,
    per_box_weight_kg: 0.5,
    length_cm: 20,
    width_cm: 14,
    height_cm: 7
  }],
  total_weight: 0.5,
  payment_mode: "PREPAID",
  invoice_number: "",
  invoice_amount: 0,
  invoice_document: null,
  eway_bill_number: "",
  eway_bill_document: null,
  gstin: "",
  transporter_id: "",
  secondary_document: null,
  shipping_mode: "Surface",
  save_mode: null,
  selected_courier: "",
  selected_service: "",
  validation_state: {
    is_valid: true,
    errors: {}
  }
});

export const calculateManualOrderGrandTotal = (lineItems: ManualOrderLineItem[]): number => Number(
  lineItems
    .reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unit_price || 0)), 0)
    .toFixed(2)
);

export const shouldShowEwayBill = (grandTotal: number, visibleFields: string[]): boolean => (
  grandTotal > MANUAL_ORDER_RULES.ewayBillAutoThreshold || visibleFields.includes("eway_bill_number")
);

export const getProviderFieldRules = (provider: ManualOrderProvider, shipmentType: ShipmentType): ProviderFieldRules => {
  const capability = providerCapabilities[provider] ?? providerCapabilities[MANUAL_ORDER_PROVIDERS.FUTURE_AGGREGATOR];
  return capability.field_rules[shipmentType];
};

export const validateManualOrderForProvider = (manualOrder: ManualOrderDraft): Record<string, string> => {
  const errors: Record<string, string> = {};
  const rules = getProviderFieldRules(manualOrder.provider_target, manualOrder.shipment_type);

  if (!manualOrder.buyer_details.contact_name.trim()) {
    errors.buyer_name = "Buyer/receiver name is required";
  }

  if (!manualOrder.buyer_details.phone.trim()) {
    errors.buyer_phone = "Phone number is required";
  }

  if (!manualOrder.buyer_details.pincode.trim()) {
    errors.buyer_pincode = "Pincode is required";
  }

  if (!manualOrder.order_id.trim()) {
    errors.order_id = "Order ID is required";
  }

  if (manualOrder.line_items.length === 0 || !manualOrder.line_items[0]?.product_name.trim()) {
    errors.line_items = "At least one line item is required";
  }

  if (manualOrder.package_rows.length === 0) {
    errors.package_rows = "At least one package row is required";
  }

  if (manualOrder.package_rows.some((row) => row.per_box_weight_kg <= 0 || row.length_cm <= 0 || row.width_cm <= 0 || row.height_cm <= 0)) {
    errors.package_rows = "Package dimensions and weight must be greater than zero";
  }

  if (rules.required.includes("invoice_number") && !manualOrder.invoice_number.trim()) {
    errors.invoice_number = "Invoice number is required";
  }

  if (rules.required.includes("invoice_amount") && manualOrder.invoice_amount <= 0) {
    errors.invoice_amount = "Invoice amount must be greater than zero";
  }

  if (rules.required.includes("invoice_document") && !manualOrder.invoice_document) {
    errors.invoice_document = "Invoice document is required";
  }

  if (rules.required.includes("shipping_mode") && !manualOrder.shipping_mode.trim()) {
    errors.shipping_mode = "Shipping mode is required";
  }

  return errors;
};

export const shouldShowEwayBillField = (manualOrder: Pick<ManualOrderDraft, "invoice_amount">, visibleFields: string[]): boolean => (
  manualOrder.invoice_amount > MANUAL_ORDER_RULES.ewayBillAutoThreshold || visibleFields.includes("eway_bill_number")
);

export const mapManualOrderToProviderPayload = (manualOrder: ManualOrderDraft): Record<string, unknown> => ({
  provider: manualOrder.provider_target,
  shipmentType: manualOrder.shipment_type,
  orderId: manualOrder.order_id,
  referenceId: manualOrder.reference_id,
  buyer: manualOrder.buyer_details,
  consignee: manualOrder.consignee_details,
  billing: manualOrder.billing_details,
  packageRows: manualOrder.package_rows,
  documents: {
    invoiceNumber: manualOrder.invoice_number,
    invoiceAmount: manualOrder.invoice_amount,
    ewayBillNumber: manualOrder.eway_bill_number
  }
});

export const submitManualOrderToProvider = async (manualOrder: ManualOrderDraft): Promise<{ status: string; provider_payload: Record<string, unknown> }> => ({
  status: "mock_submitted",
  provider_payload: mapManualOrderToProviderPayload(manualOrder)
});

export const submitAndAssignCourier = async (manualOrder: ManualOrderDraft): Promise<{ status: string; assignment_preview: string }> => ({
  status: "mock_assigned",
  assignment_preview: `${manualOrder.provider_target}::${manualOrder.selected_courier || "auto"}`
});
