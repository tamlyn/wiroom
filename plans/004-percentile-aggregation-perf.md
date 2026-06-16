# Plan 004: Make percentile aggregation O(n) instead of O(n²)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the next
> step. If anything in the "STOP conditions" section occurs, stop and report —
> do not improvise. When done, update the status row for this plan in
> `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat d47d8cc..HEAD -- src/monte-carlo.ts` If it changed since this
> plan was written, compare the "Current state" excerpt against the live code
> before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: `plans/001-characterization-tests.md` (its percentile test is
  the proof this rewrite preserves output)
- **Category**: perf
- **Planned at**: commit `d47d8cc`, 2026-06-16

## Why this matters

`calculateMortalityAdjustedPercentiles` runs inside a `useMemo` in
`src/pension-calculator.tsx` that recomputes on **every input change** — i.e. on
every drag of any slider. With the UI's `numSimulations: 10000` and ~55 ages per
simulation, the current implementation does, per recompute:

```
for each age (≈55):
  simulations.map(sim => sim.find(point => point.age === age))   // 10000 linear scans
```

That inner `sim.find` is a linear scan from the start of the array for every
(age × simulation) pair — roughly **15 million comparisons per recompute**, on
the main thread, several times a second while dragging. The result is visible UI
jank.

The fix is exact, not approximate: every simulation is a contiguous,
age-ascending array starting at the same `startingAge`, so the point for a given
`age` is at index `age - minAge`. Replacing the `O(ages)` `find` with an `O(1)`
index lookup turns the whole function from `O(ages² × sims)` into
`O(ages × sims)` — about a 25–55× reduction in the hot loop — while producing
**identical output**.

## Current state

`src/monte-carlo.ts:72-100` — the function to change:

```ts
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
```

Why the index lookup is safe: each simulation comes from
`calculatePensionProjection` (`src/pension-calculations.ts:39`), whose loop is
`for (let age = startingAge; age <= maxAge; age++)` pushing exactly one point
per age in ascending order. All simulations in a run share the same
`startingAge` and `maxAge`. So `sim[age - minAge].age === age` holds for every
simulation, and `minAge` equals each sim's first age.

The call site (do **not** change it in this plan):
`src/pension-calculator.tsx:50-53`:

```ts
const percentiles = calculateMortalityAdjustedPercentiles(
  sims,
  [5, 25, 50, 75, 95],
);
```

## Commands you will need

| Purpose   | Command                                  | Expected on success    |
| --------- | ---------------------------------------- | ---------------------- |
| Typecheck | `npm run typecheck`                      | exit 0                 |
| Tests     | `npx vitest run`                         | all pass               |
| Tests (1) | `npx vitest run src/monte-carlo.test.ts` | passes                 |
| Build     | `npm run build`                          | exit 0                 |
| Format    | `npm run format`                         | rewrites changed files |

## Scope

**In scope** (the only file you should modify):

- `src/monte-carlo.ts` — the body of `calculateMortalityAdjustedPercentiles`
  only.

**Out of scope** (do NOT touch):

- `src/pension-calculator.tsx` — including `numSimulations: 10000`. Reducing the
  simulation count is a separate product/UX decision (it affects how much the
  headline number jitters between recomputes); see Maintenance notes. Do not
  change it in this plan.
- The function's signature, return shape, or the percentile index formula.
  Output must be byte-for-byte identical to today's.
- `calculateRunOutChance` (a different function, in `ProjectedOutcomes.tsx`).

## Git workflow

- Branch: `advisor/004-percentile-aggregation-perf`
- Commit message: short imperative, e.g. "Speed up percentile aggregation with
  index lookup".
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Replace the per-age `find` with an index lookup

Rewrite the body of the `for (let age = minAge; age <= maxAge; age++)` loop so
that the value for each simulation at `age` is read by index instead of `find`.
Keep everything else (the `if (!simulations.length) return []`,
`maxAge`/`minAge` computation, the sort, the index formula, the `p${p}` keys)
exactly the same.

Target shape for the loop body:

```ts
for (let age = minAge; age <= maxAge; age++) {
  const ageIndex = age - minAge;
  const valuesAtAge = simulations
    .map((sim) => sim[ageIndex]?.potValue ?? 0)
    .sort((a, b) => a - b);

  const percentileValues: PercentileDataPoint = { age };
  percentiles.forEach((p) => {
    const index = Math.floor((p / 100) * (valuesAtAge.length - 1));
    percentileValues[`p${p}`] = valuesAtAge[index];
  });

  result.push(percentileValues);
}
```

Notes:

- Use `?? 0` (nullish) for the fallback, preserving the old `|| 0` behavior for
  the only realistic case (an out-of-range index → `undefined`). A `potValue` is
  never `null`/`undefined`/`NaN` in practice, so `?? 0` and `|| 0` behave
  identically here; `?? 0` is marginally more correct because a legitimate
  `potValue` of `0` is kept rather than... (it's kept by both — they differ only
  on falsy-but-valid values, of which there are none here). Either operator
  passes the tests; `?? 0` is preferred.

**Verify**: `npm run typecheck` → exit 0.

### Step 2: Confirm identical output via the regression test

Run the characterization test added by plan 001 — it pins exact percentile
values for hand-built inputs, which is precisely what must not change.

**Verify**: `npx vitest run src/monte-carlo.test.ts` → passes, including
`calculateMortalityAdjustedPercentiles > computes percentiles per age...`.

If plan 001 has **not** been landed yet (the file `src/monte-carlo.test.ts` does
not exist), STOP — see STOP conditions. Do not proceed without the regression
net.

### Step 3: Full verify and format

Run `npm run format`, then the full suite and build.

**Verify**: `npx vitest run` → all pass; `npm run typecheck` → exit 0;
`npm run build` → exit 0.

## Test plan

- No new test is required — plan 001's `calculateMortalityAdjustedPercentiles`
  test is the regression gate and must stay green unchanged.
- If plan 001 is not present, do not write ad-hoc tests and proceed; STOP
  instead (the dependency exists specifically so this refactor is provably
  safe).

## Done criteria

ALL must hold:

- [ ] `grep -n "\.find((point)" src/monte-carlo.ts` → no matches (the `find` is
      gone)
- [ ] `grep -n "age - minAge" src/monte-carlo.ts` → at least one match
- [ ] `npm run typecheck` exits 0
- [ ] `npx vitest run` exits 0; plan 001's percentile test passes unchanged
- [ ] `npm run build` exits 0
- [ ] Only `src/monte-carlo.ts` is modified (`git status`)
- [ ] `plans/README.md` status row for 004 updated to DONE

## STOP conditions

Stop and report (do not improvise) if:

- `src/monte-carlo.test.ts` (from plan 001) does not exist. This plan's safety
  depends on it; land plan 001 first.
- Plan 001's percentile test fails after your change. That means the index
  lookup is not equivalent to the `find` — do not modify the test to make it
  pass; report it (it would indicate simulations are not contiguous as assumed,
  which is itself a finding).
- The "Current state" excerpt doesn't match the live code (drift since
  `d47d8cc`).

## Maintenance notes

- A reviewer should confirm: (a) the index lookup matches the simulation array's
  layout (one contiguous point per year from `startingAge`), and (b) the
  percentile index formula is untouched.
- **Deferred lever (not in this plan):** `numSimulations: 10000` in
  `src/pension-calculator.tsx:47` is higher than needed for stable 5/95
  percentiles and contradicts the UI copy ("1,000 scenarios"). Reducing it would
  cut total work further but increases run-to-run jitter of the headline number
  (the sims are re-randomised on every input change). Decide this with the
  maintainer; it's a UX trade-off, not a pure perf win.
- If the simulation ever becomes ragged (different start/end ages per sim, e.g.
  if a future change stops a simulation at death), this index lookup breaks —
  revert to an age-keyed `Map` per simulation, or re-introduce a guarded lookup.
  Watch for this in review of any mortality/projection change (e.g. plan 006).
