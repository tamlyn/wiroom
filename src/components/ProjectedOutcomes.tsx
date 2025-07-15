import { PercentileDataPoint, SurvivalRate, PensionParams } from '../types';
import { formatCurrency } from '../utils';

interface ProjectedOutcomesProps {
  params: PensionParams;
  percentileData: PercentileDataPoint[];
  survivalRates: SurvivalRate[];
}

export const ProjectedOutcomes = ({
  params,
  percentileData,
  survivalRates
}: ProjectedOutcomesProps) => {
  const retirementStats = percentileData.find(d => d.age === params.retirementAge) || { p5: 0, p50: 0, p95: 0 };
  const withdrawalRate = retirementStats.p50 ? (params.annualDrawdown / retirementStats.p50) * 100 : 0;

  return (
    <div className="bg-gray-50 p-3 rounded-md">
      <h2 className="text-base font-semibold text-gray-800 mb-2">Projected Outcomes</h2>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div>
          <p className="font-medium text-gray-700 mb-1">At Retirement ({params.retirementAge}):</p>
          <div className="space-y-0.5">
            <p>Median: <span className="font-semibold text-blue-600">{formatCurrency(retirementStats.p50 || 0)}</span></p>
            <p>Range: <span className="text-red-600">{formatCurrency(retirementStats.p5 || 0)}</span> - <span className="text-green-600">{formatCurrency(retirementStats.p95 || 0)}</span></p>
            {withdrawalRate > 0 && (
              <p className={withdrawalRate <= 4 ? 'text-green-600' : withdrawalRate <= 6 ? 'text-amber-600' : 'text-red-600'}>
                {withdrawalRate.toFixed(1)}% withdrawal rate
              </p>
            )}
          </div>
        </div>
        <div>
          <p className="font-medium text-gray-700 mb-1">Survival Probability:</p>
          <div className="space-y-0.5">
            {survivalRates.map(({ age, rate }) => (
              <p key={age}>Age {age}: <span className="font-semibold">{rate}%</span></p>
            ))}
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 flex items-center gap-1">
        <span>Based on 1,000 Monte Carlo simulations</span>
        <span>•</span>
        <span>Age {params.currentAge} → {params.retirementAge}</span>
        <span>•</span>
        <span>{params.growthRate}% return, {params.volatility}% volatility</span>
      </div>
    </div>
  );
};