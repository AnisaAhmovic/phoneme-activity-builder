# Assessment 3 requirement coverage

Author: Anisa Ahmovic, student number 22318777.

Repository: https://github.com/AnisaAhmovic/phoneme-activity-builder

Assessment 3 branch: `feature/assessment-3-reporting`. Pull request: https://github.com/AnisaAhmovic/phoneme-activity-builder/pull/14

## Continuity review

The supplied archive contains the Assessment 1 source (40 files), Assessment 2 source (72 files) and Assessment 3 brief. All 72 Assessment 2 files matched GitHub `main` at `b5f74cc882ef1d3d43b9ebc0e270c702cc2cf1d7` by Git blob hash on 1 October 2026. Twenty Assessment 1 files are unchanged in Assessment 2. The corpus contains 90 words across three, four and five phonemes. The existing 2:17 guide video is an Assessment 1 interface guide, not the required Assessment 3 recording. No lecture transcripts or separate Assessment 1/2 marking sheets were in this upload.

Git history establishes the initial project setup, frontend builders and accessibility work in August, then the backend merge in PR #13 in September. Assessment 3 extends that existing create-next-app project.

## Coverage matrix

| Brief requirement | Implementation | Evidence to show |
| --- | --- | --- |
| Data-driven dashboard and summaries | `/dashboard`, SQL/Prisma aggregates, current list and configuration inventory | Filter traffic and period; show type totals, daily trend and time table |
| Stored phoneme lists and settings | Retained PostgreSQL models, CRUD APIs, Teacher Library and saved configuration manager | Create a list/word, change metadata, reload, retrieve saved settings |
| Simulated inputs and persistence | `prisma/simulate.ts`, deterministic upserts, separate SIMULATED source | Select simulated examples; 24 successes, 4 failures and 57.5-second mean are clearly synthetic |
| Wordle and Word Search output | Server generation from selected database records; persisted HTML and settings snapshot | Download and play both activity types; reopen a saved output |
| Health endpoint | Existing database-aware `/health`, dashboard live status | Network/terminal HTTP 200 plus connected database |
| Creation and generation metrics | Current saved counts; successful/failed event counts; most-used type | Show changes after Generate HTML; explain saving versus generating |
| Time on page | Anonymous PageVisit records, foreground heartbeats and monotonic cumulative updates | Navigate between pages and refresh dashboard |
| Alerts and reporting | Empty-list alert, failed-event cause, low success threshold, unavailable-health handling, CSV | Show empty list, deliberate invalid request and exported rows |
| Playwright builder use case | End-to-end list and word create/read/update/delete test | Open HTML report and source; show passing test with reload verification |
| Playwright learner use case | Wordle offline play, Word Search keyboard selection and answer control | Open report and demonstrate generated output |
| JMeter load testing | Seven-request builder-to-output workflow; five staged concurrency levels | Show stage table and per-stage HTML graphs, explain p95, errors and limits |
| Lighthouse | Audits for four application pages and both generated activity types | Show actual scores, remaining manual checks and documented changes |
| Maintainable architecture | Route handlers, server generation/reporting services, shared validation, migrations, TypeScript | Explain browser -> API -> database -> generated output/report |
| GitHub practice | Existing history plus Assessment 3 branch and pull request | Show repository homepage, changed files and actual commits |
| 3-8 minute video | Full script and recording instructions | Student records face, voice and physical/digital student ID |
| ZIP and repository link | Source archive excludes dependencies, build output and credentials | Upload source ZIP and include repository link |
| At least five APA 7 sources | `docs/REFERENCES.md` and submission cover/reference PDF | Reference list in package and closing screen |

## Measurement definitions and limits

- Success means the HTML output and event record were saved by the server. It does not prove the learner finished the game or the browser retained the downloaded file.
- Failures are validated generation or word-placement failures. Database outages surface as HTTP errors and failed health checks. An unavailable database cannot reliably record its own outage in the same database.
- Configuration counts are current records, not lifetime creation counters. Generation records remain after source records change or are deleted.
- Average time is `sum(activeMs) / visit count / 1000`, using each visit's latest foreground total. It includes in-progress visits. No identity or cross-visit user tracking is used. Lost unload requests can undercount; the 30-minute cap limits outliers.
- Date filters use a rolling 7/30-day interval. Daily rows use UTC; event timestamps display Melbourne time. The page states both conventions.
- JMeter measures HTTP/server work. It does not execute the generated activity JavaScript. Playwright covers that separate learner interaction.
- The five default load levels are the brief's permitted equivalent staged levels. No claim is made about 1,000 or 10,000 concurrent users.
- A Lighthouse score is automated evidence, not a full accessibility certification. Keyboard, focus, zoom, contrast and screen-reader usability still need human review.
- This is a local assessment application. Shared or public deployment requires authentication, authorisation, traffic controls and a data-retention decision.

## Submission wording conflict

The brief says “video only” and “no written report required”, then includes a general Turnitin similarity-score paragraph recommending Word or PDF. A short cover/reference PDF is supplied to address the reference requirement and support the Moodle submission. Check the actual Moodle upload slots or ask the lecturer if a similarity-bearing file is required alongside the video and code ZIP. Do not replace the required video with this PDF.
