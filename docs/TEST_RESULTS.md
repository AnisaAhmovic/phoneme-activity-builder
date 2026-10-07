# Assessment 3 measured test results

Verified on 1 October 2026 against application commit `3d9a8a75d14bbb5d75fb51e9da9d9c7a8ff1ee84`.

Passing GitHub Actions run: https://github.com/AnisaAhmovic/phoneme-activity-builder/actions/runs/36819968201

The final README, script and result notes are documentation-only additions after this run. Application code, dependencies, migrations, test plans and workflow match the verified commit. The Actions `environment.json` records GitHub's temporary PR merge SHA, while the run's `head_sha` identifies the application commit above.

## Environment and scope

- Ubuntu GitHub Actions runner, Linux, 2 available CPUs, approximately 7.75 GiB RAM.
- Node.js 22.23.2; production Next.js build; PostgreSQL 17 service container.
- Playwright 1.58.2 with Chromium, Lighthouse 13.5.0, Apache JMeter 5.6.3.
- Application and load generator share the runner. These measurements include that resource contention and local networking.
- Fresh database migrations, the 90-word starter corpus and deterministic simulated records were loaded before verification.

## Verification summary

| Check | Measured result | Evidence |
| --- | --- | --- |
| ESLint and TypeScript | Pass | `evidence/quality-checks.txt` |
| Unit tests | 12 passed, 0 failed | `evidence/quality-checks.txt` |
| Production build | Pass | `evidence/quality-checks.txt` |
| API health and CRUD smoke test | Pass; HTTP 200 health | `evidence/api-smoke.txt`, `evidence/health.json` |
| Playwright end-to-end | 5 passed; 0 skipped, unexpected or flaky | `evidence/playwright-report/index.html`, `evidence/playwright-results.json` |
| Lighthouse accessibility | 100/100 on all six audited pages | `evidence/lighthouse-final/` |
| JMeter staged workflow | 6,510 HTTP samples, 0 errors | `evidence/jmeter-*/` |
| Fresh-process database persistence | Pass | `evidence/persistence.json` |
| Docker production image | Built successfully | Linked Actions run, Build Docker production image step |

Playwright covers full list/word CRUD with reloads, downloaded Wordle play while offline, downloaded Word Search keyboard selection, health/invalid requests/concurrent duplicate IDs/page time/CSV, and mobile layout/skip-link focus. The browser suite completed in about 8.5 seconds on this runner. The deliberately rejected generation in the monitoring test is expected, and is checked as a recorded failure.

## JMeter results

Every stage used five workflows per user and a five-second ramp. A synchronising timer released all users together before their first HTTP request. The runner confirmed the requested peak concurrency from the raw JTL `grpThreads` field. The synchronisation sampler itself is excluded from the HTTP sample counts.

| Requested users | Observed peak | HTTP samples | Errors | Mean ms | p95 ms | Requests/s |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 35 | 0 | 15.9 | 43.6 | 29.5 |
| 10 | 10 | 350 | 0 | 81.9 | 195.4 | 97.8 |
| 25 | 25 | 875 | 0 | 162.3 | 303.2 | 134.6 |
| 50 | 50 | 1,750 | 0 | 283.3 | 505.9 | 161.1 |
| 100 | 100 | 3,500 | 0 | 504.1 | 1120.0 | 188.9 |

Each workflow performs seven HTTP requests: builder page, stored words, configuration creation, HTML generation, saved output retrieval, reporting and configuration deletion. The plan alternates Wordle and Word Search across users, checks response codes and content, and leaves generation history labelled `LOAD_TEST`. The one-user stage exercises Wordle; subsequent stages exercise both types.

Latency increased with load: mean request time rose from 15.9 ms to 504.1 ms, and p95 from 43.6 ms to 1,120.0 ms. Throughput increased to 188.9 requests per second at 100 users. All stages remained within the declared review thresholds of less than 5% errors and p95 below 2,000 ms. This is evidence of the tested workload on this runner, not a production service-level commitment.

The short five-iteration stages do not test sustained use, a large historic database, slow public networks or 1,000/10,000 users. The brief permits equivalent staged loads; the implemented stages are 1, 10, 25, 50 and 100. JMeter does not execute learner JavaScript, which is covered separately by Playwright.

## Accessibility evidence and changes

| Audited page | Baseline | Final |
| --- | --- | --- |
| Dashboard | 100 | 100 |
| Teacher Library | 100 | 100 |
| Wordle builder | 100 | 100 |
| Word Search builder | 100 | 100 |
| Generated Wordle | 100 | 100 |
| Generated Word Search | 100 | 100 |

The baseline ran locally with Chromium 153 and an embedded PostgreSQL-compatible development database before the skip-link review changes. The final audit used the CI PostgreSQL 17 environment and Playwright Chromium. Both used Lighthouse 13.5.0 desktop accessibility checks. Because the environments differ, these results are not a controlled performance comparison. No automated accessibility failure was present in the baseline and no score improvement is claimed.

After report review, a visible-on-focus skip link and focusable main targets were added, with a browser test for keyboard focus. The generated Wordle keyboard also gained support for teacher-entered target phonemes. Labels, headings, text feedback, focus indicators and Word Search keyboard selection were retained. See `docs/ACCESSIBILITY_REVIEW.md`. Screen-reader and learner usability evaluations remain future manual work; 100 is not a complete WCAG conformance claim.

## Persistence, simulation and evidence interpretation

The fresh application process on port 3001 retrieved exactly the same load-test totals and returned HTTP 200 for a previously saved output. It observed 932 successful generations and one deliberately failed attempt. Of those successes, 930 came from JMeter and two from the Lighthouse fixtures. These are test records, not real classroom use.

Simulation remains separate: 28 synthetic attempts, including 24 successes and four failures, and 12 page visits averaging 57.5 seconds. The end-to-end test checks those expected values. A stored cumulative page-time test also checks that a late lower heartbeat cannot reduce the saved duration.

Earlier verification found and fixed a concurrent duplicate-request insertion race. The final test sends the same request ID concurrently and verifies one persisted outcome. Its corrected Wordle assertion uses the actual corpus vowel `ʉː`. The final evidence package contains the passing PostgreSQL run; experimental local load measurements are excluded because the embedded development database did not provide representative multi-connection behaviour.

## Open the supplied reports

1. Extract the complete source ZIP so report assets retain their relative paths.
2. Open `evidence/playwright-report/index.html` for browser test details.
3. Open `evidence/jmeter-*/SUMMARY.md` or the stage's `*-users-report/index.html` for load tables and charts.
4. Open a page report under `evidence/lighthouse-final/` for its accessibility audit.
5. Use `evidence/screenshots/` for reference views and `evidence/persistence.json` for the fresh-process result.

CI artefacts expire after 30 days; the submission ZIP preserves the measured evidence. To regenerate it, follow README.md using a disposable local PostgreSQL database with `ALLOW_TEST_TRAFFIC=1` and run the included tests.
