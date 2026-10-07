# Assessment 3 video script

**Anisa Ahmovic | 22318777 | Phoneme Activity Builder**

Target length: about 7 minutes, including clicks. Keep your face visible in a webcam overlay and use your own voice throughout. Hold your student ID clearly to the camera during the opening. Rehearse once and check the final recording is between 3 and 8 minutes.

## Before recording

1. Use the Assessment 3 branch or supplied source ZIP. Start `docker compose up --build` and open `http://localhost:3000/dashboard`.
2. Open tabs for Dashboard, Teacher Library, Wordle, Word Search, `/health`, the Playwright HTML report, the JMeter summary/HTML report, a Lighthouse HTML report, the GitHub homepage and PR #14 commits.
3. Have the source files `prisma/schema.prisma`, `src/server/generation.ts`, `src/server/reporting.ts` and `tests/e2e/assessment3.spec.ts` ready in your editor.
4. Use the supplied measured evidence or rerun the tests. If you rerun, narrate the results actually shown. Do not use simulation counts as test results.
5. Prepare the demonstration list called `Video practice` with the word `chip`, phonemes `tʃ ɪ p`, difficulty Beginner and hint `Starts with CH`. Also create an empty list called `Video empty list` for the alert. Keep these demonstration names distinct from your own content.
6. Pre-open downloaded Wordle and Word Search outputs if browser download prompts would interrupt recording. Generate at least one new output during the video to demonstrate the live counter change.
7. Keep the webcam away from dashboard totals and test results. Increase browser zoom if text is too small. Close unrelated tabs and notifications.

## 0:00-0:25 | Identity and project continuity

**Show:** Your face and student ID, then the application home page.

**Say:**

“Hi, I’m Anisa Ahmovic, student number 22318777. This is my Assessment 3 Phoneme Activity Builder. It continues the same Next.js project. Assessment 1 provided the frontend and standalone learning activities. Assessment 2 added PostgreSQL, CRUD APIs and Docker. Assessment 3 adds stored generation history, operational reporting, alerts and testing evidence.”

## 0:25-1:10 | Dashboard and metric definitions

**Show:** Dashboard. Select Simulated examples, point to totals, activity breakdown and daily rows. Then select Live activity.

**Say:**

“This dashboard reads its information from the database. I can filter by time period and traffic source. These simulated examples contain 24 successful generations, four failed attempts and an average page time of 57.5 seconds. They are clearly labelled synthetic data.

“Switching to Live activity shows actual recorded use. The dashboard distinguishes saved configurations from generated outputs. A configuration stores reusable settings. A successful generation means the server created and saved an HTML output. Refreshing a preview does not increase this count. The activity breakdown shows Wordle and Word Search usage, while the daily table shows how generation changes over time.”

## 1:10-1:55 | Stored records, settings and data flow

**Show:** Teacher Library, select Video practice. Edit the chip hint, save, refresh and retrieve the list. Briefly show the Prisma models and server generation file.

**Say:**

“The Teacher Library stores word lists, written words, phoneme sequences, hints and difficulty. Here, chip contains three phonemes. The multi-character symbol tʃ is one array item. I’ll update the hint, save it and reload the page to show that the change persists.

“The browser sends requests to Next.js route handlers. Validation checks the input, and Prisma reads or writes PostgreSQL. When I generate an activity, the server retrieves the selected database words and validates their list and phoneme count. It saves the outcome, output settings and HTML snapshot. The dashboard then aggregates those persisted records.”

## 1:55-2:55 | Generate and use both activities

**Show:** Wordle builder, choose Video practice and chip, set four attempts, save a named configuration, then Generate HTML. Open output and enter tʃ, ɪ, p. Move to Word Search, select Core phoneme words, generate and open output. Select one word or use Show answers. Return to Live dashboard and refresh.

**Say:**

“I can save and load a named Wordle configuration, including the attempt limit, hints and output settings. I’ll generate this activity from the stored chip record. The output is now saved on the server and downloaded as one HTML file.

“In the generated activity, I enter the phonemes and submit the answer. The file includes its own data, styles and game logic, so it also works offline.

“Word Search uses selected stored words and the chosen grid dimensions. Its output supports pointer selection, keyboard selection and an optional answer control. It generates a fresh puzzle from the current settings. Returning to the dashboard shows the new successful outputs. These records remain available even if the original configuration is later changed.”

## 2:55-3:40 | Health, page time, alerts and reporting

**Show:** `/health` with HTTP 200 in the browser Network panel or `curl -i`. Return to Dashboard, show empty-list warning. Run `npm run demo:failure` in a prepared terminal, refresh Live dashboard, open the event log and export CSV.

**Say:**

“The health endpoint checks the database and returns HTTP 200 when it is connected. The dashboard also displays this status.

“Average time on page measures visible-tab time per anonymous visit. It updates every 15 seconds and when the user leaves or hides a page. It does not track identities or offline learner activity, and lost connections can undercount time.

“This empty-list warning identifies missing content. I’ll submit a deliberate invalid generation request. The API rejects it, records a failed attempt and displays its cause in the event log. I can export the selected reporting period to CSV for further review. Simulated and load-test events remain separate from live activity.”

## 3:40-4:30 | Playwright reliability evidence

**Show:** Playwright HTML report, successful tests, then relevant test code. Briefly show the fresh-process persistence result.

**Say:**

“Playwright tests the builder and learner workflows in a real browser. The builder test creates a list, adds a word, reloads the page, updates the records and deletes them. The learner tests download Wordle and Word Search outputs. Wordle is played with the browser offline, and Word Search is completed using keyboard selection.

“The monitoring test checks HTTP 200 health, rejected invalid data, duplicate-request handling, page-time updates and CSV output. The mobile test checks the layout and keyboard navigation. A separate check starts a fresh application process and confirms it can retrieve the same database totals and saved output. These checks test persistence and behaviour, rather than only whether a page loads.”

## 4:30-5:30 | JMeter load results

**Show:** Measured JMeter stage summary and one HTML report, including errors, p95 and throughput. Keep the test-plan source available.

**Say:**

“JMeter measures the server-side builder and generated-output workflow. Each virtual user reads the builder, retrieves stored words, saves a configuration, generates and opens an output, reads reporting and deletes its test configuration. The plan includes both activity types and checks response codes and content.

“I used five equivalent staged levels: one, ten, twenty-five, fifty and one hundred concurrent users. Each user repeats the workflow five times, with a five-second ramp and a synchronised start. The test verifies that every stage reaches its requested concurrency. These are the measured results shown here.

“Across 6,510 requests, every stage recorded zero errors. At one user, p95 was about 44 milliseconds. At one hundred users, it increased to 1.12 seconds, while throughput reached about 189 requests per second. All stages stayed below the two-second p95 review threshold, although response time increased with load.

“P95 means 95 per cent of measured requests completed within that time. These short local-runner tests help identify degradation under increasing load. They do not establish production capacity or prove support for ten thousand users. JMeter measures HTTP requests; Playwright separately tests the generated game's JavaScript interaction.”

## 5:30-6:15 | Lighthouse and accessibility decisions

**Show:** Lighthouse accessibility report and summary for six pages. Use Tab to reveal Skip to main content and activate it. Show Word Search keyboard interaction or its Playwright test.

**Say:**

“Lighthouse checks the dashboard, library, both builders and both generated activity types. The baseline accessibility score was 100 out of 100 on all six audited pages. The final reports also scored 100 on all six pages after review.

“I retained labelled fields, table headings, visible text for success and failure, and clear focus styles. After reviewing the reports, I added a Skip to main content link to reduce repeated keyboard navigation. I also checked keyboard interaction and the mobile layout through Playwright.

“A score of 100 means the automated checks passed. It does not replace manual testing or prove complete WCAG compliance. The remaining review includes screen-reader usability, zoom and the needs of actual learners.”

## 6:15-7:00 | GitHub, technical quality and close

**Show:** GitHub homepage, select feature/assessment-3-reporting, open commits/PR #14 and successful Actions run. Show source folders and references briefly.

**Say:**

“The GitHub repository keeps the project's development history. The Assessment 3 changes are on this feature branch and pull request. Generation, validation and reporting are separated into reusable modules. Versioned database migrations preserve the earlier work.

“The automated workflow verifies the PostgreSQL schema, static checks, unit tests, browser tests, accessibility, load behaviour, persistence and Docker build. The saved evidence lets these results be reviewed and repeated.

“The technical ZIP contains the source code, test plans, setup instructions and repository link, without node_modules or real environment credentials. The references include the official Next.js, PostgreSQL, Playwright, JMeter, Lighthouse and WCAG guidance. This completes the data and reporting stage and provides the foundation for the Assessment 4 live demonstration.”

## Final recording check

- Face and own voice are present; student ID is readable at the beginning.
- Video lasts 3-8 minutes and includes actual application interaction.
- Both generated activity types, dashboard, stored data, alerts, reporting and HTTP 200 health are visible.
- Playwright, JMeter and Lighthouse results are readable and explained.
- GitHub homepage and commits are shown, with the Assessment 3 branch selected if it remains unmerged.
- Spoken results match the displayed evidence. If you rerun a test, update the narration to match your run.
- Upload the required video and code ZIP. Use the cover/reference PDF if the Moodle submission requires the brief's similarity-bearing file.
