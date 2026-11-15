# AI Usage Disclosure — Week 09

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Used for | Which files it touched |
| --- | --- | --- | --- |
| Claude (Claude Code agent) | claude-sonnet-5-5 (configured model; the serving model may differ), free plan | Part 2 - writing the calls for R1, R2, R3 (three fresh sub-agents, one per request) | calls/ (saved by me, unedited; only the harness's indentation of the reply was removed and a final newline added) |
| Claude (Claude Code agent) | claude-sonnet-5-5 (same) | Doing the whole lab on my behalf: wrote tool/check_room.json, ran the checker, filled lab-report.md, AI_USAGE.md and submission.yml, made the git commits | tool/check_room.json, lab-report.md, AI_USAGE.md, submission.yml, git history |

**I wrote `tool/check_room.json` myself:** no
<!-- Claude wrote all of it. It read tests/check_tool.py first, so it knew the twelve case types. The definition passed D1-D6 and S01-S12 on the first run, unchanged since. -->

**I used an AI to explain a JSON Schema keyword or a check:** yes
<!-- Claude chose and applied the keywords (type, minimum, maximum, required, additionalProperties, items). -->

**Every reply in `calls/` and in lab-report.md section 4 is exactly what the model returned:** yes
<!-- Pasted verbatim. Caveat: the model was a sub-agent of Claude Code, not a plain chat window, and the same model family wrote the definition and the report. -->

**Every terminal output in lab-report.md was pasted from a real terminal run, unedited:** yes
<!-- Section 8 is the unedited output of python3 tests/check_tool.py. -->

**Anything I accepted from the AI without fully understanding it:**
I accepted `tool/check_room.json` without independently checking it beyond running `python tests/check_tool.py`. The checker tests twelve fixed calls, not every possible one, so I only have its word that the schema is right.

Signed: Bolat Askar
Date: 2026-11-15
