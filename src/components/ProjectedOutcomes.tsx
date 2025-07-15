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
    <div className="bg-gray-50 p-4 rounded-md mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Projected Outcomes (Based on 1,000 Simulations)</h2>

      {/* Quick Summary of All Parameters */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
        <div className="bg-white p-2 rounded border border-gray-200">
          <p className="font-medium text-gray-700">Current Situation</p>
          <p className="text-gray-600">Age {params.currentAge} → {params.retirementAge}</p>
          <p className="text-gray-600">Pot: {formatCurrency(params.currentPot)}</p>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <p className="font-medium text-gray-700">Market Assumptions</p>
          <p className="text-gray-600">Return: {params.growthRate}%</p>
          <p className="text-gray-600">Volatility: {params.volatility}%</p>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <p className="font-medium text-gray-700">Your Decisions</p>
          <p className="text-gray-600">Save: {formatCurrency(params.annualContribution)}/yr</p>
          <p className="text-gray-600">Draw: {formatCurrency(params.annualDrawdown)}/yr</p>
          {withdrawalRate > 0 && (
            <p className={`text-xs ${
              withdrawalRate <= 4 ? 'text-green-600' : 
              withdrawalRate <= 6 ? 'text-amber-600' : 
              'text-red-600'
            }`}>
              ({withdrawalRate.toFixed(1)}% withdrawal rate)
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Pot Value at Retirement ({params.retirementAge}):</span>
          <div className="mt-1">
            <p className="text-xs text-gray-500">5th percentile: <span className="font-semibold text-red-600">{formatCurrency(retirementStats.p5 || 0)}</span></p>
            <p className="text-xs text-gray-500">Median: <span className="font-semibold text-blue-600">{formatCurrency(retirementStats.p50 || 0)}</span></p>
            <p className="text-xs text-gray-500">95th percentile: <span className="font-semibold text-green-600">{formatCurrency(retirementStats.p95 || 0)}</span></p>
          </div>
        </div>
        <div>
          <span className="text-gray-600">Probability of Pot Lasting Until:</span>
          <div className="mt-1">
            {survivalRates.map(({ age, rate }) => (
              <p key={age} className="text-xs text-gray-500">
                Age {age}: <span className="font-semibold">{rate}%</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};