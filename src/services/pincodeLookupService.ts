import { isValidIndianPincode, lookupMockIndianPincode, type PincodeLookupResult } from "../utils/pincodeLookup.js";

type IndiaPostOffice = {
  Name?: string;
  District?: string;
  State?: string;
  Block?: string;
};

type IndiaPostResponseItem = {
  Status?: string;
  PostOffice?: IndiaPostOffice[] | null;
};

const INDIA_POST_API_BASE_URL = "https://api.postalpincode.in/pincode";

const unique = (items: string[]): string[] => Array.from(new Set(items.filter(Boolean)));

const normalizePostOfficeResponse = (payload: IndiaPostResponseItem[]): PincodeLookupResult | null => {
  const firstResult = payload.find((item) => item.Status?.toLowerCase() === "success" && Array.isArray(item.PostOffice));
  const offices = firstResult?.PostOffice ?? [];
  if (!offices.length) {
    return null;
  }

  const first = offices.find((office) => office.State && (office.Block || office.District || office.Name));
  if (!first?.State) {
    return null;
  }

  const city = first.Block?.trim() || first.District?.trim() || first.Name?.trim();
  const state = first.State.trim();
  if (!city || !state) {
    return null;
  }

  const district = first.District?.trim() || undefined;
  const postOffices = unique(offices.map((office) => office.Name?.trim() || ""));

  return { city, state, district, postOffices };
};

const lookupFromIndiaPostApi = async (pincode: string): Promise<PincodeLookupResult | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(`${INDIA_POST_API_BASE_URL}/${encodeURIComponent(pincode)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as IndiaPostResponseItem[];
    if (!Array.isArray(payload)) {
      return null;
    }

    return normalizePostOfficeResponse(payload);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export const lookupIndianPincode = async (pincode: string): Promise<PincodeLookupResult | null> => {
  const normalized = pincode.trim();
  if (!isValidIndianPincode(normalized)) {
    return null;
  }

  const liveLookup = await lookupFromIndiaPostApi(normalized);
  if (liveLookup) {
    return liveLookup;
  }

  return lookupMockIndianPincode(normalized);
};
