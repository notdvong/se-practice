# Week 09 — Lab Report: canBook as a Tool

Fill in every section. Do not delete or renumber the headings: the README and the checker point at
them. Replace every `<!-- comment -->` with your own text (comments are ignored by the checker).

**Name:** [STUDENT NAME - fill in]
**Student ID:** [FILL IN]
**GitHub:** [FILL IN]

---

## 1. Setup

| | |
| --- | --- |
| Assistant (frozen for the whole lab) | Claude (Anthropic), used through Claude Code; each request was sent to a separate fresh sub-agent |
| Exact model (or "not displayed") | claude-sonnet-5-5 (the configured model; the session notes say the serving model can differ, so this is the configured identifier, not a verified one) |
| Three fresh chats for R1, R2, R3? (yes / no) | yes - three separate sub-agents, each given only the prompt, the JSON and one request (not plain chat windows; see §4 and AI_USAGE.md) |
| Python version (`python --version`) | Python 3.13.18 (run as `python3`) |

## 2. Your tool definition — a reason for every constraint

Paste your final `tool/check_room.json`, then fill the table: one row per constraint you wrote.

```json
{
  "name": "check_room",
  "description": "Checks whether a room can be booked for a requested time slot and answers Available or Unavailable. All times are whole minutes since midnight, from 0 to 1440 (10:00 is 600, 24:00 is 1440). This tool only checks: it does not save, create or change any booking.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "start": {
        "type": "integer",
        "minimum": 0,
        "maximum": 1440,
        "description": "Requested start, in whole minutes since midnight (10:00 = 600)."
      },
      "end": {
        "type": "integer",
        "minimum": 0,
        "maximum": 1440,
        "description": "Requested end, in whole minutes since midnight (24:00 = 1440)."
      },
      "now": {
        "type": "integer",
        "minimum": 0,
        "maximum": 1440,
        "description": "The current time, in whole minutes since midnight."
      },
      "blocked": {
        "type": "boolean",
        "description": "true if the room is blocked (for example for maintenance), otherwise false."
      },
      "bookings": {
        "type": "array",
        "description": "Existing bookings of the room; an empty list if there are none.",
        "items": {
          "type": "object",
          "properties": {
            "start": { "type": "integer", "minimum": 0, "maximum": 1440, "description": "Booking start, in minutes since midnight." },
            "end": { "type": "integer", "minimum": 0, "maximum": 1440, "description": "Booking end, in minutes since midnight." }
          },
          "required": ["start", "end"],
          "additionalProperties": false
        }
      }
    },
    "required": ["start", "end", "now", "blocked", "bookings"],
    "additionalProperties": false
  }
}
```

| Field | Constraint | What goes wrong without it |
| --- | --- | --- |
| start, end, now | `"type": "integer"` | A model sends `"11:00"` (S03) or `600.5` (S10). The function works in whole minutes, so a string or a fraction has no meaning. |
| start, end, now | `"minimum": 0` | `-30` (S06) passes shape but is before midnight, so it is not a time of day. |
| start, end, now | `"maximum": 1440` | `1500` (S07) is past 24:00. 1440 itself stays allowed because it means 24:00 (S11). |
| blocked | `"type": "boolean"` | `"false"` (S09) is a non-empty string; code that treats it as truthy would read the room as blocked. |
| bookings | `"type": "array"` with `items` | A single object, or a list of pairs `[660, 720]` (S12), cannot be read as bookings. No `minItems`, because an empty list must be valid (S02). |
| bookings[] | `required: ["start","end"]` | `{ "start": 660 }` (S08) has no end, so overlap cannot be computed. |
| bookings[] | `additionalProperties: false` | A made-up key inside a booking would be silently ignored instead of refused. |
| whole object | `required` = all five fields | A missing `now` (S04) forces the function to guess the time of day. The prompt tells the model to ask instead. |
| whole object | `additionalProperties: false` | An invented `room` field (S05) would be dropped silently and the caller would think it was used. |
| description | 25+ words, says minutes, 0-1440, "does not save" | A model that has never seen the course must know the unit and the range, and must know that calling the tool books nothing (AC5). The description sets no rule the schema does not enforce, except AC5, which is a statement about behaviour. |

## 3. The twelve calls — first run and final run

Two runs came before the final one, and I report both.

**Baseline** (the starter files, before I wrote anything; the empty schema `properties: {}`, `required: []` accepts every call): 6 PASS, 17 FAIL, 7 ERROR. S01, S02 and S11 passed and the nine refuse-cases S03-S10 and S12 FAILED because the empty schema accepted them.

**First run with my definition** (commit 5d6723f, before any change to the schema): all twelve S cases PASS, so `first_run_s_fails` is 0. Nothing was fixed afterwards: the final definition is the first draft, byte for byte. A clean first run needs an honest caveat: I had read `tests/check_tool.py` before writing the schema, so I already knew the twelve kinds of malformed call. I did not discover them by failing.

| Case | First run (my definition) | Final run | What you changed |
| --- | --- | --- | --- |
| S01 | PASS | PASS | nothing (baseline with the empty schema: PASS) |
| S02 | PASS | PASS | nothing (baseline with the empty schema: PASS) |
| S03 | PASS | PASS | nothing (baseline with the empty schema: FAIL) |
| S04 | PASS | PASS | nothing (baseline with the empty schema: FAIL) |
| S05 | PASS | PASS | nothing (baseline with the empty schema: FAIL) |
| S06 | PASS | PASS | nothing (baseline with the empty schema: FAIL) |
| S07 | PASS | PASS | nothing (baseline with the empty schema: FAIL) |
| S08 | PASS | PASS | nothing (baseline with the empty schema: FAIL) |
| S09 | PASS | PASS | nothing (baseline with the empty schema: FAIL) |
| S10 | PASS | PASS | nothing (baseline with the empty schema: FAIL) |
| S11 | PASS | PASS | nothing (baseline with the empty schema: PASS) |
| S12 | PASS | PASS | nothing (baseline with the empty schema: FAIL) |

## 4. Function calling — what the model wrote

For each request, paste the model's reply exactly, then judge it against the request.

### R1

```text
{"name": "check_room", "arguments": {"start": 600, "end": 660, "now": 540, "blocked": false, "bookings": [{"start": 660, "end": 720}]}}
```

Matches the expected arguments (F3 PASS). Every number is right: 10:00 = 600, 11:00 = 660, 9:00 = 540, and the booking 11:00-12:00 = 660-720. It touches the booking at 660, which AC4 allows, so `canBook` would say Available; the model did not need to know that. No mismatch to judge.

### R2

```text
{"name": "check_room", "arguments": {"start": 840, "end": 990, "now": 810, "blocked": true, "bookings": []}}
```

Matches the expected arguments (F6 PASS). 14:00 = 840, 16:30 = 990 (it did not read 16:30 as 960), 13:30 = 810. The model called the tool with `blocked: true` and did not refuse or answer Unavailable itself. That is the right division: the call is well-formed, and the verdict (Unavailable under AC3) belongs to `canBook`. The schema accepted `blocked: true`, as it should. The model's `end - start` is 150 minutes, over the 120-minute limit (AC2), so the room would be Unavailable for two reasons, and neither is visible to the schema.

### R3

```text
What start and end times do you want tomorrow (for example 13:00 to 15:00)? I also need the current time, whether the room is blocked, and its existing bookings, if any.
```

Saved as `calls/r3.txt`; the model asked and did not call. Missing from the request: the exact start and end ("afternoon" and "a couple of hours" are vague), the current time `now`, whether the room is `blocked`, and the `bookings`. The model invented no values and listed four of the five fields it needed. It did not follow "one short question" strictly: it asked a compound question, and it offered an example (13:00 to 15:00), which is a suggestion, not a guess in an argument. One finding about my own definition: the tool has no date, because every time is minutes since midnight today, so "tomorrow" cannot be expressed at all. The model asked for times and never noticed that the tool cannot represent tomorrow. That gap is in the tool, not in the model.

Limits of this evidence: one sample per request. The replies came from sub-agents of the Claude Code harness, which carry a longer system prompt than a plain chat, and the same model family wrote the definition. A different assistant, or a second run of R3, could invent values.

## 5. What the schema cannot check

With the allowed keywords a schema looks at one value at a time (its type, its range, which keys exist). It cannot compare two values or look inside a list against another value. So these stay in `canBook`:

- **AC1, the relational part:** `start < end` and "start after `now`". They compare two fields, and a schema cannot. What the schema CAN do for AC1 is the range of each field alone: `0 <= start`, `end <= 1440`, whole numbers. `start = end = 600` is a valid call (README Main message).
- **AC2:** at most 120 minutes is `end - start`, arithmetic on two fields. R2's 150 minutes is schema-valid.
- **AC3:** a blocked room is Unavailable. `blocked: true` is a valid boolean, and R2 shows it must be accepted: the call is correct and the answer is Unavailable. If the schema forced `blocked` to `false` it would refuse a legitimate call instead of letting the function answer.
- **AC4:** no overlap means comparing the requested slot with every booking in the list, which needs cross-field comparison. Touching allowed (R1: 660 equals 660) is also a comparison.
- **AC5:** not saving anything is a behaviour of the code, not a shape of the input. My description says it, but nothing in the schema enforces it.
- **AC6:** the page's feedback text is output, and the input schema does not constrain output.

Reason in one line: a schema checks shape, never meaning.

## 6. Permissions — allow, ask or block

| # | Action | Decision (allow / ask / block) | Reason (the risk, in one sentence or more) |
| --- | --- | --- | --- |
| A1 | call `check_room` with the times the user just typed | allow | check_room only computes an answer and saves nothing (AC5), so the worst case is a wrong Available/Unavailable, and the schema already refuses malformed times before it runs. |
| A2 | read `week-08/app/src/booking.ts` | allow | Reading a source file changes nothing and stays inside the repository; the only risk is exposing a secret that was committed by mistake, which a source file should not contain. |
| A3 | edit `booking.ts` to raise the 120-minute limit to 180 | ask | The 120-minute limit is AC2, a business rule, and one user asking for three hours is not authority to change it for everyone, so a human must approve and the Week 08 tests would need updating too. |
| A4 | run `npm test` in `week-08/app` | allow | Tests run locally on the user's own code and show whether the agent broke anything; the risk is that npm executes scripts from package.json, so this becomes ask if the agent has edited package.json or installs a new dependency. |
| A5 | run `git reset --hard` to undo its own last three edits | ask | git reset --hard permanently discards uncommitted changes, including the user's own work mixed with the agent's three edits, and uncommitted work cannot be recovered from the reflog; it is safe only with a checkpoint commit (section 7) and the user's approval. |
| A6 | `git commit` its change on the `week-09` branch | allow | A commit on the week-09 branch is local and reversible with git reset or git revert, and it creates the checkpoints that make other actions recoverable; the agent must not commit secrets or touch other branches. |
| A7 | `git push` to `main` | block | Pushing to main publishes unreviewed changes to the shared branch and skips the pull request, this course says never to merge, and a push is hard to undo once others have pulled it. |
| A8 | send the contents of `.env` to an MCP server it found online | block | Sending .env to an unknown server found online hands API keys and passwords to a stranger, it is a classic prompt-injection pattern, and the only fix afterwards is rotating every secret; no stated purpose justifies it. |

## 7. Checkpoint

Checkpoint commit: **058d62d** ("Week 09: save the three model replies (R1, R2, R3) exactly as returned"), taken from `git log --oneline` on the `week-09` branch. It is a clean tree: the working tool definition and the three saved replies, with all three S/F results already recorded, before any agent is allowed to edit.

Command back to it:

```bash
git reset --hard 058d62d
```

What it throws away: every uncommitted change to tracked files, and every commit made after 058d62d on this branch (the branch pointer moves back). Untracked files are not removed by this command (that would be `git clean`). The discarded commits stay reachable through `git reflog` for a while; the uncommitted changes do not. That is why the checkpoint is made first.

## 8. Checker output

Paste the **whole** output of your last `python tests/check_tool.py`, unedited.

```text
PASS  D1    tool/check_room.json exists and is valid JSON
PASS  D2    has name, description and inputSchema
PASS  D3    name is exactly "check_room"
PASS  D4    description: 25+ words, says minutes, 1440, and that it does not save
PASS  D5    inputSchema: an object with exactly the five fields, all required
PASS  D6    inputSchema uses only the keywords listed in README section 5
PASS  S01   the R1 call, valid -> accept
PASS  S02   no existing bookings: bookings = [] -> accept
PASS  S03   end as a string: "11:00" -> refuse
PASS  S04   now missing -> refuse
PASS  S05   an extra field: "room": "204" -> refuse
PASS  S06   start below the day: -30 -> refuse
PASS  S07   end beyond the day: 1500 -> refuse
PASS  S08   a booking with no end: {start: 660} -> refuse
PASS  S09   blocked as a string: "false" -> refuse
PASS  S10   start not a whole minute: 600.5 -> refuse
PASS  S11   end at the end of the day: 1440 -> accept
PASS  S12   a booking as a pair: [660, 720] -> refuse
PASS  F1    calls/r1.json: a call to check_room
PASS  F2    calls/r1.json: arguments valid against your schema
PASS  F3    calls/r1.json: arguments equal the expected ones (README section 5, Part 2)
PASS  F4    calls/r2.json: a call to check_room
PASS  F5    calls/r2.json: arguments valid against your schema
PASS  F6    calls/r2.json: arguments equal the expected ones (README section 5, Part 2)
PASS  F7    calls/r3: exactly one of r3.json (it called) or r3.txt (it asked), not empty
PASS  L1    section 5 names at least two acceptance criteria (AC1-AC6) the schema cannot check
PASS  L2    section 6: A1-A8 each have allow / ask / block and a reason of 5+ words
PASS  L3    section 7 names the checkpoint commit (a SHA)
PASS  L4    section 10: a conclusion of 80-150 words
PASS  L5    AI_USAGE.md filled in (a tool row, and signed)

SUMMARY: 30 PASS · 0 FAIL · 0 ERROR  (of 30 checks)
Paste this whole output into lab-report.md section 8, and these three numbers into submission.yml.
```

## 9. What still fails

None: the final checker run is 30 PASS, 0 FAIL, 0 ERROR, and `known_fails` is `[]`. The earlier FAILs came from the empty starter files (baseline, §3) and were fixed by writing the definition, the saved replies, and this report. Things the checker cannot see and I want to state: (1) the replies come from sub-agents, not plain chat windows (§1, §4); (2) the placeholders for name, student ID and GitHub username must be filled in by the student before submitting; the checker does not look at them, but `validate_submission.py` does; (3) there was no real `se-practice` remote in my workspace, so `main` here is a placeholder and the PR could not be opened from here.

## 10. Conclusion (80–150 words)

The schema, the model and the function each own a different kind of error. The schema refused all nine malformed calls (S03 string time, S05 extra `room`, S12 pair booking), yet it accepted R2, a correct call that `canBook` must answer Unavailable. The model converted every time correctly in R1 and R2 and asked instead of guessing in R3, but it never noticed my tool has no date, so "tomorrow" cannot be expressed. Only the function can check `start < end`, the 120-minute limit and overlaps. For an agent, the line is risk: reading and committing are cheap to undo, `reset --hard` needs a checkpoint, and pushing to main or sending `.env` (A7, A8) must be blocked.
