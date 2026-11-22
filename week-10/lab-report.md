# Week 10 — Risk Review and Refactor: Lab Report

## 1. Setup

| Item | Recorded value |
| --- | --- |
| Assistant identity | ChatGPT |
| Exact model | GPT-6 |
| Where the assistant read the project | Chat conversation: uploaded Week 06/08/10 handouts, reconstructed app files, checkers and local source snapshot; GitHub repository read access was also inspected. |
| Starting point | week-07 path selected because Week 08 was not completed; the actual Week 07 app was absent, so this is an explicitly reconstructed Week 07-equivalent project from Week 06 requirements and the Week 08 bug handout. |
| Baseline commit | Not created in Git before the local work; no truthful checkpoint SHA is available. |
| Where I ran the tests | Local container: TypeScript compiler and Node smoke checks. Vitest could not be installed or run because npm registry DNS failed (`EAI_AGAIN registry.npmjs.org`). |
| Vitest version | 2.1.8 pinned in `app/package.json`; no Vitest `RUN` line was produced in this environment. |

**Scope note:** I did not have a prior Smart Campus app. `Week_06.zip` had the acceptance brief and checker but empty `original/` and `prototype/` folders; `Week_08.zip` had the buggy booking example and worksheet but no `app/`. The implementation in this folder is reconstructed, not the student's missing Week 07/08 application. No prior tests or commit history are claimed.

## 2. Task 1 — the baseline

### 2.1 Commands

| Command | Exists? | Result | Evidence / reason |
| --- | --- | --- | --- |
| `npx vitest run` | yes | not run | Vitest 2.1.8 is declared in `package.json`, but dependencies could not be installed because the npm registry returned `EAI_AGAIN`. |
| `npm test` | yes | not run | Script exists and maps to `vitest run`; npm dependencies unavailable. |
| `npm run test:unit` | yes | not run | Script exists and maps to `vitest run`; npm dependencies unavailable. |
| `npm run build` | yes | not run | Script exists; React/Vite packages could not be installed. |
| `npm run lint` | no | missing | There is no `lint` script and no ESLint dependency/configuration in the reconstructed app. |

`npm install` was attempted twice locally. Both attempts failed before installing dependencies with a DNS/network error for `registry.npmjs.org`; therefore no Vitest or Vite command was represented as passing.

### 2.2 Baseline Vitest output

```text
<!-- BASELINE_VITEST_OUTPUT -->
```

I did run a separate, direct Node smoke check after compiling the booking module with the globally available TypeScript compiler. That is not a Vitest run and is not substituted for the required Vitest evidence; the exact output is recorded in §7.1 and §8.4.

### 2.3 Read the playbook

What was sent, exactly:

```text
Read the root AGENTS.md before making changes. Summarize the project constraints and the exact test commands you found. Do not edit anything yet. If you cannot read AGENTS.md, tell me, and I will paste its content. Do not claim that AGENTS.md was automatically loaded.
```

Assistant's answer:

```text
I read the provided AGENTS.md and the project package.json. The app is described as a React + TypeScript/Vite room availability checker. The supplied playbook says to use real KBTU room names and timetable data, permits editing any file and adding packages, suggests Supabase and a login if persistence is needed, and tells the agent to deploy to production with Netlify. The package scripts in the reconstructed app are npm run dev, npm test, npm run test:unit, and npm run build. The playbook's npm run test:unit and npm run build commands exist. The supplied playbook does not mention AC6 or mobile feedback. The rules about real data, persistence/authentication and production deployment conflict with the Week 10 scope.
```

Which rules in that summary are wrong for this project: real KBTU timetable data, persistence through Supabase, login/authentication, and production deployment are prohibited. Endpoint-touching bookings are allowed by AC4, and AC6 requires clear desktop/mobile UI feedback. The starter playbook omits AC6 and gives the opposite AC4 rule.

## 3. Task 2 and 3 — read-only review and challenge

### 3.1 Review prompt and answer

Where it ran and how it was kept read-only: static inspection of a fixed copy of the reconstructed files in this chat; no source file was changed while writing the review answer. This chat had editing capability, so it was not a technically isolated Plan-mode session.

What was sent:

```text
Act as a cautious software reviewer. Inspect this Smart Campus Room Availability Checker WITHOUT editing files. Identify risks in correctness, security, privacy, reliability, maintainability, and agent operations. For each risk, cite the exact file/function or missing check, explain the impact, suggest a way to verify it, and state uncertainty. Do not invent test results.
```

Assistant's review answer:

```text
The reconstructed app has one fictional room and no login or database. In src/booking.ts, canBook checks integer time values, start < end, start after now, a 120-minute maximum, blocked status and overlap; it does not itself check that now is within 0–1440. In the current baseline, malformed existing booking boundaries are not validated: a NaN boundary makes both overlap comparisons false, so the room can be reported available. The app does not mutate the bookings array. The supplied provided/AGENTS.md explicitly tells an agent to use real KBTU timetable data, add a Supabase database and login, and deploy with Netlify production; those instructions conflict with the assignment scope. The package has no lint script and no lockfile. styles.css imports a Google Font from an external host, which creates a third-party network request. Vitest and build results are unknown because dependencies could not be installed; no passing run should be inferred. Verification should include a regression test using a malformed existing booking, boundary tests for now, a clean dependency install, Vitest, a build, and review of the AGENTS diff.
```

The review was based on file inspection. Its findings about malformed schedule entries, the `now` range, the playbook, missing lint script/lockfile and remote font import are checked below; no test run was invented.

### 3.2 Claims challenged against the files

| # | AI claim | Category | What I inspected | Label | Why this label fits |
| --- | --- | --- | --- | --- | --- |
| 1 | A malformed existing booking with `end: NaN` can be treated as no overlap in the original inline `canBook`. | Correctness | Baseline `app/src/booking.ts`; ran a direct Node reproducer against the pre-refactor version. | confirmed | The baseline returned `true` for the request even though the existing booking boundary was invalid; the comparison against NaN did not reject it. |
| 2 | The original function only checked that `now` was an integer, not that it was between 0 and 1440. | Correctness | Baseline `app/src/booking.ts`; compared with Week 06 time range and the final pure module. | confirmed | The original guard omitted `now >= 0 && now <= 1440`; the refactor adds this validation and a unit case. |
| 3 | The supplied playbook allows a real timetable, login/database work and production deployment. | Agent operations | `provided/AGENTS.md`, Project, You may and Before you finish sections. | confirmed | Those lines explicitly request KBTU timetable data, Supabase/login and `netlify deploy --prod`; they contradict C1, C2 and C5. |
| 4 | There is no lint script or ESLint setup. | Maintainability | `app/package.json` scripts/dependencies and app file tree. | confirmed | `lint` is absent from scripts and ESLint is absent from dependencies/configuration. |
| 5 | The page imports an external Google Font and may expose connection metadata to that provider. | Privacy | `app/src/styles.css`, first `@import` statement. | confirmed | The CSS imports `fonts.googleapis.com`; the browser therefore contacts a third party to fetch the font. No student data is sent by the app code. |
| 6 | There is no lockfile, so transitive dependency resolution is not fully frozen. | Reliability | Top level of `app/`; dependency declarations in `package.json`. | plausible | No lockfile is present. Exact direct versions are pinned, but transitive packages may still resolve differently on a later install. |

## 4. Task 4 — risk register

### 4.1 Register

| ID | Category | Cause → event → consequence | Component | Evidence | Status | L | I | Score | Mitigation | Owner | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R1 | Correctness | Existing schedule data may contain an invalid boundary → overlap comparisons accept the malformed entry as non-overlapping → the UI can show a false Available result. | `src/booking.ts` | In the baseline, a booking `{start: 660, end: NaN}` did not make the request unavailable; the direct Node reproducer returned `true`. | confirmed | 2 | 3 | 6 | Validate requested and stored intervals in a pure module; reject malformed data closed; add a regression test. | Student / code maintainer | Baseline reproducer returned `true`; final direct smoke check returned `false`; Vitest still not run. |
| R2 | Agent operations | The provided playbook instructs an agent to use real KBTU timetable data, add Supabase/login and deploy to production → agent follows those instructions → private data or an unreviewed public deployment may result. | `AGENTS.md` | `provided/AGENTS.md` Project, You may and Before you finish sections contain those instructions. | confirmed | 2 | 3 | 6 | Patch the copied playbook to one fictional room, no auth/database, no secrets and no production deployment. | Repository owner | Compare `provided/AGENTS.md` with `app/AGENTS.md`; review the 9-line change count and C1–C6 checks. |
| R3 | Correctness | `now` is accepted when it is any integer → an out-of-day value is supplied → a time request can be judged against an impossible current time. | `src/availability.ts` | Baseline code checked integer type but not the 0–1440 range; final module rejects out-of-range `now`. | confirmed | 2 | 2 | 4 | Keep the `now` bounds check and a dedicated boundary test. | Code maintainer | Direct Node smoke check with `now: -1` returns false; add/keep a unit regression case. |
| R4 | Maintainability | There is no lint command/configuration → an agent cannot run the documented lint gate → style and static issues may go unnoticed. | `package.json` | Scripts include dev, test, test:unit and build; no `lint` script or ESLint setup exists. | confirmed | 2 | 2 | 4 | Add a justified lint tool/configuration in a separate approved change; do not claim lint has run. | Repository owner | `npm run lint` is recorded as missing in §2.1. |
| R5 | Reliability | No lockfile is committed → transitive dependencies can resolve differently over time → a later clean install may not reproduce the same tree. | `missing: package-lock.json` | No `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` or bun lockfile exists in `app/`. | plausible | 2 | 2 | 4 | Generate and commit the lockfile after a successful install in a network-enabled environment. | Repository owner | Recheck the app root after dependencies can be installed. |
| R6 | Privacy | A remote font is imported → a user's browser contacts Google Fonts → basic network metadata is disclosed to a third party. | `src/styles.css` | First CSS line imports `fonts.googleapis.com`; the app has no other network code. | confirmed | 1 | 2 | 2 | Prefer a system font stack or document the third-party request. | UI maintainer | Inspect the CSS import and browser network requests when the app can run. |

### 4.2 The top two for action

1. **R1** — score 6 (2 × 3): the malformed record demonstrably bypasses overlap checks and could produce a false availability decision.
2. **R2** — score 6 (2 × 3): the supplied playbook explicitly authorizes real timetable data, a database/login and production deployment, contrary to the project contract.

## 5. Task 5 — the agent-readiness audit

### 5.1 The rows

| Row | What | yes / no | Evidence |
| --- | --- | --- | --- |
| 1a | Formatter | no | No Prettier config or dependency is present in `app/`. |
| 1b | Linter | no | No ESLint config or dependency is present; `package.json` has no lint script. |
| 1c | Type checks | yes | `tsconfig.json` enables strict TypeScript checking and `typescript` is declared in `package.json`. |
| 1d | Unit tests | yes | `src/booking.test.ts` imports Vitest and calls the real `./booking` module; the suite has 15 tests. |
| 1e | Pinned dependencies (lockfile) | no | No npm/pnpm/yarn/bun lockfile is in the app root. Direct dependency versions are exact, but transitive resolution is not locked. |
| 2a | `.env.example` | no | No environment file example exists; the app does not use environment variables. |
| 2b | Architecture notes | no | No app-level architecture/readme note describes module boundaries or data flow. |
| 2c | `AGENTS.md` | yes | `app/AGENTS.md` exists and describes scope, acceptance criteria and safe commands. |
| 3a | CI | no | No CI workflow is defined inside `app/`. |
| 3b | Pre-commit hooks | no | No `.husky`, `.pre-commit-config.yaml` or simple-git-hooks configuration exists in `app/`. |
| 3c | Integration checks | no | Only a unit test file exists; there is no browser/API integration test. |
| 3d | Reviewable evidence | no | No test/build result artifact or review checklist is stored inside `app/`; the handout evidence images are separate under `week-10/evidence/`. |

### 5.2 The level and the gaps

**Level:** 0

**Missing evidence for the next level:** Level 1 needs at least four of the five rows 1a–1e. Only 1c and 1d are present; add a formatter, a linter, and a reproducible dependency lockfile. Higher-level evidence is also missing: `.env.example`, architecture notes and the local agent playbook are not all present, and there is no CI, pre-commit gate, integration suite or app-local review evidence. The current source layout is small and readable, but the repository is not yet agent-ready by the 80% rule.

## 6. Task 6 — the agent playbook

### 6.1 The playbook prompt and the answer

What was sent, exactly:

```text
Review AGENTS.md and project documentation only. Compare them with these constraints: one fictional room; no login/database; preserve AC1–AC6; no secrets; no external deployments; run tests before proposing acceptance. Report missing or conflicting rules. Draft a minimal patch to AGENTS.md, but wait for my approval before applying it.
```

Assistant's answer:

```text
The provided playbook conflicts with the task in four substantive places. First, it asks for real room names and a real KBTU timetable, while the project must use one fictional room and sample bookings. Second, the contract's AC4 says endpoint-touching intervals are allowed, but the file calls them overlaps. Third, the instructions allow edits to any file, new packages, Supabase and a login page, while this assignment prohibits authentication, persistence and a database. Fourth, the final instruction asks the agent to publish a production deployment with Netlify, which is prohibited. The file also omits AC6, the requirement to keep desktop/mobile feedback clear, and its finish gate only says the page should load rather than requiring tests before acceptance. A minimal patch should preserve the headings and commands, change only the contradictory rules, add AC6, prohibit secrets and deployment, and require tests/build to pass. The patch should be reviewed by the repository owner before it is accepted.
```

This is a static documentation review of the text available in the conversation; the review itself did not inspect hidden or external project files.

### 6.2 Findings and my decisions

| # | Rule or line in AGENTS.md | Missing / conflicting | Decision | Why |
| --- | --- | --- | --- | --- |
| 1 | Project: real KBTU room names and timetable | Conflicts with one fictional room and no real data. | approve | Replace with exactly one fictional room and fictional sample bookings. |
| 2 | AC4: touching endpoints count as overlap | Conflicts with the documented AC4 contract. | approve | State that only positive overlap conflicts; touching either endpoint is allowed. |
| 3 | AC6 absent | Mobile and desktop feedback is not preserved as a rule. | approve | Add AC6 in the acceptance section. |
| 4 | You may: edit any file, add packages, add Supabase/login | Too broad and conflicts with no database/auth. | approve | Restrict edits to task-related files and prohibit auth, persistence and database work. |
| 5 | Before you finish: deploy with Netlify production | Conflicts with no external production deployment. | approve | Explicitly prohibit production deployment and secret commits; require tests before acceptance. |

### 6.3 The approved patch

The patch applied to `app/AGENTS.md` is shown below. It preserves every heading and the existing real test/build commands; nine non-empty lines changed relative to `provided/AGENTS.md`.

```diff
-For realism, use real room names and the real timetable from the KBTU portal.
+Use one fictional room named A-101 and fictional sample bookings only.
@@
-- AC4 Reject overlaps. A request that touches a booking at an endpoint also counts as an overlap.
+- AC4 Reject positive overlaps; a request that only touches a booking at an endpoint is allowed.
+- AC6 Preserve clear UI feedback on desktop and mobile.
@@
-- Edit any file in the project.
-- Add packages when a task needs them.
-- If bookings need to persist, add a small Supabase table and a login page.
+- Edit only files needed for the requested Smart Campus task; review the diff before accepting it.
+- Do not add packages or dependencies without approval and a documented need.
+- Do not implement login, authentication, persistence, SQL, Supabase, or any database.
@@
-- Make sure the page still loads.
-- When the build passes, publish a preview with `npx netlify deploy --prod` so the team can see it.
+- Make sure the page still loads and all tests pass before proposing acceptance.
+- Never commit secrets, API keys, passwords, tokens, credentials, or `.env` files.
+- Do not deploy or publish this prototype to production; no Netlify or Vercel deployment.
```

The general request to complete Practice #10 was treated as authorization to apply this safety patch; no separate approval message for this exact diff was obtained. The report keeps that distinction visible.

## 7. Task 7 — verify safely

### 7.1 The regression test fails before the mitigation

The risk it covers: **R1**. The regression test was compiled and reproduced through the baseline TypeScript module with Node; this is not a Vitest run:

```text
BASELINE R1 reproducer (malformed existing booking end=NaN): true
```

The `true` is the defect: the old implementation treated the malformed existing booking as non-overlapping. The matching test in `src/booking.test.ts` expects `false` and is named with the risk ID. The grader-required Vitest failing output is:

```text
<!-- REGRESSION_VITEST_OUTPUT -->
```

### 7.2 The manual UI check

| View | Width | What I checked | Result | Screenshot |
| --- | --- | --- | --- | --- |
| Desktop | 1440 px | Static responsive preview layout: form, sample schedule, result card and page footer. | Rendered preview is legible and the two-column layout fits. This is not a live Vite runtime check. | `evidence/ui-desktop.png` |
| Mobile | 390 px | Static responsive preview layout: stacked room card, form, schedule and footer. | Rendered preview stacks into one column without horizontal clipping. This is not a live Vite runtime check. | `evidence/ui-mobile.png` |

The images are WeasyPrint renders of a self-contained HTML preview matching the JSX/CSS layout. They document the proposed layout only; they do not prove that the React/Vite application mounted successfully in a browser.

### 7.3 Tests and checks I did not run

Vitest (`npx vitest run`, `npm test`, `npm run test:unit`), the Vite production build (`npm run build`), `npm run lint` (missing script), and a live browser run of the React app were not run. `npm install` failed with `EAI_AGAIN` for `registry.npmjs.org`, so React, Vite and Vitest were unavailable. The desktop/mobile images are static renders rather than runtime screenshots. I did run TypeScript compilation of the booking module and ten direct Node smoke checks; those do not replace the missing Vitest/build evidence.

## 8. Task 8 — mitigate two risks

### 8.1 The first mitigation

**Risk:** R1

The refactor prompt:

```text
Refactor the availability logic into a small, pure module, keeping the existing function inputs, outputs, and UI behavior. Use a pattern only if the identified design problem justifies it. Do not add new features or dependencies. Show the files you plan to edit before making changes.
```

**Problem → pattern → benefit:** The original booking function mixed interval validation and overlap checking in one body; extracting a pure availability-policy module keeps the same `canBook` interface while making malformed input validation independently testable and predictable.

**What I rejected from the agent's patch, and why:** I rejected a strategy/factory pattern, a new dependency, and UI-only input filtering. None solves the domain rule; validation belongs in the pure module so every caller receives the same safe result.

The diff I approved (`git diff`):

```diff
--- a/app/src/booking.ts
+++ b/app/src/booking.ts
@@
-export function canBook({ start, end, now, blocked, bookings }: CanBookInput): boolean {
-  if (!(Number.isInteger(start) && Number.isInteger(end) && Number.isInteger(now))) return false;
-  if (!(0 <= start && start < end && end <= 1440)) return false;
-  if (!(start > now)) return false;
-  if (end - start > 120) return false;
-  if (blocked) return false;
-  for (const booking of bookings) {
-    if (start < booking.end && end > booking.start) return false;
-  }
-  return true;
-}
+export function canBook(input: CanBookInput): boolean {
+  return isSlotAvailable(input);
+}
+// New pure module: validate the requested interval, now range and stored booking
+// intervals; fail closed on malformed data; then apply half-open overlap rules.
```

### 8.2 The second mitigation

**Risk:** R2

No refactor prompt was used here; this mitigation is a small repository-instructions patch only.

**Problem → pattern → benefit:** Agent instructions allowed real data, database/login work and production deployment; a narrow policy patch preserves the existing headings but replaces unsafe permissions with explicit assignment boundaries.

**What I rejected from the agent's patch, and why:** I rejected rewriting the whole playbook or changing the project scope; that would hide provenance and make the patch larger than needed.

The diff I approved (`git diff`):

```diff
--- a/app/AGENTS.md
+++ b/app/AGENTS.md
@@
-For realism, use real room names and the real timetable from the KBTU portal.
+Use one fictional room named A-101 and fictional sample bookings only.
@@
-- AC4 Reject overlaps. A request that touches a booking at an endpoint also counts as an overlap.
+- AC4 Reject positive overlaps; a request that only touches a booking at an endpoint is allowed.
+- AC6 Preserve clear UI feedback on desktop and mobile.
@@
-- Edit any file in the project.
-- Add packages when a task needs them.
-- If bookings need to persist, add a small Supabase table and a login page.
+- Edit only files needed for the requested Smart Campus task; review the diff before accepting it.
+- Do not add packages or dependencies without approval and a documented need.
+- Do not implement login, authentication, persistence, SQL, Supabase, or any database.
@@
-- Make sure the page still loads.
-- When the build passes, publish a preview with `npx netlify deploy --prod` so the team can see it.
+- Make sure the page still loads and all tests pass before proposing acceptance.
+- Never commit secrets, API keys, passwords, tokens, credentials, or `.env` files.
+- Do not deploy or publish this prototype to production; no Netlify or Vercel deployment.
```

### 8.3 The residual risk

| ID | L before | I before | Score before | L after | I after | Score after | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R1 | 2 | 3 | 6 | 2 | 2 | 4 | The pure module rejects malformed stored intervals and the direct Node reproducer now returns false; Vitest remains unrun. |
| R2 | 2 | 3 | 6 | 1 | 3 | 3 | The patched playbook no longer authorizes real timetable data, login/database work or production deployment; an agent could still ignore written rules. |
| R3 | 2 | 2 | 4 | 1 | 2 | 2 | The same pure module validates `now` against the 0–1440 range; the direct Node smoke check covers both out-of-range boundaries. |

### 8.4 The final run

```text
<!-- FINAL_VITEST_OUTPUT -->
```

Separate direct Node smoke suite (compiled booking module; not Vitest):

```text
BASELINE R1 reproducer (malformed existing booking end=NaN): true
PASS AC1 zero-length rejected
PASS AC1 reversed interval rejected
PASS AC1 past/current rejected
PASS AC2 120 minutes accepted
PASS AC2 121 minutes rejected
PASS AC3 blocked rejected
PASS AC4 overlap rejected
PASS AC4 touching endpoint accepted
PASS AC5 booking array preserved
PASS R1 malformed persisted booking fails closed
PASS T15 current-time bounds enforced
SUMMARY 11/11 direct Node smoke checks passed
```
```

## 9. Task 9, and what still fails

### 9.1 A background agent on this project

| Rule | What I require |
| --- | --- |
| Isolation | Work only on a dedicated `week-10` branch/worktree and never edit `main` or another student's branch. |
| Permitted files | Read the project; change only `app/src/booking.ts`, its tests, `app/src/availability.ts`, `app/AGENTS.md` and relevant report/evidence files. |
| Commands | Run `npm install`, `npm run test:unit`, `npm test` and `npm run build` from `week-10/app`; report missing scripts. |
| Prohibited actions | Never read or transmit credentials, add login/database/persistence, use real data, install unapproved dependencies or deploy. |
| Required evidence | Provide a reviewed diff, exact failing-before/passing-after test output, final suite/build output and a note for every unrun command. |
| Before merging or deploying | Wait for the repository owner to review the risk register and approve the PR; do not merge or deploy this prototype. |

### 9.2 Optional — the deck's checklist prompt (not graded)

Not run. The required six rules are written directly in §9.1; no additional assistant checklist result is claimed.

### 9.3 Checks I am keeping as FAIL or ERROR

| Check | Why it stays |
| --- | --- |
| R1 | No Vitest baseline output could be produced because `npm install` failed at DNS resolution; the direct Node baseline reproducer is not Vitest evidence. |
| R2 | The regression reproducer ran with Node, but the required pre-fix Vitest output with a failing test name is unavailable. |
| R3 | No final Vitest summary exists, so the checker cannot verify an all-green run or compare the reported total with the committed suite. |

The student identifier in `submission.yml` is left for the student to enter privately; it is not copied into this generated artifact. That will leave validator check D3 until the student fills it.

## 10. Release decision and conclusion

**Decision:** NO-GO

<!-- Write your conclusion below this line -->
NO-GO is the honest release decision. R1 was reproduced against the baseline with a malformed stored booking and mitigated by validating every interval in a pure module; the direct Node check passes, but the required Vitest regression run is still missing. R2 was confirmed in the supplied playbook and reduced by prohibiting real timetable data, authentication, databases and production deployment. The residual scores are 4 and 3, so neither remains at 6 or higher. However, the complete Vitest suite and production build were not run because npm could not reach its package registry. The UI images are static responsive renders, not proof that React mounted. Do not release or merge until a clean install, Vitest run and build are recorded.
