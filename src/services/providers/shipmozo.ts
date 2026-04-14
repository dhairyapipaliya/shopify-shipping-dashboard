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

const volumetricWeight = (l: number, w: number, h: number) => (l * w * h) / 5000;

export class ShipmozoProvider implements ShippingProvider {
  name = "shipmozo_delhivery";

  private async checkServiceability(input: QuoteRequest): Promise<ServiceabilityResponse> {
    if (env.SHIPMOZO_USE_MOCK) return { serviceable: true, raw: { mock: true, lane: "delhivery" } };

    assertLiveCredential("Shipmozo", env.SHIPMOZO_USE_MOCK, {
      SHIPMOZO_BASE_URL: env.SHIPMOZO_BASE_URL,
      SHIPMOZO_API_KEY: env.SHIPMOZO_API_KEY
    });

    return withRetry(async () => {
      throw new Error("Shipmozo sandbox API integration pending for serviceability.");
    }, { context: { provider: this.name, operation: "serviceability" } });
  }

  private async getRate(input: QuoteRequest): Promise<RateQuoteResponse> {
    const chargeableWeight = Math.max(input.weightGrams / 1000, volumetricWeight(input.lengthCm, input.widthCm, input.heightCm));
    const shippingCost = Number((34 + chargeableWeight * 22).toFixed(2));

    if (env.SHIPMOZO_USE_MOCK) {
      return {
        provider: this.name,
        serviceName: "Delhivery via Shipmozo",
        shippingCost,
        totalCost: shippingCost,
        currency: "INR",
        etaDays: 2,
        labelReady: true,
        trackingReady: true,
        raw: { mock: true, selectedCourier: "Delhivery" }
      };
    }

    return withRetry(async () => {
      throw new Error("Shipmozo sandbox API integration pending for quote rates.");
    }, { context: { provider: this.name, operation: "rate" } });
  }

  async getQuotes(input: QuoteRequest): Promise<ProviderQuote[]> {
    const serviceability = await this.checkServiceability(input);
    if (!serviceability.serviceable) {
      logger.warn("Shipmozo Delhivery not serviceable", { pincode: input.destinationPincode });
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
    if (env.SHIPMOZO_USE_MOCK) return { bookingId: `SMZBOOK${Date.now()}`, status: "BOOKED", raw: { mock: true, request } };
    return withRetry(async () => {
      throw new Error("Shipmozo sandbox API integration pending for booking.");
    }, { context: { provider: this.name, operation: "booking", orderRef: request.orderRef } });
  }

  private async generateAwb(): Promise<AwbGenerationResponse> {
    return { awbNumber: `SMZDLV${Math.floor(Math.random() * 1_000_000)}`, source: "shipmozo_delhivery", raw: { mock: true } };
  }

  private async getLabel(awbNumber: string): Promise<LabelDownloadResponse> {
    return { labelUrl: `https://example.local/mock-labels/shipmozo-delhivery-${awbNumber}.pdf`, format: "PDF", raw: { mock: true } };
  }

  private async getTracking(awbNumber: string): Promise<TrackingResponse> {
    return {
      trackingNumber: awbNumber,
      trackingUrl: `https://track.shipmozo.example/delhivery/${awbNumber}`,
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
      payload: { booking, awb, label, tracking, selectedCourier: "Delhivery" }
    };
  }
}
