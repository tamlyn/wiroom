import { lifeExpectancyAtAge } from "./data/life-expectancy";

export type Sex = "male" | "female";

export const getLifeExpectancy = (age: number, sex: Sex): number => {
  const data = lifeExpectancyAtAge[sex === "male" ? "men" : "women"];

  if (age < 0 || age >= data.length) {
    return 0;
  }

  return data[age];
};

export const lifeExpectancyToDeathProbability = (
  lifeExpectancy: number,
): number => {
  if (lifeExpectancy <= 0) return 1;
  return 1 - Math.exp(-1 / lifeExpectancy);
};

export const getAnnualDeathProbability = (age: number, sex: Sex): number => {
  const lifeExpectancy = getLifeExpectancy(age, sex);
  return lifeExpectancyToDeathProbability(lifeExpectancy);
};

export const generateRandomDeathAge = (
  currentAge: number,
  sex: Sex,
): number => {
  let age = currentAge;

  while (age < 150) {
    const deathProbability = getAnnualDeathProbability(age, sex);

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
): number => {
  if (toAge <= fromAge) return 1;

  let survivalProb = 1;

  for (let age = fromAge; age < toAge; age++) {
    const deathProb = getAnnualDeathProbability(age, sex);
    survivalProb *= 1 - deathProb;
  }

  return survivalProb;
};
