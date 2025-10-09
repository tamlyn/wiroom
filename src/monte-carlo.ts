import { calculatePensionProjection } from "./pension-calculations.ts";
import { generateRandomDeathAge, type Sex } from "./mortality";

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
  expectedReturn: number;
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
  expectedReturn,
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
    let projection = calculatePensionProjection({
      startingAge,
      startingPot,
      annualContribution,
      growthRate: expectedReturn,
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
  console.log(`minAge, maxAge`, minAge, maxAge);
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
