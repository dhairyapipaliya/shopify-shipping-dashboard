export type PincodeLookupResult = {
  city: string;
  state: string;
  district?: string;
  postOffices?: string[];
};

const mockIndianPincodeDirectory: Record<string, PincodeLookupResult> = {
  "110020": { city: "New Delhi", state: "Delhi", district: "South East Delhi" },
  "201309": { city: "Noida", state: "Uttar Pradesh", district: "Gautam Buddha Nagar" },
  "360022": { city: "Rajkot", state: "Gujarat", district: "Rajkot" },
  "400059": { city: "Mumbai", state: "Maharashtra", district: "Mumbai Suburban" },
  "401107": { city: "Mumbai", state: "Maharashtra", district: "Thane" },
  "411005": { city: "Pune", state: "Maharashtra", district: "Pune" },
  "500034": { city: "Hyderabad", state: "Telangana", district: "Hyderabad" },
  "560100": { city: "Bengaluru", state: "Karnataka", district: "Bengaluru" },
  "600032": { city: "Chennai", state: "Tamil Nadu", district: "Chennai" },
  "700001": { city: "Kolkata", state: "West Bengal", district: "Kolkata" }
};

export const isValidIndianPincode = (pincode: string): boolean => /^\d{6}$/.test(pincode.trim());

export const listMockPincodeDirectory = (): Record<string, PincodeLookupResult> => ({ ...mockIndianPincodeDirectory });

export const lookupMockIndianPincode = (pincode: string): PincodeLookupResult | null => {
  const normalized = pincode.trim();
  if (!isValidIndianPincode(normalized)) {
    return null;
  }

  return mockIndianPincodeDirectory[normalized] ?? null;
};
