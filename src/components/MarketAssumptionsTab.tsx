import { InputSlider } from "./InputSlider";
import { InfoButton } from "./InfoButton";
import { CollapsibleSection } from "./CollapsibleSection";

interface MarketAssumptionsTabProps {
  growthRate: number;
  volatility: number;
  onGrowthRateChange: (value: number) => void;
  onVolatilityChange: (value: number) => void;
}

export const MarketAssumptionsTab = ({
  growthRate,
  volatility,
  onGrowthRateChange,
  onVolatilityChange,
}: MarketAssumptionsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-gray-800">
          Market Assumptions
        </h3>
        <InfoButton content="Nobody can predict the future, but we need to make assumptions about average market performance and volatility for the simulation." />
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
        min={5}
        max={30}
        step={1}
        formatter={(value) => `${value}%`}
      />

      <CollapsibleSection title="Volatility Guide">
        <div className="text-xs text-gray-700">
          <p>
            <span className="font-medium">5-10%:</span> Conservative (bonds,
            stable funds)
          </p>
          <p>
            <span className="font-medium">10-20%:</span> Moderate (balanced
            portfolios)
          </p>
          <p>
            <span className="font-medium">20-30%:</span> Aggressive
            (equity-heavy)
          </p>
        </div>
      </CollapsibleSection>
    </div>
  );
};
