# Plan 006: Replace the broken mortality model with a real qₓ table

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the next
> step. If anything in the "STOP conditions" section occurs, stop and report —
> do not improvise. **This plan requires sourcing an external dataset. If you
> cannot obtain it, STOP and report — do not invent mortality numbers.** When
> done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat d47d8cc..HEAD -- src/mortality.ts src/mortality.test.ts src/data/life-expectancy.ts`
> If any changed since this plan was written, compare the "Current state"
> excerpts below against the live code before proceeding; on a mismatch, treat
> it as a STOP condition.

## Status

- **Priority**: P1 (highest impact in the audit)
- **Effort**: L
- **Risk**: MED
- **Depends on**: `plans/001-characterization-tests.md` (safety net for the
  run-out path that consumes `deathAge`)
- **Category**: bug
- **Planned at**: commit `d47d8cc`, 2026-06-16

## Why this matters

The app's central output — "Chance of running out of money before death" —
depends on a per-simulation death age drawn by `generateRandomDeathAge`. That
function is built on a broken conversion: it turns _remaining life expectancy_
`e(x)` into an annual death probability via `1 − e^(−1/e(x))` and applies it as
a constant hazard at every age. The result is wildly wrong. The repo's own test
prints the symptom:

```
Average death age: 57.546, Expected: 84.7        (30-year-old male)
```

People in the simulation die, on average, **~27 years too young**. Because they
"die" early, the model assumes the pot needs to last far less time than it
really does, which **systematically understates** the chance of running out of
money — the opposite of the conservative behavior a retirement planner should
have. The headline number is currently not trustworthy.

The fix is to use real **age-specific one-year mortality probabilities** (the
actuarial quantity `qₓ`) instead of deriving a probability from aggregate life
expectancy. `generateRandomDeathAge` already has the right _structure_ (walk
year by year, draw against that year's death probability) — it just needs
correct `qₓ` values instead of the broken derivation.

## Current state

`src/mortality.ts` — the whole file:

```ts
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
  return 1 - Math.exp(-1 / lifeExpectancy); // <-- the broken conversion
};

export const getAnnualDeathProbability = (age: number, sex: Sex): number => {
  const lifeExpectancy = getLifeExpectancy(age, sex);
  return lifeExpectancyToDeathProbability(lifeExpectancy); // <-- uses it
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
```

`src/data/life-expectancy.ts` holds **cohort remaining life expectancy** `e(x)`
by single year of age (index = age), for `men` and `women`, 100 entries each
(ages 0–99). Anchor values you will use as the correctness ground truth:

- `men[30] = 54.7` → a 30-year-old male is expected to die at ≈ **84.7**
- `women[30] = 58.1` → ≈ **88.1**
- `men[65] = 20.0` → ≈ **85.0**
- `women[65] = 22.7` → ≈ **87.7**
- `men[0] = 87.1`, `women[0] = 90.3` (these magnitudes — high 80s/90 at birth —
  confirm the table is **cohort** life expectancy, i.e. it already bakes in
  projected future mortality improvement, not period mortality).

**Keep `src/data/life-expectancy.ts` unchanged.** It is the independent ground
truth your cross-check test compares against, and it backs the existing
`getLifeExpectancy` tests.

Who consumes mortality (so you know the blast radius):

- `src/monte-carlo.ts:46` calls `generateRandomDeathAge(startingAge, sex)` — the
  only app-facing use.
- `getSurvivalProbability`, `getAnnualDeathProbability`, `getLifeExpectancy` are
  used only internally and by `src/mortality.test.ts`.
- `lifeExpectancyToDeathProbability` is used only by `getAnnualDeathProbability`
  and its own test — it becomes dead after this change and should be removed.

## The data you must source

You need **cohort `qₓ`** (probability that a person alive at exact age `x` dies
before age `x+1`), single year of age, UK, for males and females, ages 0–99,
**consistent with the cohort life-expectancy table already in the repo**.

- **Source**: ONS "Past and projected period and cohort life tables" (the
  _cohort_ `qₓ` columns), UK, the 2020-based projection — this is the dataset
  whose cohort `e(x)` matches the values in `src/data/life-expectancy.ts` (e.g.
  cohort `e(0)` ≈ 87 male / 90 female). Period life tables (`e(0)` ≈ 79) are the
  **wrong** basis — do not use them; they would fail the cross-check in Step 4
  and would understate longevity for the app's users.
- **Shape**: 100 values per sex (index = age, 0–99), each a probability in
  `[0, 1]`.

**Rough sanity anchors** (cohort `qₓ` is small at young ages, rising steeply;
exact values depend on vintage — these are order-of-magnitude guards, not exact
targets):

| age | male qₓ ≈     | female qₓ ≈   |
| --- | ------------- | ------------- |
| 0   | 0.003–0.004   | 0.003         |
| 30  | 0.0005–0.0009 | 0.0003–0.0006 |
| 65  | 0.006–0.010   | 0.004–0.007   |
| 80  | 0.03–0.05     | 0.02–0.04     |
| 90  | 0.10–0.16     | 0.08–0.13     |

If a value you transcribe is wildly outside these ranges, you've got the wrong
column or table — STOP and report.

**The real acceptance gate is the statistical cross-check in Step 4**, not these
anchors: a correct `qₓ` table reproduces the cohort life expectancies already in
the repo. A transcription error large enough to matter will fail it.

## Commands you will need

| Purpose   | Command                                | Expected on success      |
| --------- | -------------------------------------- | ------------------------ |
| Typecheck | `npm run typecheck`                    | exit 0                   |
| Tests     | `npx vitest run`                       | all pass                 |
| Tests (1) | `npx vitest run src/mortality.test.ts` | passes incl. cross-check |
| Build     | `npm run build`                        | exit 0                   |
| Format    | `npm run format`                       | rewrites changed files   |

## Scope

**In scope** (the only files you should modify):

- `src/data/mortality-rates.ts` (create) — the `qₓ` table.
- `src/mortality.ts` — rewrite `getAnnualDeathProbability`; remove
  `lifeExpectancyToDeathProbability`.
- `src/mortality.test.ts` — remove the dead function's tests; strengthen the
  death-age test with the cross-check.

**Out of scope** (do NOT touch):

- `src/data/life-expectancy.ts` — the cross-check ground truth; keep it as-is.
- `generateRandomDeathAge` and `getSurvivalProbability` — their logic is
  correct; they automatically improve once `getAnnualDeathProbability` returns
  real `qₓ`.
- `src/monte-carlo.ts`, `ProjectedOutcomes.tsx` — the run-out logic is
  unchanged; it just receives better `deathAge` values.

## Git workflow

- Branch: `advisor/006-fix-mortality-model`
- Commit message: short imperative, e.g. "Use real qx mortality table for death
  simulation".
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create the `qₓ` table

Create `src/data/mortality-rates.ts`, mirroring the structure of
`src/data/life-expectancy.ts` (same `{ men: number[], women: number[] }` shape,
index = age, 100 entries each). Populate it from the cohort `qₓ` source
described above. Header comment must state the exact source, table, and vintage
so it's auditable:

```ts
// One-year mortality probability (q_x) by single year of age, index = age.
// Source: ONS "Past and projected period and cohort life tables", UK,
// <vintage e.g. 2020-based>, cohort q_x columns. Consistent with the cohort
// life expectancy in ./life-expectancy.ts.
export const mortalityRateAtAge = {
  men: [
    /* 100 values, ages 0..99 */
  ],
  women: [
    /* 100 values, ages 0..99 */
  ],
};
```

**Verify**:
`node -e "const {mortalityRateAtAge:m}=require('./src/data/mortality-rates.ts')"`
will not work (TS), so instead verify shape with a temporary check inside the
test in Step 3, or eyeball: both arrays have exactly 100 numeric entries, every
value in `[0, 1]`, and values are non-decreasing from about age 10 onward.

### Step 2: Rewrite `getAnnualDeathProbability`; remove the broken function

In `src/mortality.ts`:

1. Add the import:
   ```ts
   import { mortalityRateAtAge } from "./data/mortality-rates";
   ```
2. Replace `getAnnualDeathProbability` so it reads `qₓ` directly:
   ```ts
   export const getAnnualDeathProbability = (age: number, sex: Sex): number => {
     const data = mortalityRateAtAge[sex === "male" ? "men" : "women"];
     if (age < 0) return 0;
     if (age >= data.length) return 1; // beyond the table: certain death
     return data[age];
   };
   ```
3. **Delete** `lifeExpectancyToDeathProbability` entirely (it's now unused).
4. Leave `getLifeExpectancy`, `generateRandomDeathAge`, and
   `getSurvivalProbability` unchanged.

**Verify**: `npm run typecheck` → exit 0 (it will still error in the test until
Step 3 removes the now-missing import — that's expected).

### Step 3: Update the tests — remove dead tests, add the cross-check

In `src/mortality.test.ts`:

1. Remove `lifeExpectancyToDeathProbability` from the import list (line 2-9) and
   delete its entire `describe("lifeExpectancyToDeathProbability", ...)` block.
2. Keep the `getLifeExpectancy`, `getAnnualDeathProbability`,
   `getSurvivalProbability`, and "edge cases" blocks — they remain valid (real
   `qₓ` still rises with age, and male `qₓ` > female `qₓ` at 65).
3. Replace the existing
   `it("should generate reasonable death ages for typical scenarios", ...)` test
   (which only checks the mean is between `currentAge` and 120 and logs a
   mismatch) with a real correctness gate. Add this, using `getLifeExpectancy`
   from the existing `e(x)` table as the independent expected value:

```ts
it("produces a mean death age matching life expectancy (the model's core correctness)", () => {
  const N = 50000;
  const cases: Array<{ age: number; sex: Sex }> = [
    { age: 30, sex: "male" },
    { age: 30, sex: "female" },
    { age: 65, sex: "male" },
    { age: 65, sex: "female" },
  ];

  for (const { age, sex } of cases) {
    let total = 0;
    for (let i = 0; i < N; i++) total += generateRandomDeathAge(age, sex);
    const meanDeathAge = total / N;
    const expected = age + getLifeExpectancy(age, sex);
    // Monte Carlo curtate expectation is ~0.5yr below the complete e(x);
    // ±2 years absorbs that plus q_x vintage differences.
    expect(Math.abs(meanDeathAge - expected)).toBeLessThan(2);
  }
});
```

(Remove the `console.log` from the old test — it should not survive.)

**Verify**: `npx vitest run src/mortality.test.ts` → all pass, including the new
cross-check. **This passing is the proof the model is fixed.** Before this plan,
the 30-year-old-male mean was 57.5 vs expected 84.7 (off by 27); now it must be
within 2 years.

### Step 4: Full verify and format

Run `npm run format`, then the whole suite and build.

**Verify**: `npx vitest run` → all pass; `npm run typecheck` → exit 0;
`npm run build` → exit 0.

## Test plan

- New cross-check test (Step 3): mean of `generateRandomDeathAge` over 50,000
  draws is within 2 years of `age + getLifeExpectancy(age, sex)` for
  {30,65}×{male,female}. This is the regression gate that proves the fix and
  guards the `qₓ` data against gross transcription errors.
- Removed: the `lifeExpectancyToDeathProbability` describe block (function
  deleted) and the old weak "reasonable death ages" test (with its
  `console.log`).
- Unchanged and still passing: `getLifeExpectancy` exact-value tests,
  `getAnnualDeathProbability` ordering tests, `getSurvivalProbability` tests.
- Verification: `npx vitest run` → all pass.

## Done criteria

ALL must hold:

- [ ] `src/data/mortality-rates.ts` exists with 100 `qₓ` values per sex, all in
      `[0, 1]`
- [ ] `grep -n "lifeExpectancyToDeathProbability" src/` → no matches (function
      and its tests gone)
- [ ] `grep -n "mortalityRateAtAge" src/mortality.ts` → matches
- [ ] `grep -rn "console.log" src/mortality.test.ts` → no matches
- [ ] `npm run typecheck` exits 0
- [ ] `npx vitest run` exits 0; the new mean-death-age cross-check passes for
      all four cases
- [ ] `npm run build` exits 0
- [ ] `src/data/life-expectancy.ts` is unchanged (`git status`)
- [ ] Only the three in-scope files are modified/created (`git status`)
- [ ] `plans/README.md` status row for 006 updated to DONE

## STOP conditions

Stop and report (do not improvise) if:

- **You cannot obtain cohort `qₓ` data** you're confident in. Do NOT fabricate,
  guess, or interpolate actuarial values. Report that the data is the blocker —
  the maintainer can supply the table or approve the simpler alternative in
  Maintenance notes.
- The only `qₓ` data you can find is **period** (life-expectancy-at-birth ≈ 79,
  not ≈ 87). Using it would be inconsistent with the repo's cohort `e(x)` and
  fail the cross-check. Report this rather than mixing bases or loosening the
  test tolerance.
- The cross-check test in Step 3 fails (mean off by ≥ 2 years for any case)
  after a genuine attempt to source correct data. Do **not** widen the tolerance
  to force a pass — report the discrepancy; it means the table is wrong.
- The "Current state" excerpts don't match the live code (drift since
  `d47d8cc`).

## Maintenance notes

- A reviewer should: (a) spot-check a few `qₓ` values against the cited ONS
  table, (b) confirm the source/vintage comment is present and accurate, and (c)
  confirm the headline "Chance of running out" number in `npm run dev` moved in
  the expected direction (people now live longer → money must last longer → the
  percentage generally rises). A _changed_ headline number here is the intended
  effect, not a regression.
- The percentile chart is **not** affected by this change — it never reads
  `deathAge` (see `calculateMortalityAdjustedPercentiles`). Only the run-out
  metric changes.
- **Simpler alternative if cohort `qₓ` is genuinely unobtainable** (maintainer's
  call, not the executor's): drop the stochastic death age and use a
  deterministic planning horizon of
  `Math.round(currentAge + getLifeExpectancy(currentAge, sex))` — i.e. everyone
  in the simulation "dies" at their life expectancy. This needs no new data
  (reuses the existing `e(x)` table), is dramatically more correct than the
  status quo, and keeps the run-out metric meaningful (outcomes still vary by
  market returns). The cost is losing lifespan variability across simulations,
  which the author appears to have intended (the sex selector and death-age
  simulation were added deliberately). Flagged here so it's a conscious
  decision, not a silent fallback.
- If `qₓ` is later updated to a new ONS vintage, also refresh
  `src/data/life-expectancy.ts` from the same vintage so the cross-check stays
  consistent.
