export type PincodeLookupResult = {
  city: string;
  state: string;
  district?: string;
  postOffices?: string[];
};

const buildMockDirectory = (): Record<string, PincodeLookupResult> => {
  const dir: Record<string, PincodeLookupResult> = {};

  const fill = (start: number, end: number, result: PincodeLookupResult) => {
    for (let i = start; i <= end; i++) {
      dir[String(i)] = result;
    }
  };

  // ── Delhi / NCR ──────────────────────────────────────────────────────────
  fill(110001, 110096, { city: "New Delhi", state: "Delhi" });
  fill(110301, 110306, { city: "New Delhi", state: "Delhi" });
  fill(201001, 201020, { city: "Ghaziabad", state: "Uttar Pradesh" });
  fill(201301, 201315, { city: "Noida", state: "Uttar Pradesh" });
  fill(122001, 122052, { city: "Gurugram", state: "Haryana" });
  fill(121001, 121012, { city: "Faridabad", state: "Haryana" });
  fill(131001, 131030, { city: "Sonipat", state: "Haryana" });

  // ── Mumbai / Maharashtra ─────────────────────────────────────────────────
  fill(400001, 400104, { city: "Mumbai", state: "Maharashtra" });
  fill(401101, 401209, { city: "Thane", state: "Maharashtra" });
  fill(410201, 410210, { city: "Navi Mumbai", state: "Maharashtra" });
  fill(411001, 411062, { city: "Pune", state: "Maharashtra" });
  fill(440001, 440035, { city: "Nagpur", state: "Maharashtra" });
  fill(431001, 431010, { city: "Aurangabad", state: "Maharashtra" });
  fill(416001, 416120, { city: "Kolhapur", state: "Maharashtra" });
  fill(422001, 422012, { city: "Nashik", state: "Maharashtra" });
  fill(421001, 421306, { city: "Thane", state: "Maharashtra" });

  // ── Bengaluru / Karnataka ────────────────────────────────────────────────
  fill(560001, 560100, { city: "Bengaluru", state: "Karnataka" });
  fill(575001, 575025, { city: "Mangaluru", state: "Karnataka" });
  fill(580001, 580031, { city: "Dharwad", state: "Karnataka" });
  fill(590001, 590020, { city: "Belagavi", state: "Karnataka" });

  // ── Chennai / Tamil Nadu ─────────────────────────────────────────────────
  fill(600001, 600119, { city: "Chennai", state: "Tamil Nadu" });
  fill(641001, 641050, { city: "Coimbatore", state: "Tamil Nadu" });
  fill(625001, 625025, { city: "Madurai", state: "Tamil Nadu" });
  fill(620001, 620023, { city: "Tiruchirappalli", state: "Tamil Nadu" });
  fill(630001, 630562, { city: "Sivakasi", state: "Tamil Nadu" });

  // ── Hyderabad / Telangana ────────────────────────────────────────────────
  fill(500001, 500096, { city: "Hyderabad", state: "Telangana" });
  fill(501301, 501512, { city: "Hyderabad", state: "Telangana" });
  fill(506001, 506020, { city: "Warangal", state: "Telangana" });

  // ── Gujarat ──────────────────────────────────────────────────────────────
  fill(380001, 380061, { city: "Ahmedabad", state: "Gujarat" });
  fill(382001, 382481, { city: "Ahmedabad", state: "Gujarat" });
  fill(395001, 395023, { city: "Surat", state: "Gujarat" });
  fill(360001, 360022, { city: "Rajkot", state: "Gujarat" });
  fill(390001, 390023, { city: "Vadodara", state: "Gujarat" });
  fill(361001, 361012, { city: "Jamnagar", state: "Gujarat" });
  fill(364001, 364004, { city: "Bhavnagar", state: "Gujarat" });

  // ── West Bengal ──────────────────────────────────────────────────────────
  fill(700001, 700162, { city: "Kolkata", state: "West Bengal" });
  fill(711101, 711116, { city: "Howrah", state: "West Bengal" });
  fill(713101, 713216, { city: "Durgapur", state: "West Bengal" });

  // ── Uttar Pradesh ────────────────────────────────────────────────────────
  fill(226001, 226030, { city: "Lucknow", state: "Uttar Pradesh" });
  fill(208001, 208027, { city: "Kanpur", state: "Uttar Pradesh" });
  fill(282001, 282010, { city: "Agra", state: "Uttar Pradesh" });
  fill(221001, 221010, { city: "Varanasi", state: "Uttar Pradesh" });
  fill(250001, 250110, { city: "Meerut", state: "Uttar Pradesh" });
  fill(211001, 211021, { city: "Prayagraj", state: "Uttar Pradesh" });
  fill(243001, 243006, { city: "Bareilly", state: "Uttar Pradesh" });
  fill(247001, 247001, { city: "Saharanpur", state: "Uttar Pradesh" });

  // ── Rajasthan ────────────────────────────────────────────────────────────
  fill(302001, 302040, { city: "Jaipur", state: "Rajasthan" });
  fill(313001, 313330, { city: "Udaipur", state: "Rajasthan" });
  fill(342001, 342031, { city: "Jodhpur", state: "Rajasthan" });
  fill(334001, 334023, { city: "Bikaner", state: "Rajasthan" });
  fill(305001, 305022, { city: "Ajmer", state: "Rajasthan" });

  // ── Madhya Pradesh ───────────────────────────────────────────────────────
  fill(462001, 462046, { city: "Bhopal", state: "Madhya Pradesh" });
  fill(452001, 452020, { city: "Indore", state: "Madhya Pradesh" });
  fill(474001, 474012, { city: "Gwalior", state: "Madhya Pradesh" });
  fill(492001, 492015, { city: "Raipur", state: "Chhattisgarh" });

  // ── Bihar ────────────────────────────────────────────────────────────────
  fill(800001, 800027, { city: "Patna", state: "Bihar" });
  fill(812001, 812009, { city: "Bhagalpur", state: "Bihar" });

  // ── Odisha ───────────────────────────────────────────────────────────────
  fill(751001, 751030, { city: "Bhubaneswar", state: "Odisha" });
  fill(753001, 753015, { city: "Cuttack", state: "Odisha" });

  // ── Punjab ───────────────────────────────────────────────────────────────
  fill(143001, 143008, { city: "Amritsar", state: "Punjab" });
  fill(141001, 141018, { city: "Ludhiana", state: "Punjab" });
  fill(147001, 147010, { city: "Patiala", state: "Punjab" });
  fill(144001, 144022, { city: "Jalandhar", state: "Punjab" });

  // ── Chandigarh ───────────────────────────────────────────────────────────
  fill(160001, 160103, { city: "Chandigarh", state: "Chandigarh" });

  // ── Haryana ──────────────────────────────────────────────────────────────
  fill(132001, 132113, { city: "Karnal", state: "Haryana" });
  fill(134001, 134118, { city: "Panchkula", state: "Haryana" });
  fill(125001, 125055, { city: "Hisar", state: "Haryana" });

  // ── Kerala ───────────────────────────────────────────────────────────────
  fill(695001, 695025, { city: "Thiruvananthapuram", state: "Kerala" });
  fill(682001, 682030, { city: "Kochi", state: "Kerala" });
  fill(673001, 673640, { city: "Kozhikode", state: "Kerala" });

  // ── Andhra Pradesh ───────────────────────────────────────────────────────
  fill(520001, 520015, { city: "Vijayawada", state: "Andhra Pradesh" });
  fill(530001, 530048, { city: "Visakhapatnam", state: "Andhra Pradesh" });
  fill(522001, 522019, { city: "Guntur", state: "Andhra Pradesh" });

  // ── Jharkhand ────────────────────────────────────────────────────────────
  fill(834001, 834009, { city: "Ranchi", state: "Jharkhand" });
  fill(831001, 831017, { city: "Jamshedpur", state: "Jharkhand" });

  // ── Assam ────────────────────────────────────────────────────────────────
  fill(781001, 781040, { city: "Guwahati", state: "Assam" });

  // ── Uttarakhand ──────────────────────────────────────────────────────────
  fill(248001, 248199, { city: "Dehradun", state: "Uttarakhand" });
  fill(263001, 263160, { city: "Nainital", state: "Uttarakhand" });

  // ── Himachal Pradesh ─────────────────────────────────────────────────────
  fill(171001, 171014, { city: "Shimla", state: "Himachal Pradesh" });

  // ── Jammu & Kashmir ──────────────────────────────────────────────────────
  fill(180001, 180020, { city: "Jammu", state: "Jammu & Kashmir" });
  fill(190001, 190025, { city: "Srinagar", state: "Jammu & Kashmir" });

  // ── Goa ──────────────────────────────────────────────────────────────────
  fill(403001, 403516, { city: "Panaji", state: "Goa" });

  return dir;
};

const mockIndianPincodeDirectory: Record<string, PincodeLookupResult> = buildMockDirectory();

export const isValidIndianPincode = (pincode: string): boolean => /^\d{6}$/.test(pincode.trim());

export const listMockPincodeDirectory = (): Record<string, PincodeLookupResult> => ({ ...mockIndianPincodeDirectory });

export const lookupMockIndianPincode = (pincode: string): PincodeLookupResult | null => {
  const normalized = pincode.trim();
  if (!isValidIndianPincode(normalized)) {
    return null;
  }

  return mockIndianPincodeDirectory[normalized] ?? null;
};
