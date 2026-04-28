(() => {
  const directory = window.__INDIAN_PINCODE_DIRECTORY__ || {};

  const normalizePincode = (pincode) => String(pincode || "").trim();

  const isValidIndianPincode = (pincode) => /^\d{6}$/.test(normalizePincode(pincode));

  const lookupIndianPincodeFromMock = (pincode) => {
    const normalized = normalizePincode(pincode);
    if (!isValidIndianPincode(normalized)) {
      return null;
    }

    return directory[normalized] || null;
  };

  const lookupIndianPincode = async (pincode) => {
    const normalized = normalizePincode(pincode);
    if (!isValidIndianPincode(normalized)) {
      return null;
    }

    try {
      const response = await fetch(`/api/pincode/${encodeURIComponent(normalized)}`, {
        method: "GET",
        headers: { Accept: "application/json" }
      });
      if (response.ok) {
        const payload = await response.json();
        if (payload && payload.city && payload.state) {
          return payload;
        }
      }
    } catch {
      // silent fallback to mock lookup below
    }

    return lookupIndianPincodeFromMock(normalized);
  };

  window.WarehousePincodeLookup = {
    isValidIndianPincode,
    lookupIndianPincode,
    lookupIndianPincodeFromMock
  };
})();
