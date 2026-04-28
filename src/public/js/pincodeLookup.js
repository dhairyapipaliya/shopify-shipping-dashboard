(() => {
  const directory = window.__INDIAN_PINCODE_DIRECTORY__ || {};

  const normalizePincode = (pincode) => String(pincode || "").trim();

  const isValidIndianPincode = (pincode) => /^\d{6}$/.test(normalizePincode(pincode));

  const lookupIndianPincode = (pincode) => {
    const normalized = normalizePincode(pincode);
    if (!isValidIndianPincode(normalized)) {
      return null;
    }

    return directory[normalized] || null;
  };

  window.WarehousePincodeLookup = {
    isValidIndianPincode,
    lookupIndianPincode
  };
})();
