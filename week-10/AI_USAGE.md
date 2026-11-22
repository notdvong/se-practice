# AI Usage Disclosure — Week 10

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
The assistant reconstructed a project because no earlier Smart Campus app was present in the submitted Week 06 or Week 08 archives or in the connected repository. The student remains responsible for reviewing the claims, checking the code and understanding the final changes before submission.

| Tool | Exact model / plan | Used for | Which files it touched |
| --- | --- | --- | --- |
| ChatGPT | GPT-6 / Free | Read the course handouts and repository snapshot; reconstruct the Smart Campus prototype; draft and challenge the risk review; write tests, refactor code, patch AGENTS.md, prepare report and submission declaration. | `app/`, `lab-report.md`, `AI_USAGE.md`, `submission.yml`, `evidence/` |
| GitHub connector through ChatGPT | GitHub API integration (no separate model) | Inspect `notdvong/se-practice`, create the `week-10` branch and prepare the submission PR. | Repository metadata and `week-10` branch only |

**The review in Task 2 ran in a mode where the assistant could not edit, and `git status` showed no change afterwards:** no. The chat assistant had editing capability; the review phase itself was a static inspection with no file writes, but it was not technically isolated in Plan mode.

**I labelled every claim in lab-report.md §3.2 after opening the cited file myself:** no. The assistant inspected the cited files and wrote the labels; the student has not yet independently rechecked each item.

**Every change to `app/` was reviewed by me as a diff before I accepted it:** no. The assistant inspected the patch and recorded the diff; the student still needs to review it before treating the code as their own work.

**I used another assistant as well:** no. No second AI assistant was used.

**Every terminal output in lab-report.md was pasted from a real run, unedited:** yes for the outputs included. The file explicitly distinguishes Node smoke checks from Vitest runs; no unexecuted Vitest output is represented as real.

**I can explain every score in my register, and why my release decision follows from it, without the assistant:** no. The student should check and be able to explain the scores before submission.

**Anything I accepted from the AI without fully understanding it:** The React/Vite component code and the exact build configuration have not yet been verified by the student in a local browser. The availability logic was compiled and checked with direct Node assertions; the app build needs a clean independent check.

Signed: Student (AI-assisted draft; student review pending)
Date: 2026-11-22
