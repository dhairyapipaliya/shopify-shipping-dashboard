export const PACKAGE_MODE = {
  SINGLE_PACKAGE_B2C: "SINGLE_PACKAGE_B2C",
  MULTI_PACKAGE_B2B: "MULTI_PACKAGE_B2B"
} as const;

export type PackageMode = (typeof PACKAGE_MODE)[keyof typeof PACKAGE_MODE];

export type PackageBox = {
  id: string;
  no_of_boxes: number;
  per_box_weight_kg: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
};

export const B2B_WEIGHT_THRESHOLD_KG = 25;

const normalizePositiveNumber = (value: number, fallback: number): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
};

export const normalizePackageBox = (box: Partial<PackageBox> & { id?: string }, fallbackId?: string): PackageBox => {
  const noOfBoxes = Math.max(1, Math.round(normalizePositiveNumber(box.no_of_boxes ?? 1, 1)));
  const perBoxWeight = normalizePositiveNumber(box.per_box_weight_kg ?? 0.1, 0.1);

  return {
    id: box.id || fallbackId || crypto.randomUUID(),
    no_of_boxes: noOfBoxes,
    per_box_weight_kg: perBoxWeight,
    length_cm: Math.round(normalizePositiveNumber(box.length_cm ?? 1, 1)),
    width_cm: Math.round(normalizePositiveNumber(box.width_cm ?? 1, 1)),
    height_cm: Math.round(normalizePositiveNumber(box.height_cm ?? 1, 1))
  };
};

export const derivePackageMode = (boxes: PackageBox[], totalWeightKg: number): PackageMode => {
  const packageGroups = Array.isArray(boxes) ? boxes : [];
  if (packageGroups.length > 1 || totalWeightKg > B2B_WEIGHT_THRESHOLD_KG) {
    return PACKAGE_MODE.MULTI_PACKAGE_B2B;
  }

  return PACKAGE_MODE.SINGLE_PACKAGE_B2C;
};

export const normalizePackageBoxes = (boxes: PackageBox[], packageMode: PackageMode): PackageBox[] => {
  const normalized = (Array.isArray(boxes) ? boxes : [])
    .map((box, index) => normalizePackageBox(box, `pkg-${index + 1}`));

  if (packageMode === PACKAGE_MODE.SINGLE_PACKAGE_B2C) {
    const firstBox = normalized[0];
    if (!firstBox) {
      return [];
    }

    return [{ ...firstBox, no_of_boxes: 1 }];
  }

  return normalized;
};

export const sumBoxWeights = (boxes: PackageBox[]): number =>
  Number(
    (Array.isArray(boxes) ? boxes : []).reduce((sum, box) => {
      const safeBox = normalizePackageBox(box);
      return sum + safeBox.no_of_boxes * safeBox.per_box_weight_kg;
    }, 0).toFixed(3)
  );

export const getPackageModeLabel = (mode: PackageMode): string =>
  mode === PACKAGE_MODE.MULTI_PACKAGE_B2B ? "Multiple Package (B2B)" : "Single Package (B2C)";
