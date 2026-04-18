export const PACKAGE_MODE = {
  SINGLE_PACKAGE_B2C: "SINGLE_PACKAGE_B2C",
  MULTI_PACKAGE_B2B: "MULTI_PACKAGE_B2B"
} as const;

export type PackageMode = (typeof PACKAGE_MODE)[keyof typeof PACKAGE_MODE];

export type PackageBox = {
  id: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
};

export const B2B_WEIGHT_THRESHOLD_KG = 25;

export const derivePackageMode = (boxes: PackageBox[], totalWeightKg: number): PackageMode => {
  if (boxes.length > 1 || totalWeightKg > B2B_WEIGHT_THRESHOLD_KG) {
    return PACKAGE_MODE.MULTI_PACKAGE_B2B;
  }

  return PACKAGE_MODE.SINGLE_PACKAGE_B2C;
};

export const normalizePackageBoxes = (boxes: PackageBox[], packageMode: PackageMode): PackageBox[] => {
  if (packageMode === PACKAGE_MODE.SINGLE_PACKAGE_B2C) {
    const firstBox = boxes[0];
    return firstBox ? [firstBox] : [];
  }

  return boxes;
};

export const sumBoxWeights = (boxes: PackageBox[]): number =>
  Number(boxes.reduce((sum, box) => sum + Number(box.weight_kg || 0), 0).toFixed(3));

export const getPackageModeLabel = (mode: PackageMode): string =>
  mode === PACKAGE_MODE.MULTI_PACKAGE_B2B ? "Multiple Package (B2B)" : "Single Package (B2C)";
