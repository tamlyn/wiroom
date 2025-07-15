import { InputSlider } from './InputSlider';
import { formatCurrency } from '../utils';

interface YourDecisionsTabProps {
  currentAge: number;
  annualContribution: number;
  retirementAge: number;
  annualDrawdown: number;
  onAnnualContributionChange: (value: number) => void;
  onRetirementAgeChange: (value: number) => void;
  onAnnualDrawdownChange: (value: number) => void;
}

export const YourDecisionsTab = ({
  currentAge,
  annualContribution,
  retirementAge,
  annualDrawdown,
  onAnnualContributionChange,
  onRetirementAgeChange,
  onAnnualDrawdownChange
}: YourDecisionsTabProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Decisions</h3>
      <p className="text-sm text-gray-600 mb-4">These are the factors you can control to improve your retirement outcomes.</p>

      <InputSlider
        label="Annual Contribution"
        value={annualContribution}
        onChange={onAnnualContributionChange}
        min={0}
        max={50000}
        step={500}
        formatter={(value) => formatCurrency(value)}
        description={`($${Math.round(annualContribution / 12).toLocaleString()} per month)`}
      />

      <InputSlider
        label="Retirement Age"
        value={retirementAge}
        onChange={onRetirementAgeChange}
        min={currentAge + 1}
        max={100}
        formatter={(value) => value.toString()}
        description={`(${retirementAge - currentAge} years from now)`}
      />

      <InputSlider
        label="Annual Drawdown in Retirement"
        value={annualDrawdown}
        onChange={onAnnualDrawdownChange}
        min={0}
        max={100000}
        step={1000}
        formatter={(value) => formatCurrency(value)}
        description={`($${Math.round(annualDrawdown / 12).toLocaleString()} per month)`}
      />

      <div className="bg-green-50 p-3 rounded-md text-sm">
        <p className="font-semibold text-green-900">Optimization Tips:</p>
        <p className="text-green-800 mt-1">
          • Increasing contributions by even $100/month can significantly impact your retirement<br/>
          • Delaying retirement by 1-2 years can dramatically improve outcomes<br/>
          • Consider the 4% rule: annual drawdown of 4% of initial pot often lasts 30+ years<br/>
          • Withdrawal rate colors: <span className="text-green-600">green ≤4%</span>, <span className="text-amber-600">amber 4-6%</span>, <span className="text-red-600">red &gt;6%</span>
        </p>
      </div>
    </div>
  );
};