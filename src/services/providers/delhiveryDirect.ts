import { env, assertLiveCredential } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { withRetry } from "../../utils/retry.js";
import type {
  AwbGenerationResponse,
  LabelDownloadResponse,
  RateQuoteResponse,
  ServiceabilityResponse,
  ShipmentBookingRequest,
  ShipmentBookingResponse,
  TrackingResponse
} from "./apiInterfaces.js";
import type { BookingRequest, BookingResult, ProviderQuote, QuoteRequest, ShippingProvider } from "./types.js";

const calculateBase = (weightGrams: number, pincode: string) => {
  const zoneFactor = pincode.startsWith("11") || pincode.startsWith("12") ? 1 : 1.2;
  return (38 + weightGrams / 1000 * 18) * zoneFactor;
};

export class DelhiveryDirectProvider implements ShippingProvider {
  name = "delhivery_direct";

  private async checkServiceability(_input: QuoteRequest): Promise<ServiceabilityResponse> {
    if (env.DELHIVERY_USE_MOCK) {
      return { serviceable: true, providerZone: "mock-zone-a", raw: { mock: true } };
    }

    assertLiveCredential("Delhivery", env.DELHIVERY_USE_MOCK, {
      DELHIVERY_BASE_URL: env.DELHIVERY_BASE_URL,
      DELHIVERY_API_KEY: env.DELHIVERY_API_KEY
    });

    return withRetry(async () => {
      throw new Error("Delhivery sandbox API integration pending for serviceability.");
    }, { context: { provider: this.name, operation: "serviceability" } });
  }

  private async getRate(input: QuoteRequest): Promise<RateQuoteResponse> {
    const shippingCost = Number(calculateBase(input.weightGrams, input.destinationPincode).toFixed(2));

    if (env.DELHIVERY_USE_MOCK) {
      return {
        provider: this.name,
        serviceName: "Delhivery Direct",
        shippingCost,
        totalCost: shippingCost,
        currency: "INR",
        etaDays: 3,
        labelReady: true,
        trackingReady: true,
        raw: { mock: true, route: "surface" }
      };
    }

    return withRetry(async () => {
      throw new Error("Delhivery sandbox API integration pending for quote rates.");
    }, { context: { provider: this.name, operation: "rate" } });
  }

  async getQuotes(input: QuoteRequest): Promise<ProviderQuote[]> {
    const serviceability = await this.checkServiceability(input);
    if (!serviceability.serviceable) {
      logger.warn("Delhivery Direct not serviceable", { pincode: input.destinationPincode });
      return [];
    }

    const rate = await this.getRate(input);
    return [{
      provider: this.name,
      serviceName: rate.serviceName,
      etaDays: rate.etaDays,
      shippingCost: rate.shippingCost,
      totalCost: rate.totalCost,
      labelReady: rate.labelReady,
      trackingReady: rate.trackingReady,
      rawResponse: { ...rate.raw, serviceability: serviceability.raw }
    }];
  }

  private async bookInProvider(request: ShipmentBookingRequest): Promise<ShipmentBookingResponse> {
    if (env.DELHIVERY_USE_MOCK) {
      return { bookingId: `DLVBOOK${Date.now()}`, status: "BOOKED", raw: { mock: true, request } };
    }
    return withRetry(async () => {
      throw new Error("Delhivery sandbox API integration pending for booking.");
    }, { context: { provider: this.name, operation: "booking", orderRef: request.orderRef } });
  }

  private async generateAwb(): Promise<AwbGenerationResponse> {
    return { awbNumber: `DLV${Math.floor(Math.random() * 1_000_000)}`, source: "delhivery_direct", raw: { mock: true } };
  }

  private async getLabel(awbNumber: string): Promise<LabelDownloadResponse> {
    return { labelUrl: `https://example.local/mock-labels/delhivery-${awbNumber}.pdf`, format: "PDF", raw: { mock: true } };
  }

  private async getTracking(awbNumber: string): Promise<TrackingResponse> {
    return {
      trackingNumber: awbNumber,
      trackingUrl: `https://www.delhivery.com/track-v2/package/${awbNumber}`,
      status: "BOOKED",
      checkpoints: [{ at: new Date().toISOString(), description: "Shipment created" }],
      raw: { mock: true }
    };
  }

  async bookShipment(input: BookingRequest): Promise<BookingResult> {
    const booking = await this.bookInProvider({
      provider: this.name,
      serviceName: input.serviceName,
      orderRef: input.orderId,
      parcel: {
        weightGrams: input.weightGrams,
        lengthCm: input.lengthCm,
        widthCm: input.widthCm,
        heightCm: input.heightCm,
        destinationPincode: input.destinationPincode,
        orderValue: input.orderValue
      },
      recipient: { name: "Shopify Customer", addressLine1: "TBD", city: "TBD", state: "TBD", country: "IN", pincode: input.destinationPincode }
    });

    const awb = await this.generateAwb();
    const label = await this.getLabel(awb.awbNumber);
    const tracking = await this.getTracking(awb.awbNumber);

    return {
      provider: this.name,
      serviceName: input.serviceName,
      awbNumber: awb.awbNumber,
      awbSource: awb.source,
      trackingNumber: tracking.trackingNumber,
      trackingUrl: tracking.trackingUrl,
      labelUrl: label.labelUrl,
      payload: { booking, awb, label, tracking }
    };
  }
}
