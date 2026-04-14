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
    if (env.SHIPMOZO_USE_MOCK) {
      return { serviceable: true, providerZone: "mock-delhivery-lane", raw: { mock: true } };
    }

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
    const codCharges = input.paymentMode === "COD" ? 25 : 0;

    if (env.SHIPMOZO_USE_MOCK) {
      return {
        provider: this.name,
        serviceName: "Delhivery via Shipmozo",
        shippingCost,
        codCharges,
        totalCost: shippingCost + codCharges,
        currency: "INR",
        raw: { mock: true, selectedCourier: "Delhivery" }
      };
    }

    assertLiveCredential("Shipmozo", env.SHIPMOZO_USE_MOCK, {
      SHIPMOZO_BASE_URL: env.SHIPMOZO_BASE_URL,
      SHIPMOZO_API_KEY: env.SHIPMOZO_API_KEY
    });

    return withRetry(async () => {
      throw new Error("Shipmozo sandbox API integration pending for quote rates.");
    }, { context: { provider: this.name, operation: "rate", selectedCourier: "Delhivery" } });
  }

  async getQuotes(input: QuoteRequest): Promise<ProviderQuote[]> {
    const serviceability = await this.checkServiceability(input);

    if (!serviceability.serviceable) {
      logger.warn("Shipmozo Delhivery lane not serviceable", {
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
    if (env.SHIPMOZO_USE_MOCK) {
      const id = `SMZBOOK${Math.floor(Math.random() * 9_00_000 + 100_000)}`;
      return { bookingId: id, status: "BOOKED", raw: { mock: true, selectedCourier: "Delhivery" } };
    }

    return withRetry(async () => {
      throw new Error("Shipmozo sandbox API integration pending for booking.");
    }, { context: { provider: this.name, operation: "booking", orderRef: request.orderRef } });
  }

  private async generateAwb(): Promise<AwbGenerationResponse> {
    const suffix = Math.floor(Math.random() * 9_00_000 + 100_000);
    return { awbNumber: `SMZDLV${suffix}`, raw: { mock: true } };
  }

  private async getLabel(awbNumber: string): Promise<LabelDownloadResponse> {
    return {
      labelUrl: `https://example.local/mock-labels/shipmozo-delhivery-${awbNumber}.pdf`,
      format: "PDF",
      raw: { mock: true }
    };
  }

  private async getTracking(awbNumber: string): Promise<TrackingResponse> {
    return {
      trackingUrl: `https://track.shipmozo.example/delhivery/${awbNumber}`,
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
      payload: { booking, awb, label, tracking, selectedCourier: "Delhivery" }
    };
  }
}
