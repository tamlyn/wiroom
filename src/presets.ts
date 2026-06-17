export interface AssetPreset {
  name: string;
  returnRange: [number, number];
  volatility: number;
}

export const ASSET_PRESETS: AssetPreset[] = [
  { name: "Cash", returnRange: [-0.5, 0.5], volatility: 0 },
  { name: "Bonds", returnRange: [1.5, 2.5], volatility: 5 },
  { name: "60 / 40", returnRange: [3, 4], volatility: 11 },
  { name: "Equity", returnRange: [4, 6], volatility: 17 },
];

// Balanced is the sensible starting assumption, and gives the Markets tab an
// active preset on first load.
export const DEFAULT_ASSET_PRESET = ASSET_PRESETS[2];

export const matchAssetPreset = (
  returnRange: [number, number],
  volatility: number,
): AssetPreset | undefined =>
  ASSET_PRESETS.find(
    (preset) =>
      preset.returnRange[0] === returnRange[0] &&
      preset.returnRange[1] === returnRange[1] &&
      preset.volatility === volatility,
  );

export interface LivingStandard {
  name: string;
  single: number;
}

// UK Retirement Living Standards (single person), 2025 figures.
export const LIVING_STANDARDS: LivingStandard[] = [
  { name: "Minimum", single: 13400 },
  { name: "Moderate", single: 31700 },
  { name: "Comfortable", single: 43900 },
];

export const DEFAULT_LIVING_STANDARD = LIVING_STANDARDS[1]; // Moderate

export const matchLivingStandard = (
  annualDrawdown: number,
): LivingStandard | undefined =>
  LIVING_STANDARDS.find((standard) => standard.single === annualDrawdown);
