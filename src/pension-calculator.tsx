import { useMemo, useState } from "react";
import {
  calculateMortalityAdjustedPercentiles,
  runMonteCarloSimulation,
} from "./monte-carlo";
import { TabType } from "./types";
import { calculateStatePensionAmount } from "./state-pension";
import { DEFAULT_ASSET_PRESET, DEFAULT_LIVING_STANDARD } from "./presets";
import {
  CurrentSituationTab,
  MarketAssumptionsTab,
  ProjectionPanel,
  TabNavigation,
  YourDecisionsTab,
} from "./components";

const PensionCalculator = () => {
  const [currentAge, setCurrentAge] = useState(45);
  const [currentPot, setCurrentPot] = useState(250000);
  const [annualContribution, setAnnualContribution] = useState(10000);
  const [returnRange, setReturnRange] = useState<[number, number]>(
    DEFAULT_ASSET_PRESET.returnRange,
  );
  const [volatility, setVolatility] = useState(DEFAULT_ASSET_PRESET.volatility);
  const [retirementAge, setRetirementAge] = useState(65);
  const [annualDrawdown, setAnnualDrawdown] = useState(
    DEFAULT_LIVING_STANDARD.single,
  );
  const [sex, setSex] = useState<"male" | "female">("male");
  const [statePensionContributingYears, setStatePensionContributingYears] =
    useState(35);
  const [activeTab, setActiveTab] = useState<TabType>("current");

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
    <div className="min-h-screen bg-canvas font-sans text-ink px-4 py-8 sm:px-8 lg:px-[56px] lg:py-[60px]">
      <div
        className="max-w-[1280px] mx-auto bg-card border border-line-strong"
        style={{ boxShadow: "0 1px 2px rgba(21,24,30,0.04)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[40px] py-[20px] border-b border-line">
          <div className="flex items-center gap-[13px]">
            <div className="w-[34px] h-[34px] bg-ink flex items-center justify-center shrink-0">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 20h18M5 20V9l7-5 7 5v11M9 20v-6h6v6"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="text-[18px] font-extrabold tracking-[0.02em]">
                WIROOM
              </div>
              <div className="text-[12px] text-muted -mt-px">
                Will I run out of money?
              </div>
            </div>
          </div>
          <span className="text-[12.5px] text-muted">
            Figures in today's money
          </span>
        </div>

        {/* Body: inputs (left) + persistent outlook (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[500px_1fr]">
          <div className="border-b lg:border-b-0 lg:border-r border-line">
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="px-[40px] py-[34px]">{renderTabContent()}</div>
          </div>

          <ProjectionPanel
            simulations={simulations}
            percentileData={percentileData}
            currentAge={currentAge}
            retirementAge={retirementAge}
          />
        </div>
      </div>
    </div>
  );
};

export default PensionCalculator;
