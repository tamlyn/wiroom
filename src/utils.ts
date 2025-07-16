export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export interface SurvivalRate {
  age: number;
  rate: number;
}

export const calculateSurvivalRates = (
  simulations: Array<Array<{ age: number; potValue: number }>>,
  testAges = [75, 85, 95],
): SurvivalRate[] => {
  return testAges.map((age) => {
    const survivingCount = simulations.filter((sim) =>
      sim.some((point) => point.age === age && point.potValue > 0),
    ).length;
    return {
      age,
      rate: Math.round((survivingCount / simulations.length) * 100),
    };
  });
};

export const pickFromNormalDistribution = (
  mean: number,
  stdDev: number,
): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + (stdDev / 100) * z0;
};
