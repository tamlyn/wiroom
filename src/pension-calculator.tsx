import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { runMonteCarloSimulation, calculatePercentiles } from './monte-carlo';
import { formatCurrency, calculateSurvivalRates } from './utils';

const PensionCalculator = () => {
  const [currentAge, setCurrentAge] = useState(30);
  const [currentPot, setCurrentPot] = useState(50000);
  const [annualContribution, setAnnualContribution] = useState(10000);
  const [growthRate, setGrowthRate] = useState(5);
  const [volatility, setVolatility] = useState(15);
  const [retirementAge, setRetirementAge] = useState(65);
  const [annualDrawdown, setAnnualDrawdown] = useState(30000);
  const [activeTab, setActiveTab] = useState('decisions'); // Start with the actionable tab

  const { percentileData, simulations } = useMemo(() => {
    const sims = runMonteCarloSimulation(
      currentAge,
      currentPot,
      annualContribution,
      growthRate,
      volatility,
      retirementAge,
      annualDrawdown,
      100,
      1000
    );

    const percentiles = calculatePercentiles(sims, [5, 25, 50, 75, 95]);

    return {
      percentileData: percentiles,
      simulations: sims
    };
  }, [currentAge, currentPot, annualContribution, growthRate, volatility, retirementAge, annualDrawdown]);


  // Calculate key statistics
  const retirementStats = percentileData.find(d => d.age === retirementAge) || { p5: 0, p50: 0, p95: 0 };
  const withdrawalRate = retirementStats.p50 ? (annualDrawdown / retirementStats.p50) * 100 : 0;
  const survivalRates = useMemo(() => {
    return calculateSurvivalRates(simulations);
  }, [simulations]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Pension Calculator with Uncertainty Modeling</h1>

      <div className="mb-8">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === 'current'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            Current Situation
          </button>
          <button
            onClick={() => setActiveTab('uncertainty')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === 'uncertainty'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            Market Assumptions
          </button>
          <button
            onClick={() => setActiveTab('decisions')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === 'decisions'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            Your Decisions
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-50 p-6 rounded-lg transition-all duration-200">
          {activeTab === 'current' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Current Situation</h3>
              <p className="text-sm text-gray-600 mb-4">These are the facts about where you are today.</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Age: <span className="font-bold text-blue-600">{currentAge}</span>
                </label>
                <input
                  type="range"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  min="18"
                  max="100"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>18</span>
                  <span>100</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Pension Pot: <span className="font-bold text-blue-600">{formatCurrency(currentPot)}</span>
                </label>
                <input
                  type="range"
                  value={currentPot}
                  onChange={(e) => setCurrentPot(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  min="0"
                  max="500000"
                  step="5000"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$0</span>
                  <span>$500k</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'uncertainty' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Market Assumptions</h3>
              <p className="text-sm text-gray-600 mb-4">Nobody can predict the future, but we need to make some assumptions about market performance.</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Annual Return: <span className="font-bold text-blue-600">{growthRate}%</span>
                </label>
                <input
                  type="range"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  min="0"
                  max="15"
                  step="0.5"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>15%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Market Volatility (Standard Deviation): <span className="font-bold text-blue-600">{volatility}%</span>
                </label>
                <input
                  type="range"
                  value={volatility}
                  onChange={(e) => setVolatility(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  min="5"
                  max="30"
                  step="1"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5%</span>
                  <span>30%</span>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-md text-sm">
                <p className="font-semibold text-blue-900">Volatility Guide:</p>
                <p className="text-blue-800 mt-1">
                  <span className="font-medium">5-10%:</span> Conservative (bonds, stable funds)<br/>
                  <span className="font-medium">10-20%:</span> Moderate (balanced portfolios)<br/>
                  <span className="font-medium">20-30%:</span> Aggressive (equity-heavy)
                </p>
              </div>
            </div>
          )}

          {activeTab === 'decisions' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Decisions</h3>
              <p className="text-sm text-gray-600 mb-4">These are the factors you can control to improve your retirement outcomes.</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Contribution: <span className="font-bold text-blue-600">{formatCurrency(annualContribution)}</span>
                  <span className="text-xs text-gray-500 ml-2">(${Math.round(annualContribution / 12).toLocaleString()} per month)</span>
                </label>
                <input
                  type="range"
                  value={annualContribution}
                  onChange={(e) => setAnnualContribution(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  min="0"
                  max="50000"
                  step="500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$0</span>
                  <span>$50k</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retirement Age: <span className="font-bold text-blue-600">{retirementAge}</span>
                  <span className="text-xs text-gray-500 ml-2">({retirementAge - currentAge} years from now)</span>
                </label>
                <input
                  type="range"
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  min={currentAge + 1}
                  max="100"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{currentAge + 1}</span>
                  <span>100</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Drawdown in Retirement: <span className="font-bold text-blue-600">{formatCurrency(annualDrawdown)}</span>
                  <span className="text-xs text-gray-500 ml-2">(${Math.round(annualDrawdown / 12).toLocaleString()} per month)</span>
                </label>
                <input
                  type="range"
                  value={annualDrawdown}
                  onChange={(e) => setAnnualDrawdown(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  min="0"
                  max="100000"
                  step="1000"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$0</span>
                  <span>$100k</span>
                </div>
              </div>

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
          )}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Projected Outcomes (Based on 1,000 Simulations)</h2>

        {/* Quick Summary of All Parameters */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
          <div className="bg-white p-2 rounded border border-gray-200">
            <p className="font-medium text-gray-700">Current Situation</p>
            <p className="text-gray-600">Age {currentAge} → {retirementAge}</p>
            <p className="text-gray-600">Pot: {formatCurrency(currentPot)}</p>
          </div>
          <div className="bg-white p-2 rounded border border-gray-200">
            <p className="font-medium text-gray-700">Market Assumptions</p>
            <p className="text-gray-600">Return: {growthRate}%</p>
            <p className="text-gray-600">Volatility: {volatility}%</p>
          </div>
          <div className="bg-white p-2 rounded border border-gray-200">
            <p className="font-medium text-gray-700">Your Decisions</p>
            <p className="text-gray-600">Save: {formatCurrency(annualContribution)}/yr</p>
            <p className="text-gray-600">Draw: {formatCurrency(annualDrawdown)}/yr</p>
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
            <span className="text-gray-600">Pot Value at Retirement ({retirementAge}):</span>
            <div className="mt-1">
              <p className="text-xs text-gray-500">5th percentile: <span className="font-semibold text-red-600">{formatCurrency(retirementStats.p5)}</span></p>
              <p className="text-xs text-gray-500">Median: <span className="font-semibold text-blue-600">{formatCurrency(retirementStats.p50)}</span></p>
              <p className="text-xs text-gray-500">95th percentile: <span className="font-semibold text-green-600">{formatCurrency(retirementStats.p95)}</span></p>
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

      <div className="bg-white p-4 rounded-md shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Projected Pension Pot Value Over Time (with Uncertainty)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={percentileData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="age"
              label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              label={{ value: 'Pot Value', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value as number)}
              labelFormatter={(label) => `Age: ${label}`}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                      <p className="font-semibold">Age: {label}</p>
                      <p className="text-xs text-green-600">95th percentile: {formatCurrency(payload[0]?.payload?.p95 || 0)}</p>
                      <p className="text-xs text-blue-600">75th percentile: {formatCurrency(payload[0]?.payload?.p75 || 0)}</p>
                      <p className="text-xs font-bold text-blue-800">Median: {formatCurrency(payload[0]?.payload?.p50 || 0)}</p>
                      <p className="text-xs text-orange-600">25th percentile: {formatCurrency(payload[0]?.payload?.p25 || 0)}</p>
                      <p className="text-xs text-red-600">5th percentile: {formatCurrency(payload[0]?.payload?.p5 || 0)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />

            {/* 95th percentile - best case */}
            <Line
              type="monotone"
              dataKey="p95"
              stroke="#10b981"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              name="95th percentile (best case)"
              dot={false}
            />

            {/* 75th percentile */}
            <Line
              type="monotone"
              dataKey="p75"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="3 3"
              name="75th percentile"
              dot={false}
            />

            {/* Median - 50th percentile */}
            <Line
              type="monotone"
              dataKey="p50"
              stroke="#1e40af"
              strokeWidth={3}
              name="Median (expected)"
              dot={false}
            />

            {/* 25th percentile */}
            <Line
              type="monotone"
              dataKey="p25"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="3 3"
              name="25th percentile"
              dot={false}
            />

            {/* 5th percentile - worst case */}
            <Line
              type="monotone"
              dataKey="p5"
              stroke="#dc2626"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              name="5th percentile (worst case)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 text-sm text-gray-600">
          <p className="font-semibold">How to read this chart:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>The <span className="font-bold text-blue-800">thick blue line</span> shows the median (expected) outcome</li>
            <li>The <span className="font-semibold text-green-600">green dashed line</span> (95th percentile) shows optimistic scenarios - only 5% of outcomes are better</li>
            <li>The <span className="font-semibold text-red-600">red dashed line</span> (5th percentile) shows pessimistic scenarios - only 5% of outcomes are worse</li>
            <li>The <span className="font-semibold text-blue-600">blue</span> and <span className="font-semibold text-orange-600">orange</span> dashed lines show the 25th and 75th percentiles</li>
            <li>Wider spread between lines = more uncertainty about future values</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p className="font-semibold">Important Notes:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>This projection uses Monte Carlo simulation with 1,000 scenarios to model market uncertainty</li>
          <li>Returns are assumed to follow a normal distribution with your specified mean and volatility</li>
          <li>Real-world returns may have different distributions (fat tails, correlation with economic cycles)</li>
          <li>Inflation is not factored into these calculations</li>
          <li>Past performance does not guarantee future results</li>
          <li>Consult a financial advisor for personalized retirement planning</li>
        </ul>
      </div>
    </div>
  );
};

export default PensionCalculator;
