# Assessment 2 video walkthrough

Use this as a prompt sheet rather than reading every line. Keep your face visible and narrate throughout. Confirm the required duration in the LMS before recording; the sequence below is designed for a focused walkthrough of about seven minutes.

## Before recording

- Have your student card ready.
- Start the application with `docker compose up --build` and wait until the application health check passes.
- Open tabs for Home, Teacher Library, Wordle, Word Search, `/health`, the Prisma schema and the GitHub pull request.
- Keep the terminal ready for `curl -i http://localhost:3000/health`.
- Clear old downloads so the generated files are easy to find.
- Increase browser and editor text size enough for the marker to read.
- Turn off notifications and verify microphone, camera and screen capture.
- Rehearse once and remove pauses. Focus on design reasons and visible results, not a line-by-line code tour.

## 0:00 to 0:30 | Identification and purpose

Show your face and student card clearly.

> Hi, I am Anisa Ahmovic, student number 22318777. This is my CWA Assessment 2 Phoneme Activity Builder. It extends my Assessment 1 Next.js interface with a backend API, PostgreSQL database, Prisma ORM, full content and configuration CRUD, health monitoring and Docker deployment.

## 0:30 to 1:15 | Architecture and data model

Show the README architecture diagram, then `prisma/schema.prisma`.

> The browser communicates with validated Next.js route handlers. The route handlers call a server-side repository, and only that layer accesses PostgreSQL through Prisma. This separation prevents the browser from receiving database credentials and keeps data logic reusable.

Point to the four models and their relationships.

> A word list owns words and saved configurations. A word stores its written spelling, hint, difficulty and an ordered PostgreSQL string array. Each array element is one phoneme, so a multi-character symbol such as tʃ remains one phoneme rather than two characters. The join model preserves the order of activity words and identifies a Wordle target. Foreign keys, indexes, uniqueness rules and database constraints protect valid relationships and supported values.

## 1:15 to 2:40 | Teacher word CRUD

Open Teacher Library.

1. Create a list named `Assessment 2 demonstration`.
2. Add `chip` with `tʃ ɪ p`, Beginner difficulty and `Starts with CH` as the hint.
3. Point out that `tʃ` appears as one item and the word has three phonemes.
4. Select Edit, change the hint to `Updated teacher hint`, and save.
5. Refresh or reselect the list to demonstrate retrieval from PostgreSQL.
6. Add a temporary word, then delete it to demonstrate delete.

Suggested narration:

> Assessment 1 used only predefined datasets, which was the main limitation in my feedback. Teachers can now enter their own content. These actions call POST, GET, PATCH and DELETE API routes rather than updating browser-only state. The same Zod schemas validate the API regardless of which interface sends the request. Duplicate records, invalid phoneme lengths and database relationship errors return consistent, readable JSON errors.

Do not delete `chip`, because it will be used in the next demonstration.

## 2:40 to 3:35 | Wordle configuration CRUD

Open Wordle.

1. Select `Assessment 2 demonstration` and `chip`.
2. Set maximum attempts to 4.
3. Turn the answer key off and leave hints on.
4. Set the filename to `chip-practice.html`.
5. Name the configuration `Chip Wordle demonstration` and select Save new.
6. Change the notes or attempt count and select Update selected.
7. Load the saved configuration to show retrieval.

Suggested narration:

> This builder now retrieves the word through the API. Saved configurations include the activity type, difficulty, target, phoneme count, attempt limit, hint and answer settings, filename, notes and timestamps. Multiple configurations can reference the same list. The repository verifies that selected words belong to the list and match the configured phoneme length.

Generate and open the HTML file.

> The download contains its own HTML, CSS, JavaScript and serialised database content. It opens from a local file address and remains playable without the Next.js server.

## 3:35 to 4:40 | Word Search integration

Open Word Search and load the seeded `Five word phoneme search` configuration.

1. Show the selected database words and stored 10 by 10 dimensions.
2. Regenerate the preview.
3. Find one word with the mouse or keyboard.
4. Turn Show Answers on and off.
5. Generate and open the standalone HTML.

Suggested narration:

> Word Search uses the same database and API layer. Its configuration stores the ordered word selection, grid dimensions, difficulty, hint setting, answer-reveal setting and output filename. The placement algorithm supports eight straight directions. Both the preview and standalone output support pointer and keyboard interaction with labelled grid cells and live feedback.

## 4:40 to 5:25 | API and health evidence

Briefly show the API routes in the README, then run:

```bash
curl -i http://localhost:3000/health
```

Point to `HTTP/1.1 200`, `status: ok` and `database: connected`.

> The required health route performs a real `SELECT 1` through Prisma. It returns HTTP 200 only when the application can reach PostgreSQL; otherwise it returns HTTP 503 with a structured error. CRUD routes use appropriate 200, 201, 204, 400, 404 and 409 responses.

## 5:25 to 6:10 | Docker deployment

Show `compose.yaml`, `Dockerfile`, then the already-running Compose services or logs.

> The multi-stage Dockerfile separates dependency installation, production build and the minimal runtime image. The final application runs as a non-root user. Docker Compose starts PostgreSQL first, waits for its health check, runs committed migrations and the idempotent seed, then starts the application. The application container also has a health check against `/health`.

If useful, show:

```bash
docker compose ps
```

## 6:10 to 6:50 | Quality, GitHub and conclusion

Show the completed GitHub Actions check and pull request, or the local terminal results if Actions is still running.

> The quality gate runs ESLint, TypeScript, eight unit tests, a production build, live database migrations and seed, an end-to-end API smoke test and a Docker image build. The smoke test verifies health and full list, word and activity-configuration CRUD, then removes its temporary data. I developed Assessment 2 on a feature branch and submitted it through a pull request so the main branch remains stable.

Finish on the application Home page with your face visible.

> This completes the Assessment 2 requirements while preserving the accessible activity workflow from Assessment 1. Thank you.

## Evidence checklist

- [ ] Student card is readable in the first 30 seconds.
- [ ] Face and narration remain present throughout.
- [ ] Multi-character phoneme storage is explained.
- [ ] Create, retrieve, update and delete are visibly demonstrated.
- [ ] At least one saved activity is created, updated and loaded.
- [ ] Both builders visibly use stored database content.
- [ ] Both standalone downloads are opened.
- [ ] `/health` visibly returns HTTP 200.
- [ ] Dockerfile, Compose services and healthy containers are shown.
- [ ] Tests and GitHub workflow evidence are shown.
- [ ] Final recording is within the LMS duration and plays correctly after upload.
