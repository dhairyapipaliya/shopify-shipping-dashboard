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
  return (35 + weightGrams / 1000 * 18) * zoneFactor;
};

export class DelhiveryDirectProvider implements ShippingProvider {
  name = "delhivery_direct";

  private async checkServiceability(input: QuoteRequest): Promise<ServiceabilityResponse> {
    if (env.DELHIVERY_USE_MOCK) {
      return { serviceable: true, providerZone: "mock-zone-a", raw: { mock: true } };
    }

    assertLiveCredential("Delhivery", env.DELHIVERY_USE_MOCK, {
      DELHIVERY_BASE_URL: env.DELHIVERY_BASE_URL,
      DELHIVERY_API_KEY: env.DELHIVERY_API_KEY
    });

    return withRetry(async () => {
      // Placeholder for real Delhivery sandbox serviceability API call.
      throw new Error("Delhivery sandbox API integration pending for serviceability.");
    }, { context: { provider: this.name, operation: "serviceability" } });
  }

  private async getRate(input: QuoteRequest): Promise<RateQuoteResponse> {
    const base = calculateBase(input.weightGrams, input.destinationPincode);
    const shippingCost = Number(base.toFixed(2));
    const codCharges = input.paymentMode === "COD" ? 35 : 0;

    if (env.DELHIVERY_USE_MOCK) {
      return {
        provider: this.name,
        serviceName: "Delhivery Direct",
        shippingCost,
        codCharges,
        totalCost: shippingCost + codCharges,
        currency: "INR",
        raw: { mock: true, route: "surface" }
      };
    }

    assertLiveCredential("Delhivery", env.DELHIVERY_USE_MOCK, {
      DELHIVERY_BASE_URL: env.DELHIVERY_BASE_URL,
      DELHIVERY_API_KEY: env.DELHIVERY_API_KEY
    });

    return withRetry(async () => {
      // Placeholder for real Delhivery sandbox rate API call.
      throw new Error("Delhivery sandbox API integration pending for quote rates.");
    }, { context: { provider: this.name, operation: "rate" } });
  }

  async getQuotes(input: QuoteRequest): Promise<ProviderQuote[]> {
    const serviceability = await this.checkServiceability(input);

    if (!serviceability.serviceable) {
      logger.warn("Delhivery Direct not serviceable for pincode", {
        pincode: input.destinationPincode,
        reasons: serviceability.reasons
      });
      return [];
    }

    const rate = await this.getRate(input);

    return [{
      provider: this.name,
      serviceName: rate.serviceName,
      etaDays: 0,
      shippingCost: rate.shippingCost,
      codCharges: rate.codCharges,
      supportsCod: true,
      supportsPrepaid: true,
      rawResponse: { ...rate.raw, serviceability: serviceability.raw }
    }];
  }

  private async bookInProvider(request: ShipmentBookingRequest): Promise<ShipmentBookingResponse> {
    if (env.DELHIVERY_USE_MOCK) {
      const id = `DLVBOOK${Math.floor(Math.random() * 9_00_000 + 100_000)}`;
      return { bookingId: id, status: "BOOKED", raw: { mock: true } };
    }

    return withRetry(async () => {
      throw new Error("Delhivery sandbox API integration pending for booking.");
    }, { context: { provider: this.name, operation: "booking", orderRef: request.orderRef } });
  }

  private async generateAwb(): Promise<AwbGenerationResponse> {
    const suffix = Math.floor(Math.random() * 9_00_000 + 100_000);
    return { awbNumber: `DLV${suffix}`, raw: { mock: true } };
  }

  private async getLabel(awbNumber: string): Promise<LabelDownloadResponse> {
    return {
      labelUrl: `https://example.local/mock-labels/delhivery-${awbNumber}.pdf`,
      format: "PDF",
      raw: { mock: true }
    };
  }

  private async getTracking(awbNumber: string): Promise<TrackingResponse> {
    return {
      trackingUrl: `https://www.delhivery.com/track-v2/package/${awbNumber}`,
      status: "BOOKED",
      checkpoints: [{ at: new Date().toISOString(), description: "Shipment created" }],
      raw: { mock: true }
    };
  }

  async bookShipment(input: BookingRequest): Promise<BookingResult> {
    const bookingRequest: ShipmentBookingRequest = {
      provider: this.name,
      serviceName: input.serviceName,
      orderRef: input.orderId,
      parcel: {
        weightGrams: input.weightGrams,
        lengthCm: input.lengthCm,
        widthCm: input.widthCm,
        heightCm: input.heightCm,
        destinationPincode: input.destinationPincode,
        orderValue: input.orderValue,
        paymentMode: input.paymentMode
      },
      recipient: {
        name: "Order Customer",
        pincode: input.destinationPincode,
        addressLine1: "Address placeholder",
        city: "NA",
        state: "NA",
        country: "IN"
      }
    };

    const booking = await this.bookInProvider(bookingRequest);
    const awb = await this.generateAwb();
    const label = await this.getLabel(awb.awbNumber);
    const tracking = await this.getTracking(awb.awbNumber);

    return {
      provider: this.name,
      serviceName: input.serviceName,
      awbNumber: awb.awbNumber,
      trackingUrl: tracking.trackingUrl,
      labelUrl: label.labelUrl,
      payload: { booking, awb, label, tracking }
    };
  }
}
