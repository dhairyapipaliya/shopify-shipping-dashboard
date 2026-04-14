export type QuoteRequest = {
  orderId: string;
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  destinationPincode: string;
  orderValue: number;
};

export type ProviderQuote = {
  provider: string;
  serviceName: string;
  etaDays?: number;
  shippingCost: number;
  totalCost: number;
  labelReady: boolean;
  trackingReady: boolean;
  rawResponse: Record<string, unknown>;
};

export type BookingRequest = QuoteRequest & {
  serviceName: string;
};

export type BookingResult = {
  provider: string;
  serviceName: string;
  awbNumber: string;
  awbSource: string;
  trackingNumber: string;
  trackingUrl?: string;
  labelUrl?: string;
  payload: Record<string, unknown>;
};

export interface ShippingProvider {
  name: string;
  getQuotes(input: QuoteRequest): Promise<ProviderQuote[]>;
  bookShipment(input: BookingRequest): Promise<BookingResult>;
}
