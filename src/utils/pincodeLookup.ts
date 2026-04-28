export type PincodeLookupResult = {
  city: string;
  state: string;
};

const mockIndianPincodeDirectory: Record<string, PincodeLookupResult> = {
  "110020": { city: "New Delhi", state: "Delhi" },
  "201309": { city: "Noida", state: "Uttar Pradesh" },
  "360022": { city: "Rajkot", state: "Gujarat" },
  "400059": { city: "Mumbai", state: "Maharashtra" },
  "401107": { city: "Mumbai", state: "Maharashtra" },
  "411005": { city: "Pune", state: "Maharashtra" },
  "500034": { city: "Hyderabad", state: "Telangana" },
  "560100": { city: "Bengaluru", state: "Karnataka" },
  "600032": { city: "Chennai", state: "Tamil Nadu" },
  "700001": { city: "Kolkata", state: "West Bengal" }
};

export const listMockPincodeDirectory = (): Record<string, PincodeLookupResult> => ({ ...mockIndianPincodeDirectory });

export const lookupIndianPincode = async (pincode: string): Promise<PincodeLookupResult | null> => {
  const normalized = pincode.trim();
  if (!/^\d{6}$/.test(normalized)) {
    return null;
  }

  return mockIndianPincodeDirectory[normalized] ?? null;
};
