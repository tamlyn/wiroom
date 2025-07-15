import { InputSlider } from './InputSlider';

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
  onVolatilityChange
}: MarketAssumptionsTabProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Market Assumptions</h3>
      <p className="text-sm text-gray-600 mb-4">Nobody can predict the future, but we need to make some assumptions about market performance.</p>

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

      <div className="bg-blue-50 p-3 rounded-md text-sm">
        <p className="font-semibold text-blue-900">Volatility Guide:</p>
        <p className="text-blue-800 mt-1">
          <span className="font-medium">5-10%:</span> Conservative (bonds, stable funds)<br/>
          <span className="font-medium">10-20%:</span> Moderate (balanced portfolios)<br/>
          <span className="font-medium">20-30%:</span> Aggressive (equity-heavy)
        </p>
      </div>
    </div>
  );
};