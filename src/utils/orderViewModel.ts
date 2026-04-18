import type { Order, Shipment } from "@prisma/client";
import type { SharedShopifyOrder } from "../data/sharedOrders.js";
import {
  deriveOrderOperationalStatus,
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
  type OperationalOrderStatus
} from "./orderStatuses.js";

export type OrdersPageRow = {
  id: string;
  source: "db" | "mock";
  orderDateTime: string;
  orderDateLabel: string;
  orderTimeLabel: string;
  orderNumber: string;
  referenceId: string;
  productsSummary: string;
  productCount: number;
  skuSummary: string;
  quantityTotal: number;
  weightKg: number;
  dimensionsLabel: string;
  paymentAmount: number;
  paymentType: "Prepaid" | "COD";
  shippingName: string;
  shippingAddress: string;
  cityStatePincode: string;
  operationalStatus: OperationalOrderStatus;
  operationalStatusLabel: string;
  operationalStatusBadgeClass: string;
  selectedCourierSummary: string;
  selectedCourierMeta: string;
  latestShipment?: Shipment | null;
};

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const formatOrderCurrency = formatCurrency;

const DEFAULT_DATE = new Date(0);

const toSafeDate = (value: string | Date | null | undefined) => {
  const date = value ? new Date(value) : DEFAULT_DATE;
  return Number.isNaN(date.getTime()) ? DEFAULT_DATE : date;
};

const formatDateTime = (value: string | Date | null | undefined) => {
  const date = toSafeDate(value);
  return {
    dateLabel: new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date),
    timeLabel: new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).format(date)
  };
};

const normalizePaymentType = (paymentMode: string | null | undefined): OrdersPageRow["paymentType"] => {
  const normalized = String(paymentMode ?? "").trim().toUpperCase();
  return normalized === "COD" ? "COD" : "Prepaid";
};

export const mapMockOrderToRow = (order: SharedShopifyOrder): OrdersPageRow => {
  const { dateLabel, timeLabel } = formatDateTime(order.created_at);
  const productNames = order.line_items?.map((item) => item.title).join(", ") || "—";
  const skuSummary = order.line_items?.map((item) => item.sku).filter(Boolean).join(", ") || "—";
  const quantityTotal = order.line_items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return {
    id: order.order_id,
    source: "mock",
    orderDateTime: toSafeDate(order.created_at).toISOString(),
    orderDateLabel: dateLabel,
    orderTimeLabel: timeLabel,
    orderNumber: order.order_number,
    referenceId: order.reference_id,
    productsSummary: productNames,
    productCount: order.line_items?.length ?? 0,
    skuSummary,
    quantityTotal,
    weightKg: order.package_details?.weight_kg ?? 0,
    dimensionsLabel: `${order.package_details?.dimensions_cm.length ?? 0} x ${order.package_details?.dimensions_cm.width ?? 0} x ${order.package_details?.dimensions_cm.height ?? 0}`,
    paymentAmount: order.total_price,
    paymentType: normalizePaymentType(order.payment_type),
    shippingName: order.shipping_address?.name ?? "—",
    shippingAddress: [order.shipping_address?.address1, order.shipping_address?.address2].filter(Boolean).join(", ") || "—",
    cityStatePincode: `${order.shipping_address?.city ?? "—"}, ${order.shipping_address?.province ?? "—"} - ${order.shipping_address?.zip ?? "—"}`,
    operationalStatus: order.workflow_status,
    operationalStatusLabel: getOrderStatusLabel(order.workflow_status),
    operationalStatusBadgeClass: getOrderStatusBadgeClass(order.workflow_status),
    selectedCourierSummary: order.selected_courier
      ? `${order.selected_courier.provider_name} · ${order.selected_courier.service_name}`
      : "Not assigned",
    selectedCourierMeta: order.selected_courier
      ? `${order.selected_courier.service_type} · ${order.selected_courier.source_name}`
      : "Select a courier from Dispatch",
    latestShipment: null
  };
};

export const mapDbOrderToRow = (order: Order & { shipments: Shipment[] }): OrdersPageRow => {
  const latestShipment = order.shipments?.[0] ?? null;
  const status = deriveOrderOperationalStatus(latestShipment);
  const createdAt = toSafeDate(order.createdAt);
  const { dateLabel, timeLabel } = formatDateTime(createdAt);

  return {
    id: order.id,
    source: "db",
    orderDateTime: createdAt.toISOString(),
    orderDateLabel: dateLabel,
    orderTimeLabel: timeLabel,
    orderNumber: order.orderNumber,
    referenceId: order.shopifyOrderId,
    productsSummary: "Shopify synced items",
    productCount: 0,
    skuSummary: "—",
    quantityTotal: 0,
    weightKg: order.totalWeightGrams / 1000,
    dimensionsLabel: `${order.lengthCm} x ${order.widthCm} x ${order.heightCm}`,
    paymentAmount: order.orderValue,
    paymentType: normalizePaymentType(order.paymentMode),
    shippingName: order.customerName,
    shippingAddress: [order.addressLine1, order.addressLine2].filter(Boolean).join(", ") || "—",
    cityStatePincode: `${order.city}, ${order.state} - ${order.pincode}`,
    operationalStatus: status,
    operationalStatusLabel: getOrderStatusLabel(status),
    operationalStatusBadgeClass: getOrderStatusBadgeClass(status),
    selectedCourierSummary: latestShipment ? `Shipment ${latestShipment.provider}` : "Not assigned",
    selectedCourierMeta: latestShipment?.awbNumber ? `AWB: ${latestShipment.awbNumber}` : "Select a courier",
    latestShipment
  };
};
