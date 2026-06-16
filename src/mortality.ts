import { lifeExpectancyAtAge } from "./data/life-expectancy";
import {
  PERIOD_MORTALITY_BASE_YEAR,
  PERIOD_MORTALITY_END_YEAR,
  periodMortalityRatePer100k,
} from "./data/mortality-rates";

export type Sex = "male" | "female";

// Calendar year a person's stated age is taken to be "as of". Someone aged x is
// modelled as belonging to the cohort born REFERENCE_YEAR - x, then ageing
// through the projected calendar years — so they benefit from future mortality
// improvement. Tied to the 2020-based vintage of ./data/life-expectancy.ts and
// ./data/mortality-rates.ts; refresh all three together.
export const REFERENCE_YEAR = PERIOD_MORTALITY_BASE_YEAR;

export const getLifeExpectancy = (age: number, sex: Sex): number => {
  const data = lifeExpectancyAtAge[sex === "male" ? "men" : "women"];

  if (age < 0 || age >= data.length) {
    return 0;
  }

  return data[age];
};

// One-year mortality probability (qₓ) for a member of the given birth cohort at
// the given age: the projected period rate in calendar year (birthYear + age).
// Years outside the projection are clamped to its range; ages beyond the table
// are treated as certain death.
export const getAnnualDeathProbability = (
  age: number,
  sex: Sex,
  birthYear: number,
): number => {
  const rates = periodMortalityRatePer100k[sex === "male" ? "men" : "women"];

  if (age < 0) return 0;
  if (age >= rates.length) return 1;

  const calendarYear = Math.min(
    Math.max(birthYear + age, PERIOD_MORTALITY_BASE_YEAR),
    PERIOD_MORTALITY_END_YEAR,
  );

  return rates[age][calendarYear - PERIOD_MORTALITY_BASE_YEAR] / 100000;
};

export const generateRandomDeathAge = (
  currentAge: number,
  sex: Sex,
): number => {
  const birthYear = REFERENCE_YEAR - currentAge;
  let age = currentAge;

  while (age < 150) {
    const deathProbability = getAnnualDeathProbability(age, sex, birthYear);

    if (Math.random() < deathProbability) {
      return age;
    }

    age++;
  }

  return age;
};

export const getSurvivalProbability = (
  fromAge: number,
  toAge: number,
  sex: Sex,
  birthYear: number,
): number => {
  if (toAge <= fromAge) return 1;

  let survivalProb = 1;

  for (let age = fromAge; age < toAge; age++) {
    const deathProb = getAnnualDeathProbability(age, sex, birthYear);
    survivalProb *= 1 - deathProb;
  }

  return survivalProb;
};
