export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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
  testAges = [75, 85, 95]
): SurvivalRate[] => {
  return testAges.map(age => {
    const survivingCount = simulations.filter(sim =>
      sim.some(point => point.age === age && point.potValue > 0)
    ).length;
    return {
      age,
      rate: Math.round((survivingCount / simulations.length) * 100)
    };
  });
};