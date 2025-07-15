import { useState, useMemo } from 'react';
import { runMonteCarloSimulation, calculatePercentiles } from './monte-carlo';
import { calculateSurvivalRates } from './utils';
import { TabType, PensionParams } from './types';
import {
  TabNavigation,
  CurrentSituationTab,
  MarketAssumptionsTab,
  YourDecisionsTab,
  ProjectedOutcomes,
  PensionChart,
  ImportantNotes
} from './components';

const PensionCalculator = () => {
  const [currentAge, setCurrentAge] = useState(30);
  const [currentPot, setCurrentPot] = useState(50000);
  const [annualContribution, setAnnualContribution] = useState(10000);
  const [growthRate, setGrowthRate] = useState(5);
  const [volatility, setVolatility] = useState(15);
  const [retirementAge, setRetirementAge] = useState(65);
  const [annualDrawdown, setAnnualDrawdown] = useState(30000);
  const [activeTab, setActiveTab] = useState<TabType>('decisions');

  const pensionParams: PensionParams = {
    currentAge,
    currentPot,
    annualContribution,
    growthRate,
    volatility,
    retirementAge,
    annualDrawdown
  };

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

  const survivalRates = useMemo(() => {
    return calculateSurvivalRates(simulations);
  }, [simulations]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'current':
        return (
          <CurrentSituationTab
            currentAge={currentAge}
            currentPot={currentPot}
            onCurrentAgeChange={setCurrentAge}
            onCurrentPotChange={setCurrentPot}
          />
        );
      case 'uncertainty':
        return (
          <MarketAssumptionsTab
            growthRate={growthRate}
            volatility={volatility}
            onGrowthRateChange={setGrowthRate}
            onVolatilityChange={setVolatility}
          />
        );
      case 'decisions':
        return (
          <YourDecisionsTab
            currentAge={currentAge}
            annualContribution={annualContribution}
            retirementAge={retirementAge}
            annualDrawdown={annualDrawdown}
            onAnnualContributionChange={setAnnualContribution}
            onRetirementAgeChange={setRetirementAge}
            onAnnualDrawdownChange={setAnnualDrawdown}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Pension Calculator with Uncertainty Modeling</h1>

      <div className="mb-8">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="bg-gray-50 p-6 rounded-lg transition-all duration-200">
          {renderTabContent()}
        </div>
      </div>

      <ProjectedOutcomes
        params={pensionParams}
        percentileData={percentileData}
        survivalRates={survivalRates}
      />

      <PensionChart percentileData={percentileData} />

      <ImportantNotes />
    </div>
  );
};

export default PensionCalculator;