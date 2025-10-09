import { useMemo, useState } from "react";
import {
  calculateMortalityAdjustedPercentiles,
  runMonteCarloSimulation,
} from "./monte-carlo";
import { TabType } from "./types";
import { calculateStatePensionAmount } from "./state-pension";
import {
  CurrentSituationTab,
  ImportantNotes,
  MarketAssumptionsTab,
  PensionChart,
  ProjectedOutcomes,
  TabNavigation,
  YourDecisionsTab,
} from "./components";

const PensionCalculator = () => {
  const [currentAge, setCurrentAge] = useState(45);
  const [currentPot, setCurrentPot] = useState(250000);
  const [annualContribution, setAnnualContribution] = useState(10000);
  const [growthRate, setGrowthRate] = useState(4.5);
  const [volatility, setVolatility] = useState(15);
  const [retirementAge, setRetirementAge] = useState(65);
  const [annualDrawdown, setAnnualDrawdown] = useState(45000);
  const [sex, setSex] = useState<"male" | "female">("male");
  const [statePensionContributingYears, setStatePensionContributingYears] =
    useState(35);
  const [activeTab, setActiveTab] = useState<TabType>("decisions");

  const statePensionAmount = calculateStatePensionAmount(
    statePensionContributingYears,
  );

  const { percentileData, simulations } = useMemo(() => {
    const sims = runMonteCarloSimulation({
      startingAge: currentAge,
      startingPot: currentPot,
      annualContribution,
      expectedReturn: growthRate,
      volatility,
      retirementAge,
      annualDrawdown,
      sex,
      statePensionAmount,
      maxAge: 100,
      numSimulations: 1000,
    });

    const percentiles = calculateMortalityAdjustedPercentiles(
      sims,
      [5, 25, 50, 75, 95],
    );

    return {
      percentileData: percentiles,
      simulations: sims,
    };
  }, [
    currentAge,
    currentPot,
    annualContribution,
    growthRate,
    volatility,
    retirementAge,
    annualDrawdown,
    sex,
    statePensionAmount,
  ]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "current":
        return (
          <CurrentSituationTab
            currentAge={currentAge}
            currentPot={currentPot}
            sex={sex}
            statePensionContributingYears={statePensionContributingYears}
            onCurrentAgeChange={setCurrentAge}
            onCurrentPotChange={setCurrentPot}
            onSexChange={setSex}
            onStatePensionContributingYearsChange={
              setStatePensionContributingYears
            }
          />
        );
      case "uncertainty":
        return (
          <MarketAssumptionsTab
            growthRate={growthRate}
            volatility={volatility}
            onGrowthRateChange={setGrowthRate}
            onVolatilityChange={setVolatility}
          />
        );
      case "decisions":
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
    <div className="max-w-7xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Pension Calculator
      </h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Left Column - Controls */}
        <div className="space-y-4">
          <div>
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="bg-gray-50 p-4 rounded-lg">
              {renderTabContent()}
            </div>
          </div>

          <ProjectedOutcomes simulations={simulations} />
        </div>

        {/* Right Column - Chart */}
        <div className="space-y-4">
          <PensionChart percentileData={percentileData} />
          <ImportantNotes />
        </div>
      </div>
    </div>
  );
};

export default PensionCalculator;
