export type PincodeLookupResult = {
  city: string;
  state: string;
};

const mockIndianPincodeDirectory: Record<string, PincodeLookupResult> = {
  "110020": { city: "New Delhi", state: "Delhi" },
  "122001": { city: "Gurugram", state: "Haryana" },
  "400059": { city: "Mumbai", state: "Maharashtra" },
  "500081": { city: "Hyderabad", state: "Telangana" },
  "560100": { city: "Bengaluru", state: "Karnataka" },
  "600096": { city: "Chennai", state: "Tamil Nadu" },
  "700091": { city: "Kolkata", state: "West Bengal" }
};

export const listMockPincodeDirectory = (): Record<string, PincodeLookupResult> => ({ ...mockIndianPincodeDirectory });

export const lookupIndianPincode = async (pincode: string): Promise<PincodeLookupResult | null> => {
  const normalized = pincode.trim();
  if (!/^\d{6}$/.test(normalized)) {
    return null;
  }

  return mockIndianPincodeDirectory[normalized] ?? null;
};
