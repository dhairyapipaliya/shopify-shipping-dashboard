export type ParcelDetails = {
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  destinationPincode: string;
  orderValue: number;
};

export interface ServiceabilityResponse {
  serviceable: boolean;
  reasons?: string[];
  providerZone?: string;
  raw: Record<string, unknown>;
}

export interface RateQuoteResponse {
  provider: string;
  serviceName: string;
  shippingCost: number;
  totalCost: number;
  currency: "INR";
  etaDays?: number;
  labelReady: boolean;
  trackingReady: boolean;
  raw: Record<string, unknown>;
}

export interface ShipmentBookingRequest {
  provider: string;
  serviceName: string;
  orderRef: string;
  parcel: ParcelDetails;
  recipient: {
    name: string;
    phone?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
}

export interface ShipmentBookingResponse {
  bookingId: string;
  status: "BOOKED" | "FAILED";
  raw: Record<string, unknown>;
}

export interface AwbGenerationResponse {
  awbNumber: string;
  source: string;
  raw: Record<string, unknown>;
}

export interface LabelDownloadResponse {
  labelUrl: string;
  format: "PDF";
  raw: Record<string, unknown>;
}

export interface TrackingResponse {
  trackingNumber: string;
  trackingUrl: string;
  status: string;
  checkpoints: Array<{ at: string; description: string }>;
  raw: Record<string, unknown>;
}
