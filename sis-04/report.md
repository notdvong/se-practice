# SIS #04 — Report: Evolving the Smart Campus Room Availability Checker

<!-- The ONLY file you write prose in. Keep every numbered heading (## 1. … ## 10.), every
     ### sub-heading and every **Label:** word — the checker finds your answers by them.
     Replace every "(write here)" and "(paste here)". Delete these <!-- --> comments if you like. -->

## 1. Setup and starting point

<!-- Model: the exact model with its version, as the tool shows it ("ChatGPT" is a tool, not a
     model). If the tool does not show it, write: not displayed
     Starting point: week-08 | week-07 | sis-03 | starter   (README section 3)
     Baseline commit: the commit that brings your starting point into sis-04/app/ UNCHANGED —
     git rev-parse --short HEAD right after that commit. It is your "initial version". -->

| Item | Value |
| --- | --- |
| Assistant (tool) | Claude (Anthropic), used through Claude Code; the chats were fresh sub-agents (see section 8) |
| Assistant model | claude-sonnet-5-5 (the configured model of the session; the sub-agents were started with the alias "sonnet", so their exact serving version is not displayed) |
| Starting point | starter |
| Baseline commit | 1d36742 |
| Language (ts or js) | ts |
| Vitest version | (to be filled from the "RUN v..." line of the real run) |
| Where I ran the tests | (to be filled: where the student ran npm install and npx vitest run) |

### 1.1 Baseline run

<!-- Before you change anything: run the tests of your starting point inside app/ and paste the
     REAL output. No tests yet (starter, sis-03)? Paste the run anyway: Vitest prints
     "No test files found". That is your honest "original" number, 0/0. -->

```text
(paste here)
```

## 2. Context for the assistant

### 2.1 Repository map

<!-- The concise map you gave the assistant: the files that matter and one line each on what
     they do. A tree is fine:  src/App.tsx — the page, holds the rooms and the form … -->

```text
package.json        Vite + React 18 + TypeScript project; scripts dev, build, test; vitest ^3.2.4 in devDependencies
index.html          page shell with <div id="root">
vite.config.ts      Vite config with the React plugin
tsconfig.json       strict TypeScript, JSX react-jsx
src/main.tsx        mounts <App /> into #root
src/index.css       styles, one media query for phones (max-width 480px)
src/App.tsx         89 lines, the whole application: a ROOMS constant with 2 rooms (id, name, blocked, bookings), helpers toMinutes() and fmt(), form state (roomId, now, blocked checkbox, start, end, endOfDay checkbox, result, error), a check() function that validates the input and decides Available/Unavailable inline, and the JSX with the form, the result and the list of existing bookings
There are no tests and no other modules.
```

### 2.2 The context message as sent

<!-- The whole first message of your analysis chat: the map, AC1–AC6, F1–F5 and the constraints
     (no login, payments, live APIs or database; fictional data only). Unedited. -->

```text
I am extending a small working React + TypeScript + Vite app, "Smart Campus Room Availability Checker", for a university software-engineering assignment. Please analyse it before anything is changed. I want maintainability risks and a plan of small steps. I want a plan, not a full rewrite, and no code yet.

REPOSITORY MAP (sis-04/app, 113 lines of source in total):
package.json        Vite + React 18 + TypeScript project; scripts dev, build, test; vitest ^3.2.4 in devDependencies
index.html          page shell with <div id="root">
vite.config.ts      Vite config with the React plugin
tsconfig.json       strict TypeScript, JSX react-jsx
src/main.tsx        mounts <App /> into #root
src/index.css       styles, one media query for phones (max-width 480px)
src/App.tsx         89 lines, the whole application: a ROOMS constant with 2 rooms (id, name, blocked, bookings), helpers toMinutes() and fmt(), form state (roomId, now, blocked checkbox, start, end, endOfDay checkbox, result, error), a check() function that validates the input and decides Available/Unavailable inline, and the JSX with the form, the result and the list of existing bookings
There are no tests and no other modules.

REQUIREMENTS THAT MUST NOT CHANGE MEANING (AC1-AC6):
AC1 Reject start >= end and requests in the past.
AC2 Enforce the maximum allowed duration (120 minutes).
AC3 Reject a blocked room.
AC4 Reject overlaps; allow bookings that only touch at endpoints.
AC5 Return Available / Unavailable without changing booking data.
AC6 Clear, responsive feedback on desktop and mobile.

NEW FEATURE (F1-F5): a catalog of at least 4 fictional rooms, each with id, name, capacity, equipment list, blocked status and its own bookings.
F1 Capacity filter: room capacity must be >= the requested attendees.
F2 Equipment filter: the room must contain ALL selected required items.
F3 A blocked room cannot be reported as available.
F4 Show a clear empty state when no rooms match.
F5 Changing the selected room must refresh the availability result, and the check must use the chosen room's own bookings.

TARGET STRUCTURE: src/rooms.ts (type Room and ROOMS), src/filter.ts (filterRooms(rooms, { attendees, equipment })), src/booking.ts (canBook({ start, end, now, blocked, bookings }) and checkRoom(rooms, roomId, { start, end, now })), and App.tsx plus components that import these and hold no room data and no rule of their own. At least 10 Vitest tests are required later.

CONSTRAINTS: no login, payments, live APIs or database; fictional data only; no network calls or browser storage; keep AC1-AC6 behaviour exactly.

PLEASE ANSWER WITH: (1) at least three maintainability risks, each with the file or function it lives in and the evidence I should look for in the code to confirm it, with a priority; (2) a numbered plan of small safe steps, smallest first, saying what to test after each step. You cannot see my code, so tell me what to check rather than assuming.
```

## 3. Codebase analysis (Task 1)

### 3.1 Maintainability risks

<!-- At least three, found in YOUR starting code. "Where" names a file or a function(),
     e.g. src/App.tsx, check(). Evidence is what you saw, not what the assistant said.
     Priority: High / Medium / Low. -->

| # | Risk | Where (file / function) | Evidence | Priority |
| --- | --- | --- | --- | --- |
| 1 | The availability rules are written inside a React component, so they cannot be imported or tested on their own | `src/App.tsx`, `check()` | I read `check()`: the rule chain (`ok = false` branches for AC1-AC4) sits between `setResult(null)`, `setError(...)` and `setResult(ok)`; there is no `canBook` anywhere in `src/` (`git ls-files` shows only App.tsx, main.tsx, index.css). | High |
| 2 | Room data lives in the component and the room's own `blocked` flag is never used, so F3 cannot be true per room | `src/App.tsx`, `ROOMS` and `check()` | `ROOMS` is declared in App.tsx with `blocked: false` on both rooms; `grep -c "room.blocked" src/App.tsx` printed 0. `check()` reads the `blocked` checkbox state instead, which applies to whichever room is selected. | High |
| 3 | The result is not refreshed when the room changes (F5): an old answer stays on screen for the wrong room | `src/App.tsx`, the `<select onChange>` and `check()` | `onChange` only calls `setRoomId`; `result` is set only inside `check()`. I ran the starter in a browser: Room A-101 booked 10:00-11:00, request 10:00-11:00 gave "Unavailable"; switching to Room B-204 (no bookings) without pressing the button still showed "Unavailable". | High |
| 4 | The start-before-end rule (AC1) is written twice and the feedback contradicts itself | `src/App.tsx`, `check()` | The condition `!(s < e)` sets the error message, and `0 <= s && s < e && e <= 1440` appears again in the rule chain. `check()` does not return after `setError`, so in the browser, start 12:00 / end 11:00 showed both "The end time must be after the start time." and "Unavailable". | Medium |
| 5 | There are no automated tests, so a refactor cannot be checked against AC1-AC5 | `package.json`, `src/` | `package.json` has `"test": "vitest run"` and vitest in devDependencies, but `git ls-files sis-04/app/src` lists no `*.test.*` file. Baseline run: see 1.1. | High |
| 6 | The selected room is looked up with a non-null assertion, which will crash once a filter can hide the selected room | `src/App.tsx`, `ROOMS.find(...)!` in `App()` | The line `const room = ROOMS.find(r => r.id === roomId)!;` has no fallback for an id that is not found; with a filter (F1, F2) the selected room can leave the list. | Medium |

### 3.2 Improvement plan — before editing

<!-- Numbered, in the order you will do it, smallest safe step first. Written BEFORE you change
     code: the commit that adds this section comes before the commit that changes app/src. -->

1. Write `src/filter.ts` (`filterRooms`) with its tests first (F1, F2, F4, B5, B6). It is a pure function with no UI, so it is the smallest safe step.
2. Create `src/rooms.ts` with the `Room` type and a catalog of 5 fictional rooms (risk 2: data out of the component).
3. Create `src/booking.ts` with `canBook` carrying the starter's AC1-AC5 behaviour exactly (risk 1), plus tests AC1-AC5 and B1-B4. Run the whole suite.
4. Add `checkRoom(rooms, roomId, { start, end, now })`, which calls `canBook` with the chosen room's own `blocked` and `bookings` (risk 2); tests F3 and F5. Remove the global "blocked" checkbox from the page.
5. Wire the filter into the page: attendees field, equipment checkboxes, the room list with a blocked label and an empty state (F4). Tie the result to the selected room so it cannot be stale (risk 3) and handle "no selected room" instead of `!` (risk 6).
6. Split the page into components (filter panel, room list, check panel, bookings list), remove the duplicated start-before-end validation and the contradictory feedback (risk 4), add the INT test.
7. Draw `diagrams/before.puml` and `after.puml`, write `app/README.md`, take the five screenshots, run the real suite and the checker.

### 3.3 One AI suggestion I rejected or modified

| Suggestion (as the assistant made it) | Decision | Why — with the AC, F-rule, test or file behind it |
| --- | --- | --- |
| Step 3 of the assistant's revised plan: pass `blocked = room.blocked || checkbox` to `canBook`, "so the existing checkbox still works for AC3 while the room's own status now counts" | Modified: the global "Room blocked" checkbox is removed and only the room's own `blocked` value is passed | `blocked` is a property of each room (F3, and the Room type fixed by the brief), and `checkRoom(rooms, roomId, { start, end, now })` has no parameter for a page-level override, so a checkbox would let the page break F3 for one room and still block another. B-204 free and D-015 blocked must give different answers for the same times (F5), which the test for F3 and F5 in `src/booking.test.ts` checks. |
| The same step also had `canBook` "return an outcome with a reason code" | Rejected | The brief fixes `canBook({ start, end, now, blocked, bookings })` as unchanged and returning a boolean, and the B1-B4 tests assert `toBe(true)` / `toBe(false)`; a reason code would change the signature that AC1-AC5 tests rely on. |

## 4. Feature extension (Task 2)

### 4.1 What I added

<!-- Short: the catalog (how many rooms, which equipment), how the filter is chosen on the page,
     what the empty state says, what happens to an old result when the room changes. -->

(write here)

### 4.2 Demonstration

<!-- One row per screenshot in evidence/. Say what is on it: the filter values, the rooms shown,
     the room selected, the times entered and the result. -->

| Screenshot | What it shows |
| --- | --- |
| `evidence/filter-match.png` | (write here) |
| `evidence/filter-empty.png` | (write here) |
| `evidence/switch-a.png` | (write here) |
| `evidence/switch-b.png` | (write here) |
| `evidence/narrow.png` | (write here) |

## 5. Refactoring (Task 3)

<!-- The diagrams are diagrams/before.puml and diagrams/after.puml (README section 8). -->

### 5.1 Module responsibilities after

| Module or component | Responsibility |
| --- | --- |
| `src/rooms.ts` | (write here) |
| `src/booking.ts` | (write here) |
| `src/filter.ts` | (write here) |
| (write here) | (write here) |

### 5.2 Design decisions

<!-- At least two. The alternative is what you could have done instead (often what the assistant
     proposed). The why names an AC, an F-rule, a test or a risk from 3.1. -->

| Decision | Alternative I did not take | Why |
| --- | --- | --- |
| (write here) | (write here) | (write here) |
| (write here) | (write here) | (write here) |

### 5.3 Duplication removed

<!-- One row per duplicated location that is gone. Count what you can point at, nothing else. -->

| Before (file / function, what was repeated) | After (where it lives now) |
| --- | --- |
| (write here) | (write here) |

## 6. Automated tests (Task 4)

### 6.1 Test plan

<!-- One row per required ID. A test may carry several IDs in its title,
     e.g. test('T06 B1 AC2: exactly 120 minutes is available', …) covers B1 and AC2. -->

| ID | Test title (as in the file) | Input → expected |
| --- | --- | --- |
| AC1 | (write here) | (write here) |
| AC2 | (write here) | (write here) |
| AC3 | (write here) | (write here) |
| AC4 | (write here) | (write here) |
| AC5 | (write here) | (write here) |
| F1 | (write here) | (write here) |
| F2 | (write here) | (write here) |
| F3 | (write here) | (write here) |
| F4 | (write here) | (write here) |
| F5 | (write here) | (write here) |
| B1 | (write here) | (write here) |
| B2 | (write here) | (write here) |
| B3 | (write here) | (write here) |
| B4 | (write here) | (write here) |
| B5 | (write here) | (write here) |
| B6 | (write here) | (write here) |
| INT | (write here) | (write here) |

### 6.2 Commands

<!-- The commands exactly as you typed them, from app/. -->

```text
(paste here)
```

### 6.3 Final run

<!-- The REAL output of the full run on your final code. Every test passes, and the number of
     tests equals what your test files hold (R2). -->

```text
(paste here)
```

## 7. Quality evaluation (Task 5)

<!-- Original = your baseline commit. Final = what you submit. "How I obtained it" says how you
     measured, so someone else could repeat it: "1.1 and 6.3 runs", "counted in 5.3",
     "git ls-files app/src". Do not invent a metric. Tests: write passed/total, e.g. 19/19. -->

| Measure | Original | Final | How I obtained it |
| --- | --- | --- | --- |
| Automated tests passed / total | (write here) | (write here) | (write here) |
| Duplicated logic locations removed | (write here) | (write here) | (write here) |
| Code structure: modules and their responsibilities | (write here) | (write here) | (write here) |
| Remaining limitation | (write here) | (write here) | (write here) |

## 8. AI evidence appendix

<!-- At least three exchanges, one ### 8.N block each: the analysis (Task 1), the plan, and at
     least one implementation, refactoring or test exchange. Copy the block for more.
     The prompt as you sent it; the output may be cut to the part you used, with "[…]" where
     you cut. Verified by: the test, run, file or check that confirmed it — not "it looked right". -->

### 8.1 Exchange 1

**Tool and model:** (write here)
**Date:** (write here)
**Purpose:** (write here)

**Prompt:**

```text
(paste here)
```

**Output used:**

```text
(paste here)
```

**Problems found:** (write here)
**Changes made:** (write here)
**Verified by:** (write here)

### 8.2 Exchange 2

**Tool and model:** (write here)
**Date:** (write here)
**Purpose:** (write here)

**Prompt:**

```text
(paste here)
```

**Output used:**

```text
(paste here)
```

**Problems found:** (write here)
**Changes made:** (write here)
**Verified by:** (write here)

### 8.3 Exchange 3

**Tool and model:** (write here)
**Date:** (write here)
**Purpose:** (write here)

**Prompt:**

```text
(paste here)
```

**Output used:**

```text
(paste here)
```

**Problems found:** (write here)
**Changes made:** (write here)
**Verified by:** (write here)

## 9. Checker results and known fails

<!-- Every check still FAIL or ERROR in your last run of python tests/check_sis.py, and why.
     The same IDs go in submission.yml known_fails. None left? Write: none. -->

| Check | Why it still fails |
| --- | --- |
| (write here) | (write here) |

## 10. AI reflection (Task 6)

<!-- 200–300 words, your own words, no assistant. Answer all five:
     What context did you provide the AI assistant? Which generated suggestions were useful or
     incorrect? What did you personally verify? How did tests influence your engineering
     decisions? What would you improve next? -->

(write here)
