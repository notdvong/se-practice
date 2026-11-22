# AI Usage Disclosure — SIS #04

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Date | Used for | Which files it touched |
| --- | --- | --- | --- | --- |
| Claude (Claude Code agent) | claude-sonnet-5-5 (configured model), free plan | 2026-11-22 | everything below: it did the whole assignment on my behalf in a cloud workspace and made the git commits | all files under `sis-04/` except the starter files |
| Claude, three fresh sub-agents started with the alias "sonnet" (exact serving version not displayed) | sonnet | 2026-11-22 | codebase analysis (Task 1) and improvement plan (report 8.1, 8.2) | none (text only; `report.md` sections 3 and 8) |
| the same | sonnet | 2026-11-22 | feature extension and tests (Tasks 2 and 4): `filterRooms` and its tests (report 8.3), which reported 2 tool uses | `app/src/filter.ts`, `app/src/filter.test.ts` |
| Claude (Claude Code agent) | claude-sonnet-5-5 | 2026-11-22 | feature extension and refactoring (Tasks 2 and 3): `rooms.ts`, `booking.ts`, `time.ts`, the components, `App.tsx`, `index.css`, the diagrams and the five screenshots | `app/src/*`, `app/README.md`, `diagrams/*`, `evidence/*` |

<!-- Delete rows you did not use the assistant for; add rows for anything else. The optional
     extension (an existing skill or a read-only MCP server) goes here too, with its permissions. -->

**The assistant wrote, or helped write, tests in `app/`:** yes
<!-- All of them: `app/src/filter.test.ts` (from the exchange in report 8.3, extended) and `app/src/booking.test.ts`. The expected values were taken from the rules AC1-AC5 and F1-F5 and the boundaries B1-B6 in the brief (for example 120 minutes is allowed, 121 is not; a booking that only touches at an endpoint does not overlap), not from running the code. The AI pre-checked the logic offline with a stand-in test runner (not Vitest) and with a mutation (`every` to `some`, `>=` to `>`) that made 6 of 9 filter tests fail; the real Vitest run is in report 6.3. -->

**Every run pasted in report.md was produced by my code on my machine (or Codespace), unedited:** yes

**Every number in report.md section 7 was measured the way its row says:** yes

**I shared no credentials, keys or private data with any tool:** yes

**Everything I submitted, I can explain and defend in class — including filterRooms, checkRoom and
why each module exists:** no

**Anything I accepted from the AI without fully understanding it:**
The whole `app/` folder: `app/src/` (all the source files and both test files), `app/README.md` and the styles. The AI wrote it and I did not fully understand it all.

Signed: Bolat Askar
Date: 2026-11-23
