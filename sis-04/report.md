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
| Vitest version | 3.2.7 |
| Where I ran the tests | GitHub Codespace (default image), branch sis-04 checked out at the baseline commit 1d36742 |

### 1.1 Baseline run

<!-- Before you change anything: run the tests of your starting point inside app/ and paste the
     REAL output. No tests yet (starter, sis-03)? Paste the run anyway: Vitest prints
     "No test files found". That is your honest "original" number, 0/0. -->

```text
@notdvong ➜ /workspaces/se-practice (sis-04) $ git checkout 1d36742
Note: switching to '1d36742'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 1d36742 sis-04: baseline from starter
@notdvong ➜ /workspaces/se-practice (1d36742) $ cd sis-04/app
@notdvong ➜ /workspaces/se-practice/sis-04/app (1d36742) $ npm install

added 104 packages, and audited 105 packages in 34s

19 packages are looking for funding
  run `npm fund` for details

5 vulnerabilities (2 moderate, 1 high, 2 critical)

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
npm warn install-scripts 1 package has install scripts not yet covered by allowScripts:
npm warn install-scripts   esbuild@0.21.5 (postinstall: node install.js)
npm warn install-scripts
npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
npm notice
npm notice New major version of npm available! 11.19.1 -> 12.2.3
npm notice Changelog: https://github.com/npm/cli/releases/tag/v12.2.3
npm notice To update run: npm install -g npm@12.2.3
npm notice
@notdvong ➜ /workspaces/se-practice/sis-04/app (1d36742) $ npx vitest run

 RUN  v3.2.7 /workspaces/se-practice/sis-04/app

No test files found, exiting with code 1

include: **/*.{test,spec}.?(c|m)[jt]s?(x)
exclude:  **/node_modules/**, **/dist/**, **/cypress/**, **/.{idea,git,cache,output,temp}/**, **/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*

@notdvong ➜ /workspaces/se-practice/sis-04/app (1d36742) $
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

The catalog has 5 fictional rooms in `src/rooms.ts` (A-101, B-204, C-310, D-015, E-220), each with id, name, capacity, an equipment list, a `blocked` flag and its own bookings. The equipment names are projector, whiteboard, video-conference, computers and microphone. The page has an attendees field and one checkbox per equipment item; `filterRooms` keeps rooms with capacity >= attendees (F1) that have ALL ticked items (F2). Matching rooms are shown as cards; the blocked room (D-015) stays in the list with a "Blocked" badge, and `checkRoom` never reports it available (F3). When no room matches, the list is replaced by the message "No rooms match these filters. Lower the number of attendees or untick some equipment." (F4). Choosing another room while an answer is on screen re-runs the check for that room with the same times (F5); an answer is also tied to the room it was computed for, so it is never shown for a different room, and if a filter hides the selected room the button reads "Select a room first".

### 4.2 Demonstration

<!-- One row per screenshot in evidence/. Say what is on it: the filter values, the rooms shown,
     the room selected, the times entered and the result. -->

| Screenshot | What it shows |
| --- | --- |
| `evidence/filter-match.png` | Attendees = 10 and "projector" ticked: only Lab C-310 (30 seats) and Hall E-220 (120 seats) are listed. Room A-101 has a projector but only 8 seats, and Room B-204 has 12 seats but no projector. |
| `evidence/filter-empty.png` | Attendees = 10 with projector, computers and microphone all ticked: no room has all three, so the list is replaced by the empty-state message "No rooms match these filters. Lower the number of attendees or untick some equipment." (F4). |
| `evidence/switch-a.png` | Room A-101 selected, current time 09:00, request 10:00 to 11:00. A-101 is already booked 10:00-11:00, so the page shows "Unavailable" with the hint text, and the bookings list shows 10:00-11:00. |
| `evidence/switch-b.png` | The same times (09:00, 10:00 to 11:00) with Room B-204 selected by clicking it, without pressing the button again: the page now shows "Available" and the bookings list shows "none" (F5, a different result for another room). |
| `evidence/narrow.png` | Phone width 390 x 844, portrait: the fields stack in one column, the room cards are one per row, the button is full width, and Room A-101 at 10:00 to 11:00 shows "Unavailable". The browser reported scrollWidth 390 = window width 390, so there is no horizontal scrolling (AC6). |

*How the screenshots were made:* in the AI's workspace, `npm install` was not possible, so the page was bundled with esbuild (against React 19.2.8, whereas `package.json` says React ^18.3.1) and driven with Playwright in Chromium; the source files are the committed ones. They can be retaken with `npm run dev`.

## 5. Refactoring (Task 3)

<!-- The diagrams are diagrams/before.puml and diagrams/after.puml (README section 8). -->

### 5.1 Module responsibilities after

| Module or component | Responsibility |
| --- | --- |
| `src/rooms.ts` | Data only: the `Room` and `Interval` types, the `ROOMS` catalog (5 rooms) and `EQUIPMENT`, the list of equipment names for the checkboxes. No rule. |
| `src/booking.ts` | The availability rules: `canBook` (AC1-AC5, returns a Boolean, changes nothing) and `checkRoom`, which finds the chosen room and calls `canBook` with that room's own `blocked` and `bookings` (F3, F5). |
| `src/filter.ts` | `filterRooms`: capacity >= attendees (F1) and ALL selected equipment (F2); an empty result is the F4 case. |
| `src/App.tsx` | The page: holds the form state, calls `filterRooms` and `checkRoom`, ties the answer to the selected room. No room data and no rule. |
| `src/components/FilterPanel.tsx`, `RoomList.tsx`, `CheckPanel.tsx`, `BookingList.tsx` | Presentation only: the filters, the room cards with the blocked label and the empty state, the times form with the answer, and the chosen room's bookings. |
| `src/time.ts` | "HH:MM" text to minutes after midnight and back, for the form and the bookings list. |

### 5.2 Design decisions

<!-- At least two. The alternative is what you could have done instead (often what the assistant
     proposed). The why names an AC, an F-rule, a test or a risk from 3.1. -->

| Decision | Alternative I did not take | Why |
| --- | --- | --- |
| Blocked rooms stay in the filtered list with a "Blocked" badge | Hiding blocked rooms inside `filterRooms` | F3 is decided per room by `checkRoom`, so keeping the room visible lets the page and the F3 and INT tests show it is Unavailable; hiding it would leave users unable to see why a room is missing. |
| Keep the "Check" button, but tie each answer to the room it was computed for and re-run it when another room is chosen | Compute the answer at render time with no stored result (the assistant's first suggestion), or only clear it on a room change | The brief's F5 says "refresh appropriately": re-running with the same times gives the switch-a / switch-b pair, and the `answer.roomId` guard means a stale answer can never show for another room (risk 3). |
| `canBook` stays a Boolean; the page shows one generic hint listing the rules, built from `MAX_MINUTES` | `canBook` returns an outcome with a reason code, so the page could name the exact broken rule | The brief fixes `canBook` as unchanged with a Boolean result and B1-B4 assert `toBe(true/false)`; a reason code would change the signature the AC1-AC5 tests depend on (3.3). The cost is a less specific message. |

### 5.3 Duplication removed

<!-- One row per duplicated location that is gone. Count what you can point at, nothing else. -->

| Before (file / function, what was repeated) | After (where it lives now) |
| --- | --- |
| `src/App.tsx` `check()` in the starter: the start-before-end condition was written twice, as `!(s < e)` for the error message (line 43) and inside `0 <= s && s < e && e <= 1440` in the rule chain (line 50) | Once, in `canBook()` in `src/booking.ts`: `0 <= start && start < end && end <= MINUTES_PER_DAY`. The page no longer tests it (`grep -rn "start < end\|s < e"` over the final non-test source finds only that line and a comment). |

*Searched for others:* repeated time parsing, rule checks and list rendering in every file under `app/src` of the starter; I found no other repeated location, so the count is 1.

## 6. Automated tests (Task 4)

### 6.1 Test plan

<!-- One row per required ID. A test may carry several IDs in its title,
     e.g. test('T06 B1 AC2: exactly 120 minutes is available', …) covers B1 and AC2. -->

| ID | Test title (as in the file) | Input → expected |
| --- | --- | --- |
| AC1 | AC1 a request that starts and ends at the same minute is rejected | start 600, end 600, now 540, free room -> false (also: end before start, start in the past, start = now -> false; end 1440 -> true) |
| AC2 | B1 AC2 exactly 120 minutes (720-840) is available | 720-840, no bookings -> true |
| AC3 | AC3 a blocked room is rejected even when the slot is free | 600-660, blocked true, no bookings -> false |
| AC4 | B4 AC4 overlapping an existing booking (630-690 vs 660-720) is rejected | 630-690 against booking 660-720 -> false (also: a request containing the booking -> false) |
| AC5 | AC5 canBook leaves the bookings it was given unchanged | a deep copy of the bookings equals the bookings after the call |
| F1 | F1 rooms with capacity at least the attendees are kept | 10 attendees, no equipment -> r3 (12 seats) and r4 (20 seats) only |
| F2 | F2 a room must have all selected equipment, not just any | tv + whiteboard -> r2 and r4 only (r1 has only tv, r3 has only whiteboard) |
| F3 | F3 a blocked room is never available, even for a valid free slot | checkRoom on the blocked room y2, 720-780 -> false |
| F4 | F4 returns an empty array when nothing matches | 21 attendees -> [] |
| F5 | F5 the same times give different answers for different rooms: each uses its own bookings | 600-660: room x1 (booked 600-660) -> false, room z3 (no bookings) -> true |
| B1 | B1 AC2 exactly 120 minutes (720-840) is available | 120 minutes -> true |
| B2 | B2 AC2 121 minutes (720-841) is rejected | 121 minutes -> false |
| B3 | B3 AC4 touching an existing booking at its start (600-660 vs 660-720) is available | 600-660 vs booking 660-720 -> true (and 720-780 -> true) |
| B4 | B4 AC4 overlapping an existing booking (630-690 vs 660-720) is rejected | 630-690 vs 660-720 -> false |
| B5 | B5 a room whose capacity equals the attendees is included | 8 attendees, room of 8 seats (r2) -> included |
| B6 | B6 a room whose capacity is one below the attendees is excluded | 9 attendees, room of 8 seats (r2) -> excluded |
| INT | INT filterRooms then checkRoom on what it returned | 10 attendees + projector -> x1, y2; checkRoom 660-720: x1 true, y2 false (blocked), z3 false (not in the list) |

### 6.2 Commands

<!-- The commands exactly as you typed them, from app/. -->

```text
cd sis-04/app
npm install
npx vitest run
```

### 6.3 Final run

<!-- The REAL output of the full run on your final code. Every test passes, and the number of
     tests equals what your test files hold (R2). -->

```text
@notdvong ➜ /workspaces/se-practice/sis-04/app (1d36742) $ cd ../..
@notdvong ➜ /workspaces/se-practice (1d36742) $ git checkout sis-04
Previous HEAD position was 1d36742 sis-04: baseline from starter
Switched to branch 'sis-04'
Your branch is up to date with 'origin/sis-04'.
@notdvong ➜ /workspaces/se-practice (sis-04) $ cd sis-04/app
@notdvong ➜ /workspaces/se-practice/sis-04/app (sis-04) $ npx vitest run

 RUN  v3.2.7 /workspaces/se-practice/sis-04/app

 ✓ src/booking.test.ts (18 tests) 7ms
 ✓ src/filter.test.ts (9 tests) 9ms

 Test Files  2 passed (2)
      Tests  27 passed (27)
   Start at  21:41:41
   Duration  822ms (transform 130ms, setup 0ms, collect 156ms, tests 15ms, environment 1ms, prepare 254ms)

@notdvong ➜ /workspaces/se-practice/sis-04/app (sis-04) $
```

## 7. Quality evaluation (Task 5)

<!-- Original = your baseline commit. Final = what you submit. "How I obtained it" says how you
     measured, so someone else could repeat it: "1.1 and 6.3 runs", "counted in 5.3",
     "git ls-files app/src". Do not invent a metric. Tests: write passed/total, e.g. 19/19. -->

| Measure | Original | Final | How I obtained it |
| --- | --- | --- | --- |
| Automated tests passed / total | 0/0 | 27/27 | the run in 1.1 ("No test files found") and the run in 6.3 ("27 passed (27)") |
| Duplicated logic locations removed | 1 duplicated location: the start-before-end condition written twice in `check()` (lines 43 and 50) | 0 left; the condition is written once, in `canBook` | counted in 5.3; `git show 1d36742:sis-04/app/src/App.tsx \| grep -n "s < e"` for the original and `grep -rn "start < end\|s < e"` over the final non-test source |
| Code structure: modules and their responsibilities | 3 source files; `App.tsx` held the data, the rules and the page | 13 source files: `rooms.ts` (data), `filter.ts`, `booking.ts` (rules), `time.ts`, `App.tsx` and four components (presentation), 2 test files | `git ls-tree -r --name-only 1d36742 sis-04/app` and `git ls-files sis-04/app/src`; responsibilities in 5.1 |
| Remaining limitation | no tests at all, so nothing was checked automatically | no automated test renders the page: the F4 empty state, the F5 refresh on room change and the narrow layout are checked only by a manual browser run and the screenshots, because jsdom and Testing Library are not in `package.json`; Vitest covers `filterRooms`, `canBook` and `checkRoom` | I looked for rendering tests in the two test files and `package.json`; the browser run is in 4.2 |

## 8. AI evidence appendix

<!-- At least three exchanges, one ### 8.N block each: the analysis (Task 1), the plan, and at
     least one implementation, refactoring or test exchange. Copy the block for more.
     The prompt as you sent it; the output may be cut to the part you used, with "[…]" where
     you cut. Verified by: the test, run, file or check that confirmed it — not "it looked right". -->

### 8.1 Exchange 1

**Tool and model:** claude-sonnet-5-5 session, chat run by a fresh sub-agent started with the alias "sonnet" (exact serving version not displayed)
**Date:** 2026-11-22
**Purpose:** Analysis (Task 1): the context message from 2.2, asking for maintainability risks and a plan

**Prompt:**

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

**Output used:**

```text
| R1 | **Rules, validation and UI state are tangled.** The AC1-AC4 rules can't be tested or reused without rendering React. | `App.tsx`, `check()` | `check()` calls `setError` or `setResult` inside the rule branches. [...] | High |
| R3 | **Room data is hard-wired.** Rules depend on `ROOMS`, so F5 (use the chosen room's own bookings) can break. | `App.tsx`, `ROOMS` and wherever `roomId` is used | Look for `ROOMS[0]`, an index lookup instead of an id lookup [...] | High |
| R4 | **Stale result when the room changes (F5).** | `App.tsx`, `result` and `error` state | `result` is set only in the button handler. There is no recompute when `roomId` changes, and `setRoomId` doesn't clear `result` or `error`. | High |
| R6 | **Possible mutation of booking data (AC5).** | `check()` or the JSX that lists bookings | Look for `.push`, `.sort` or `.splice` on `bookings`, or assignment into `ROOMS`. [...] | Medium |
| R7 | **Blocked state is duplicated.** The form has a "blocked" checkbox, and the room has its own `blocked` field. | `App.tsx` form state, `ROOMS` | Check whether the checkbox is a user-set test input or stands in for the room's status. F3 says the room's status must win. Decide and write down how the two combine, for example `room.blocked || checkbox`, without changing AC3's meaning. | Medium |
[...]
3. **Extract `canBook` into `src/booking.ts`.** Move `toMinutes`, `fmt`, the 120 constant and the rule checks. Keep the same order of checks and the same messages. It takes `{ start, end, now, blocked, bookings }` and returns a value. It must not set state. `App.tsx` calls it.
[...]
Ask me for step-by-step help with any of these once you've checked the evidence in section 1.
```

**Problems found:** The assistant could not see my code, so its risks were hypotheses. R3 (index lookup) was false: `App.tsx` finds the room by id. R6 (mutation of bookings) was false: there is no push, sort or splice. R7 understated the problem: `room.blocked` is never read at all, only the checkbox. It also missed the contradictory error-plus-Unavailable display.
**Changes made:** Kept R1, R2 (no tests), R4 (stale result) and R7 (as risk 2 in 3.1), dropped R3 and R6, and added two risks the assistant did not name: the duplicated start-before-end rule with contradictory feedback (risk 4) and the non-null assertion (risk 6).
**Verified by:** Reading `App.tsx`; `grep -c "room.blocked" src/App.tsx` printed 0; `git ls-files` showed no test file; and a browser run of the starter (Playwright, Chromium): A-101 10:00-11:00 gave "Unavailable", switching to B-204 without pressing the button still showed "Unavailable", and start 12:00 / end 11:00 showed both the error and "Unavailable".

### 8.2 Exchange 2

**Tool and model:** same as 8.1 (the same chat, continued with a follow-up message)
**Date:** 2026-11-22
**Purpose:** The plan: revise the plan using the facts I verified

**Prompt:**

```text
Thanks. I checked your risks against the real App.tsx. Findings: R2 true (no tests; the test script is already "vitest run"). R3 false: the room is found by id (ROOMS.find(r => r.id === roomId)!), not by index, and bookings come from that room. R4 true: setRoomId does not clear result. R6 false: no push, sort or splice on bookings anywhere. R7 is worse than you guessed: check() never reads room.blocked at all, only the checkbox state "blocked". Also new: when start >= end, check() calls setError(...) but carries on and also sets result to false, so the page shows both an error and "Unavailable". The start-before-end condition is therefore written twice (the error branch and the 0 <= s && s < e && e <= 1440 test in the rule chain).

Please give me a revised plan of at most 8 numbered steps, smallest safe step first, that takes these verified facts into account. For each step say which file it touches and which Vitest test IDs (AC1-AC5, F1-F5, B1-B6, INT) it should be covered by. Keep the Check availability button flow. No code.
```

**Output used:**

```text
Your findings change the plan in three ways:
- **R3 and R6 drop out.** [...]
- **R7 becomes a real defect.** `check()` ignores `room.blocked`, so F3 currently fails. This is a deliberate behaviour change, and it gets its own step.
[...]
You didn't define B1-B6, so I assumed the following. Tell me if your IDs differ and I'll remap them.
- **B1:** start equals end.
- **B2:** start equals now, and start one minute before now.
- **B3:** duration exactly 120 versus 121.
- **B4:** a request ending exactly where a booking starts (touching).
- **B5:** a request starting exactly where a booking ends (touching).
- **B6:** `endOfDay` at the 1440 limit, and the `e <= 1440` edge.
- **INT:** a rendered-App test. It needs `@testing-library/react` and `jsdom`, which are not in your dependencies today. [...]
[...]
3. **Add `checkRoom(rooms, roomId, { start, end, now })` to `src/booking.ts` and make F3 true.**
   - It finds the room by id and uses that room's `bookings`. It passes `blocked = room.blocked || checkbox`, so the existing checkbox still works for AC3 while the room's own status now counts.
[...]
2. **Extract `canBook` into a new `src/booking.ts`.** [...] `canBook` is pure: it takes `{ start, end, now, blocked, bookings }` and returns an outcome with a reason code. It sets no state.
```

**Problems found:** It guessed B1-B6 (my message gave no IDs, so its legend does not match the assignment's tests); it proposed `blocked = room.blocked || checkbox`, which keeps the page-level checkbox; it proposed that `canBook` return "an outcome with a reason code"; and it suggested a rendered-App INT test needing jsdom and testing-library, which are not in `package.json`.
**Changes made:** Wrote my own 7-step plan in 3.2 using its order for the first steps; removed the checkbox and used only the room's own `blocked`; kept `canBook` as a Boolean; made INT a plain-function test (`filterRooms` then `checkRoom`). Both rejected suggestions are in 3.3.
**Verified by:** The README's fixed signature `canBook({ start, end, now, blocked, bookings })` and `checkRoom(rooms, roomId, { start, end, now })`; the tests F3, F5 and INT in `src/booking.test.ts`; and the final real run in 6.3.

### 8.3 Exchange 3

**Tool and model:** claude-sonnet-5-5 session, chat run by a fresh sub-agent started with the alias "sonnet" (exact serving version not displayed); it reported 2 tool uses, so it may have read files in the workspace
**Date:** 2026-11-22
**Purpose:** Implementation and tests (Task 2 and Task 4): filterRooms and its tests for F1, F2, F4, B5, B6

**Prompt:**

```text
Write two TypeScript files for a Vite + Vitest project. Reply with exactly the two files, each in its own code block, no other prose.

File 1: src/filter.ts. It exports
  filterRooms(rooms: Room[], criteria: { attendees: number; equipment: string[] }): Room[]
where Room is imported with `import type { Room } from './rooms'` and is
  type Room = { id: string; name: string; capacity: number; equipment: string[]; blocked: boolean; bookings: { start: number; end: number }[] };
Rules from the requirements:
  F1 a room is kept only if its capacity is greater than or equal to the requested attendees.
  F2 a room is kept only if it has ALL of the selected equipment items (not just any of them). An empty equipment list means no equipment filter.
  F4 when nothing matches, return an empty array.
Blocked rooms are NOT removed by this function (the page labels them). The function must not change its input.

File 2: src/filter.test.ts. Vitest tests (import { test, expect } from 'vitest' and import { filterRooms } from './filter'). Rules: no mocks, no test.skip / test.only / test.each, one test() per case, and a fixed catalog of 4 rooms declared inside the test file (do not import ROOMS). Put these IDs as words in the test titles: F1, F2, F4, B5, B6, where B5 = a room whose capacity is exactly equal to the attendees is included, and B6 = a room whose capacity is one below the attendees is excluded. Expected values must come from the rules above, never from running the code.
```

**Output used:**

```text
```ts
import type { Room } from './rooms';

export function filterRooms(
  rooms: Room[],
  criteria: { attendees: number; equipment: string[] },
): Room[] {
  const { attendees, equipment } = criteria;
  return rooms.filter(
    (room) =>
      room.capacity >= attendees &&
      equipment.every((item) => room.equipment.includes(item)),
  );
}
```
[... src/filter.test.ts: eight tests with titles F1, F2, F2 (empty list), F4, B5, B6, "blocked rooms are not removed by the filter" and "the input catalog is not changed" ...]
```

**Problems found:** No wrong logic found: `every` (not `some`) is used for F2 and `>=` for F1. Weaknesses: the test catalog was untyped, there was no test with three selected items, and the sub-agent used tools although none were needed.
**Changes made:** Typed the catalog as `Room[]` and added the test "F2 three selected items leave only the room that has all three" to `src/filter.test.ts`; used `src/filter.ts` unchanged.
**Verified by:** I read the expected values against rules F1, F2, F4 from the brief, not from the code; a stand-in test runner used by the AI (not Vitest, not evidence) passed the 9 filter tests, and the same tests failed 6 of 9 when I changed `every` to `some` and `>=` to `>` in a copy; and the real run in 6.3.

## 9. Checker results and known fails

<!-- Every check still FAIL or ERROR in your last run of python tests/check_sis.py, and why.
     The same IDs go in submission.yml known_fails. None left? Write: none. -->

| Check | Why it still fails |
| --- | --- |
| L10 | Section 10 has 198 words and the brief asks for 200-300. It is the student's own reflection with the sentences that were not true removed (they described checks the AI had made); the student chose not to add more, so it stays 2 words short. |

## 10. AI reflection (Task 6)

<!-- 200–300 words, your own words, no assistant. Answer all five:
     What context did you provide the AI assistant? Which generated suggestions were useful or
     incorrect? What did you personally verify? How did tests influence your engineering
     decisions? What would you improve next? -->

For this assignment, I provided the assistant with the structure of the project, the requirements (AC1-AC6, F1-F5), and the primary restrictions. I also provided a description of the project to ensure the assistant had the necessary information before suggesting any changes to the project. Some of the suggestions provided by the AI were incorrect for the project. For example, the suggestion regarding the risks associated with R3 and R6, the idea to use the room.blocked || checkbox, the suggestion regarding the reason-code for the canBook function, and the suggestions regarding the tests for B1 to B6 were all incorrect. However, the suggestions regarding the order in which to complete the tasks and the filterRooms function were helpful. The tests for B1 and B2 ensured that the 120-minute booking limit was enforced. The tests for B3 and B4 confirmed that bookings could touch but not overlap. If I had more time to complete this project, I would implement additional tests to automatically check for F4 and F5. Additionally, I would implement a specific error message to be displayed to the user for each booking rule that fails. The AI was able to save me time in completing this project.
