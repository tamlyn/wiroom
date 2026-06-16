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
  const [returnRange, setReturnRange] = useState<[number, number]>([4, 5]);
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
      returnRange,
      volatility,
      retirementAge,
      annualDrawdown,
      sex,
      statePensionAmount,
      maxAge: 100,
      numSimulations: 10000,
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
    returnRange,
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
            returnRange={returnRange}
            volatility={volatility}
            onReturnRangeChange={setReturnRange}
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Pension Calculator
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Model your retirement outlook with Monte Carlo simulation.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column - Inputs & reference */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
              <div className="p-5">{renderTabContent()}</div>
            </div>

            <ImportantNotes />
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <PensionChart percentileData={percentileData} />
            <ProjectedOutcomes simulations={simulations} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PensionCalculator;
