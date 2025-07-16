import { SimulationDataPoint } from "../monte-carlo";

interface ProjectedOutcomesProps {
  simulations: SimulationDataPoint[][];
}

const calculateRunOutChance = (
  simulations: SimulationDataPoint[][],
): number => {
  if (!simulations.length) return 0;

  let runOutCount = 0;

  for (const simulation of simulations) {
    if (simulation.some((x) => x.age <= x.deathAge && x.potValue <= 0)) {
      runOutCount++;
    }
  }

  return Math.round((runOutCount / simulations.length) * 100);
};

export const ProjectedOutcomes = ({ simulations }: ProjectedOutcomesProps) => {
  const runOutPercentage = calculateRunOutChance(simulations);

  const getColorClass = (percentage: number): string => {
    if (percentage <= 10) return "text-green-600 bg-green-50 border-green-200";
    if (percentage <= 25) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h2 className="text-base font-semibold text-gray-800 mb-3">
        Retirement Risk
      </h2>

      <div
        className={`p-4 rounded-lg border-2 ${getColorClass(runOutPercentage)}`}
      >
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">{runOutPercentage}%</div>
          <div className="text-sm font-medium">
            Chance of running out of money before death
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-3 text-center">
        Based on 1,000 Monte Carlo simulations with mortality modeling
      </div>
    </div>
  );
};
