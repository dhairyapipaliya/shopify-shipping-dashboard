import type { PaymentMode } from "@prisma/client";

export type QuoteRequest = {
  orderId: string;
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  destinationPincode: string;
  paymentMode: PaymentMode;
  orderValue: number;
};

export type ProviderQuote = {
  provider: string;
  serviceName: string;
  etaDays: number;
  shippingCost: number;
  codCharges: number;
  supportsCod: boolean;
  supportsPrepaid: boolean;
  rawResponse: Record<string, unknown>;
};

export type BookingRequest = QuoteRequest & {
  serviceName: string;
};

export type BookingResult = {
  provider: string;
  serviceName: string;
  awbNumber: string;
  trackingUrl?: string;
  labelUrl?: string;
  payload: Record<string, unknown>;
};

export interface ShippingProvider {
  name: string;
  getQuotes(input: QuoteRequest): Promise<ProviderQuote[]>;
  bookShipment(input: BookingRequest): Promise<BookingResult>;
}
