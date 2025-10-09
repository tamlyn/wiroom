import { calculatePensionProjection } from "./pension-calculations.ts";
import { generateRandomDeathAge, type Sex } from "./mortality";
import { pickFromNormalDistribution } from "./utils";

export interface SimulationDataPoint {
  age: number;
  potValue: number;
  deathAge: number;
}

export interface PercentileDataPoint {
  age: number;
  [key: string]: number;
}

interface SimulationInput {
  startingAge: number;
  startingPot: number;
  annualContribution: number;
  returnRange: [number, number];
  volatility: number;
  retirementAge: number;
  annualDrawdown: number;
  sex: Sex;
  statePensionAmount: number;
  maxAge?: number;
  numSimulations?: number;
}

export const runMonteCarloSimulation = ({
  startingAge,
  startingPot,
  annualContribution,
  returnRange,
  volatility,
  retirementAge,
  annualDrawdown,
  sex,
  statePensionAmount,
  maxAge = 100,
  numSimulations = 1000,
}: SimulationInput): SimulationDataPoint[][] => {
  const simulations: SimulationDataPoint[][] = [];

  for (let sim = 0; sim < numSimulations; sim++) {
    const deathAge = generateRandomDeathAge(startingAge, sex);

    // Sample a return from the range using normal distribution
    // Treat the range as the mean ± 2 standard deviations (~95% confidence interval)
    const mean = (returnRange[0] + returnRange[1]) / 2;
    const stdDev = (returnRange[1] - returnRange[0]) / 4;
    const sampledReturn = pickFromNormalDistribution(mean, stdDev * 100);

    let projection = calculatePensionProjection({
      startingAge,
      startingPot,
      annualContribution,
      growthRate: sampledReturn,
      volatility,
      retirementAge,
      annualDrawdown,
      statePensionAmount,
      maxAge,
      deathAge,
    });
    simulations.push(projection);
  }

  return simulations;
};

export const calculateMortalityAdjustedPercentiles = (
  simulations: SimulationDataPoint[][],
  percentiles = [5, 25, 50, 75, 95],
): PercentileDataPoint[] => {
  if (!simulations.length) return [];

  const maxAge = Math.max(
    ...simulations.map((sim) => sim[sim.length - 1]?.age || 0),
  );
  const minAge = simulations[0][0]?.age || 0;

  const result: PercentileDataPoint[] = [];

  for (let age = minAge; age <= maxAge; age++) {
    const valuesAtAge = simulations
      .map((sim) => sim.find((point) => point.age === age)?.potValue || 0)
      .sort((a, b) => a - b);

    const percentileValues: PercentileDataPoint = { age };
    percentiles.forEach((p) => {
      const index = Math.floor((p / 100) * (valuesAtAge.length - 1));
      percentileValues[`p${p}`] = valuesAtAge[index];
    });

    result.push(percentileValues);
  }

  return result;
};
