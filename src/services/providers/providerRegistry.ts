import { DelhiveryDirectProvider } from "./delhiveryDirect.js";
import { ShipmozoProvider } from "./shipmozo.js";
import type { ShippingProvider } from "./types.js";

const providers: ShippingProvider[] = [new DelhiveryDirectProvider(), new ShipmozoProvider()];

export const providerRegistry = {
  list: () => providers,
  get: (name: string) => providers.find((p) => p.name === name)
};
