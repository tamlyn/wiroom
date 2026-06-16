# Plan 002: Fix the currency symbol and garbled caption in the UI

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the next
> step. If anything in the "STOP conditions" section occurs, stop and report —
> do not improvise. When done, update the status row for this plan in
> `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat d47d8cc..HEAD -- src/components/YourDecisionsTab.tsx src/components/ProjectedOutcomes.tsx`
> If either file changed since this plan was written, compare the "Current
> state" excerpts below against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `d47d8cc`, 2026-06-16

## Why this matters

Two user-visible text bugs make a finance tool look untrustworthy:

1. This is a UK pension calculator denominated in **£** throughout (see
   `formatCurrency` in `src/utils.ts`, which formats GBP), but two input
   captions render a **`$`** before the monthly figure — e.g. "($833 per
   month)".
2. The caption under the headline "Retirement Risk" number is a garbled
   copy-paste artifact: "Based on Based on 10,000 Monte Carlo simulations with
   mortality Monte Carlo simulations with mortality modeling".

Both are pure display-string fixes with no logic impact.

## Current state

**Bug 1 — wrong currency symbol.** `src/components/YourDecisionsTab.tsx`, the
"Annual Contribution" slider (lines 41-50) and the "Annual Drawdown" slider
(lines 62-72), each have a `description` prop using a literal `$`:

`src/components/YourDecisionsTab.tsx:49`:

```tsx
        description={`($${Math.round(annualContribution / 12).toLocaleString()} per month)`}
```

`src/components/YourDecisionsTab.tsx:71`:

```tsx
          description={`($${Math.round(annualDrawdown / 12).toLocaleString()} per month)`}
```

Both render "($<n> per month)". They should render "(£<n> per month)".

**Bug 2 — garbled caption.** `src/components/ProjectedOutcomes.tsx:49-53`:

```tsx
<div className="text-xs text-gray-500 mt-3 text-center">
  Based on Based on {simulations.length.toLocaleString()} Monte Carlo
  simulations with mortality Monte Carlo simulations with mortality modeling
</div>
```

It should read: "Based on {N} Monte Carlo simulations with mortality modeling".

For reference, the rest of the app uses `formatCurrency` (`src/utils.ts:1-8`)
which renders GBP with a `£` symbol — these two `description` strings are the
only place a raw currency symbol is hand-written.

## Commands you will need

| Purpose   | Command             | Expected on success    |
| --------- | ------------------- | ---------------------- |
| Typecheck | `npm run typecheck` | exit 0                 |
| Tests     | `npx vitest run`    | all pass (unchanged)   |
| Build     | `npm run build`     | exit 0                 |
| Format    | `npm run format`    | rewrites changed files |

## Scope

**In scope** (the only files you should modify):

- `src/components/YourDecisionsTab.tsx`
- `src/components/ProjectedOutcomes.tsx`

**Out of scope** (do NOT touch):

- `src/utils.ts` `formatCurrency` — it's correct; don't refactor the captions to
  use it (keep this change minimal and low-risk).
- Any numeric/logic code. This is text only.

## Git workflow

- Branch: `advisor/002-ui-text-fixes`
- Commit message style matches `git log` (short imperative, e.g. "Fix currency
  symbol and garbled caption").
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Fix the `$` → `£` in both descriptions

In `src/components/YourDecisionsTab.tsx`, change the `$` immediately after the
opening `(` to `£` on **both** lines (49 and 71). After the change:

Line 49:

```tsx
        description={`(£${Math.round(annualContribution / 12).toLocaleString()} per month)`}
```

Line 71:

```tsx
          description={`(£${Math.round(annualDrawdown / 12).toLocaleString()} per month)`}
```

Only the single `$` character before `${Math...}` changes to `£` in each. Leave
the `${...}` interpolation exactly as-is.

**Verify**: `grep -n 'per month' src/components/YourDecisionsTab.tsx` → both
lines now start the template with `(£${` and there is no `($${` anywhere:
`grep -n '(\$\${' src/components/YourDecisionsTab.tsx` → **no matches**.

### Step 2: Fix the garbled caption

In `src/components/ProjectedOutcomes.tsx`, replace the contents of the caption
`div` (lines 49-53) so it reads exactly:

```tsx
<div className="text-xs text-gray-500 mt-3 text-center">
  Based on {simulations.length.toLocaleString()} Monte Carlo simulations with
  mortality modeling
</div>
```

(The exact line wrapping will be normalised by Prettier — what matters is the
sentence reads "Based on {N} Monte Carlo simulations with mortality modeling"
with no duplication.)

**Verify**: `grep -n 'Based on Based on' src/components/ProjectedOutcomes.tsx` →
**no matches**.
`grep -n 'with mortality Monte Carlo' src/components/ProjectedOutcomes.tsx` →
**no matches**.

### Step 3: Format and full verify

Run `npm run format`.

**Verify**: `npm run typecheck` → exit 0; `npx vitest run` → all pass;
`npm run build` → exit 0.

## Test plan

No unit test is added — these are static JSX strings and the repo has no
component-rendering test infrastructure (tests are pure-function only). The
grep-based done criteria below are the verification. (If you want
belt-and-braces coverage, that's out of scope for this plan; note it as a
follow-up rather than introducing a new test harness here.)

## Done criteria

ALL must hold:

- [ ] `grep -rn "Based on Based on" src/` → no matches
- [ ] `grep -rn 'with mortality Monte Carlo' src/` → no matches
- [ ] `grep -n '(\$\${' src/components/YourDecisionsTab.tsx` → no matches
- [ ] `grep -c '(£\${' src/components/YourDecisionsTab.tsx` → `2`
- [ ] `npm run typecheck` exits 0
- [ ] `npx vitest run` exits 0 (still 54 tests, none changed) — or 61 if plan
      001 already landed
- [ ] `npm run build` exits 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for 002 updated to DONE

## STOP conditions

Stop and report (do not improvise) if:

- The "Current state" excerpts don't match the live code (drift since `d47d8cc`)
  — in particular if the `$` is already `£`, or the caption already reads
  correctly, this plan may have been partly applied; report rather than guess.
- `npm run build` fails for any reason after the edits.

## Maintenance notes

- A reviewer should confirm both monthly captions show `£` and the caption
  sentence is singular and ungarbled. A visual check in `npm run dev` is the
  fastest confirmation.
- Follow-up (deferred, not in scope): these captions could call `formatCurrency`
  for full consistency, but `formatCurrency` shows no decimals and the monthly
  figure is already rounded, so the only practical difference is thousands
  separators — low value, left out to keep this change risk-free.
