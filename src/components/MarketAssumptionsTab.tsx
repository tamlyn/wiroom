import { InputSlider } from "./InputSlider";
import { InfoButton } from "./InfoButton";
import { CollapsibleSection } from "./CollapsibleSection";

interface MarketAssumptionsTabProps {
  growthRate: number;
  volatility: number;
  onGrowthRateChange: (value: number) => void;
  onVolatilityChange: (value: number) => void;
}

const ASSET_PRESETS = [
  { name: "Cash", return: 0, volatility: 0 },
  { name: "Bonds", return: 2, volatility: 5 },
  { name: "60/40", return: 4.5, volatility: 11 },
  { name: "Equity", return: 6, volatility: 17 },
];

export const MarketAssumptionsTab = ({
  growthRate,
  volatility,
  onGrowthRateChange,
  onVolatilityChange,
}: MarketAssumptionsTabProps) => {
  const applyPreset = (preset: (typeof ASSET_PRESETS)[0]) => {
    onGrowthRateChange(preset.return);
    onVolatilityChange(preset.volatility);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-gray-800">
          Market Assumptions
        </h3>
        <InfoButton content="Nobody can predict the future, but we need to make assumptions about average market performance and volatility for the simulation." />
      </div>

      <div>
        <p className="text-xs text-gray-600 mb-2">Asset Allocation Presets:</p>
        <div className="flex gap-2 flex-wrap">
          {ASSET_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <InputSlider
        label="Expected Annual Return"
        value={growthRate}
        onChange={onGrowthRateChange}
        min={0}
        max={15}
        step={0.5}
        formatter={(value) => `${value}%`}
      />

      <InputSlider
        label="Market Volatility (Standard Deviation)"
        value={volatility}
        onChange={onVolatilityChange}
        min={0}
        max={30}
        step={1}
        formatter={(value) => `${value}%`}
      />

      <CollapsibleSection title="About These Assumptions">
        <div className="text-xs text-gray-700 space-y-1">
          <p className="font-medium">
            Returns and volatility are real (after-inflation) figures.
          </p>
          <p>
            These presets are based on long-term historical data from developed
            markets. Actual results will vary, and past performance doesn't
            guarantee future returns.
          </p>
          <p>
            <span className="font-medium">Volatility guide:</span> Cash (0%),
            Bonds (4-6%), Balanced (10-12%), Equity (15-20%)
          </p>
        </div>
      </CollapsibleSection>
    </div>
  );
};
