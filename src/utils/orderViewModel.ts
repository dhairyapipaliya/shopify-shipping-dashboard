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
  latestShipment?: Shipment | null;
};

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const formatOrderCurrency = formatCurrency;

const formatDateTime = (isoDate: string | Date) => {
  const date = new Date(isoDate);
  return {
    dateLabel: new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date),
    timeLabel: new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).format(date)
  };
};

export const mapMockOrderToRow = (order: SharedShopifyOrder): OrdersPageRow => {
  const { dateLabel, timeLabel } = formatDateTime(order.created_at);
  const productNames = order.line_items.map((item) => item.title).join(", ");
  const skuSummary = order.line_items.map((item) => item.sku).filter(Boolean).join(", ") || "—";
  const quantityTotal = order.line_items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: order.order_id,
    source: "mock",
    orderDateTime: order.created_at,
    orderDateLabel: dateLabel,
    orderTimeLabel: timeLabel,
    orderNumber: order.order_number,
    referenceId: order.reference_id,
    productsSummary: productNames,
    productCount: order.line_items.length,
    skuSummary,
    quantityTotal,
    weightKg: order.package_details.weight_kg,
    dimensionsLabel: `${order.package_details.dimensions_cm.length} x ${order.package_details.dimensions_cm.width} x ${order.package_details.dimensions_cm.height}`,
    paymentAmount: order.total_price,
    paymentType: order.payment_type,
    shippingName: order.shipping_address.name,
    shippingAddress: [order.shipping_address.address1, order.shipping_address.address2].filter(Boolean).join(", "),
    cityStatePincode: `${order.shipping_address.city}, ${order.shipping_address.province} - ${order.shipping_address.zip}`,
    operationalStatus: order.fulfillment_status,
    operationalStatusLabel: getOrderStatusLabel(order.fulfillment_status),
    operationalStatusBadgeClass: getOrderStatusBadgeClass(order.fulfillment_status),
    latestShipment: null
  };
};

export const mapDbOrderToRow = (order: Order & { shipments: Shipment[] }): OrdersPageRow => {
  const latestShipment = order.shipments?.[0] ?? null;
  const status = deriveOrderOperationalStatus(latestShipment);
  const { dateLabel, timeLabel } = formatDateTime(order.createdAt ?? new Date());
  const paymentType = String(order.paymentMode ?? "").toUpperCase() === "COD" ? "COD" : "Prepaid";

  return {
    id: order.id,
    source: "db",
    orderDateTime: order.createdAt?.toISOString?.() ?? new Date(0).toISOString(),
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
    paymentType,
    shippingName: order.customerName,
    shippingAddress: [order.addressLine1, order.addressLine2].filter(Boolean).join(", ") || "—",
    cityStatePincode: `${order.city}, ${order.state} - ${order.pincode}`,
    operationalStatus: status,
    operationalStatusLabel: getOrderStatusLabel(status),
    operationalStatusBadgeClass: getOrderStatusBadgeClass(status),
    latestShipment
  };
};
