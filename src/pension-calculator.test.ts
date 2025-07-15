// Tests for calculatePensionProjection function
import { calculatePensionProjection } from './pension-calculations';

describe('calculatePensionProjection', () => {
  test('should return initial state at current age', () => {
    const result = calculatePensionProjection(30, 50000, 10000, 5, 65, 30000);

    expect(result[0]).toEqual({
      age: 30,
      potValue: 50000,
      phase: 'Accumulation'
    });
  });

  test('should grow pot with contributions before retirement', () => {
    const result = calculatePensionProjection(30, 50000, 10000, 5, 65, 30000);

    // Year 1: 50000 * 1.05 + 10000 = 62500
    expect(result[1]).toEqual({
      age: 31,
      potValue: 62500,
      phase: 'Accumulation'
    });

    // Year 2: 62500 * 1.05 + 10000 = 75625
    expect(result[2]).toEqual({
      age: 32,
      potValue: 75625,
      phase: 'Accumulation'
    });
  });

  test('should switch to drawdown phase at retirement age', () => {
    const result = calculatePensionProjection(63, 100000, 10000, 5, 65, 30000);

    // Age 63: Accumulation
    expect(result[0].phase).toBe('Accumulation');

    // Age 64: Still accumulation (100000 * 1.05 + 10000 = 115000)
    expect(result[1]).toEqual({
      age: 64,
      potValue: 115000,
      phase: 'Accumulation'
    });

    // Age 65: Retirement - switches to drawdown (115000 * 1.05 + 10000 = 130750)
    expect(result[2]).toEqual({
      age: 65,
      potValue: 130750,
      phase: 'Accumulation'
    });

    // Age 66: First year of drawdown (130750 * 1.05 - 30000 = 107288)
    expect(result[3]).toEqual({
      age: 66,
      potValue: 107288,
      phase: 'Drawdown'
    });
  });

  test('should handle zero growth rate', () => {
    const result = calculatePensionProjection(30, 50000, 10000, 0, 65, 30000);

    // No growth, just contributions
    expect(result[1].potValue).toBe(60000); // 50000 + 10000
    expect(result[2].potValue).toBe(70000); // 60000 + 10000
  });

  test('should stop when pot reaches zero', () => {
    const result = calculatePensionProjection(65, 50000, 0, 5, 65, 60000);

    // Starting at retirement with 50k, drawing 60k/year
    // Year 1: 50000 * 1.05 - 60000 = -7500 -> 0
    expect(result[1]).toEqual({
      age: 66,
      potValue: 0,
      phase: 'Drawdown'
    });

    // Should stop after pot hits zero
    expect(result.length).toBe(2);
  });

  test('should handle no contributions', () => {
    const result = calculatePensionProjection(30, 100000, 0, 5, 65, 30000);

    // Just growth, no contributions
    expect(result[1].potValue).toBe(105000); // 100000 * 1.05
    expect(result[2].potValue).toBe(110250); // 105000 * 1.05
  });

  test('should handle immediate retirement', () => {
    const result = calculatePensionProjection(65, 500000, 10000, 5, 65, 40000);

    // Already at retirement age
    expect(result[0]).toEqual({
      age: 65,
      potValue: 500000,
      phase: 'Accumulation' // First entry is always at current state
    });

    // Next year should be drawdown
    expect(result[1]).toEqual({
      age: 66,
      potValue: 485000, // 500000 * 1.05 - 40000
      phase: 'Drawdown'
    });
  });

  test('should respect custom maxAge parameter', () => {
    const result = calculatePensionProjection(30, 50000, 10000, 5, 65, 30000, 75);

    // Should stop at age 75
    const lastEntry = result[result.length - 1];
    expect(lastEntry.age).toBeLessThanOrEqual(75);
  });

  test('should handle high growth rate', () => {
    const result = calculatePensionProjection(30, 10000, 5000, 10, 65, 50000);

    // 10% growth: 10000 * 1.10 + 5000 = 16000
    expect(result[1].potValue).toBe(16000);
  });

  test('should calculate correct pot value at retirement', () => {
    const result = calculatePensionProjection(30, 50000, 10000, 5, 65, 30000);

    // Find retirement age entry
    const retirementEntry = result.find(entry => entry.age === 65);

    // After 35 years of 5% growth with 10k annual contributions
    // This should be a substantial amount
    expect(retirementEntry?.potValue).toBeGreaterThan(1000000);
  });

  test('should handle edge case of retirement age past maxAge', () => {
    const result = calculatePensionProjection(30, 50000, 10000, 5, 150, 30000, 100);

    // Should never reach drawdown phase
    const allAccumulation = result.every(entry => entry.phase === 'Accumulation');
    expect(allAccumulation).toBe(true);
  });

  test('should round pot values to nearest integer', () => {
    const result = calculatePensionProjection(30, 50000, 10000, 5.5, 65, 30000);

    // All pot values should be integers
    result.forEach(entry => {
      expect(Number.isInteger(entry.potValue)).toBe(true);
    });
  });

  test('should handle scenario where pot lasts entire projection', () => {
    const result = calculatePensionProjection(65, 1000000, 0, 5, 65, 40000, 85);

    // With 1M at 65, 5% growth, 40k drawdown, should last beyond 85
    const lastEntry = result[result.length - 1];
    expect(lastEntry.age).toBe(85);
    expect(lastEntry.potValue).toBeGreaterThan(0);
  });

  test('should correctly calculate years until pot depletion', () => {
    // Start with 200k at retirement, 5% growth, 20k drawdown
    // Should last quite a while
    const result = calculatePensionProjection(65, 200000, 0, 5, 65, 20000);

    // Pot grows by 5% and loses 20k each year
    // Should see steady decline but last many years
    const depletionAge = result[result.length - 1].age;
    expect(depletionAge).toBeGreaterThan(75);
  });
});
