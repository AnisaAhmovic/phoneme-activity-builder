# Phoneme Activity Builder

An accessible full-stack application for creating, storing and exporting phoneme-based Wordle and Word Search activities for Speech Pathology teaching and learning.

Assessment 2 extends the original Next.js frontend with a PostgreSQL database, Prisma ORM, validated route-handler APIs, teacher-managed phoneme content, saved activity configurations, health monitoring and Docker deployment. Generated activities remain single, standalone HTML files that work without the Next.js server.

## Author

**Anisa Ahmovic**

Student number: **22318777**

Repository: <https://github.com/AnisaAhmovic/phoneme-activity-builder>

## Assessment 2 coverage

| Criterion | Implementation |
| --- | --- |
| Data schema and phoneme model | Normalised `WordList`, `Word`, `ActivityConfiguration` and `ActivityConfigurationWord` models; PostgreSQL arrays preserve multi-character phonemes such as `tʃ` as one sequence item; foreign keys, indexes, uniqueness rules and database constraints protect the data. |
| CRUD APIs and health | Next.js route handlers provide create, retrieve, update and delete operations for word lists, words and activity configurations. `/health` verifies the live database connection and returns HTTP 200 only when healthy. |
| Docker | A multi-stage `Dockerfile` creates a non-root production image. `compose.yaml` starts PostgreSQL, applies migrations, seeds demonstration data, then starts and health-checks the application. |
| Integration and generation | The Teacher Library writes teacher-entered data through the API. Both builders retrieve that data, save multiple configurations and embed the selected database records and output settings into standalone HTML. |
| Code quality and GitHub | TypeScript, Zod validation, a repository layer, structured API errors, Prisma migrations, unit tests, an end-to-end API smoke test and GitHub Actions provide a maintainable workflow. |

The Assessment 1 feedback is also addressed by adding a System theme and replacing the fixed-dataset-only workflow with direct teacher entry of written words and phoneme sequences.

## Architecture

```mermaid
flowchart TD
    UI["Next.js teacher interface"] --> API["Validated route-handler API"]
    API --> REPO["Repository and Prisma ORM"]
    REPO --> DB[("PostgreSQL")]
    DB --> BUILDERS["Wordle and Word Search builders"]
    BUILDERS --> HTML["Standalone HTML activity"]
```

The interface and API are kept in one Next.js project. The browser never connects to PostgreSQL directly: client components call route handlers, route handlers validate requests, and the server-side repository is the only layer that uses Prisma.

## Features

### Teacher Library

Teachers can:

- create, retrieve, rename and delete word lists
- add words using their own spellings and three-to-five-item phoneme sequences
- store a multi-character symbol such as `tʃ`, `dʒ` or `eɪ` as one phoneme
- update spelling, phonemes, hint and difficulty metadata
- delete words that are not in use by a saved configuration
- see API validation and database conflict messages in the interface

### Phoneme Wordle

The database-backed builder supports:

- three, four or five phoneme targets
- a teacher-selected stored word and list
- one to ten attempts
- optional phoneme hints and answer key
- a configurable output filename
- create, retrieve, update, load and delete operations for saved configurations
- an accessible live preview and on-screen phoneme keyboard
- standalone HTML with exact, present and absent scoring plus restart controls

### Phoneme Word Search

The database-backed builder supports:

- teacher-selected words with three, four or five phonemes
- six-to-sixteen-row and column grids
- horizontal, vertical and diagonal placement in both directions
- optional phoneme hints and answer-reveal control
- a configurable output filename
- create, retrieve, update, load and delete operations for saved configurations
- mouse dragging, endpoint clicking and keyboard selection
- standalone HTML with found-word tracking and persistent feedback

### Display and accessibility

- Light, Dark and System colour themes
- Standard and Wide layouts
- cookie-persisted preferences applied during server rendering
- responsive desktop, tablet and compact layouts
- semantic headings, fieldsets, table headings and labelled controls
- visible hover and keyboard focus states
- ARIA grids and live status or error feedback
- keyboard-operable generated Word Search activities
- an embedded guide with a written transcript

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | Home page and entry points |
| `/about` | Project scope, student details and original interface guide |
| `/library` | Teacher CRUD interface for stored lists and words |
| `/wordle` | Database-backed Wordle builder and saved configurations |
| `/word-search` | Database-backed Word Search builder and saved configurations |
| `/settings` | Theme and layout preferences |
| `/health` | Application and database health check |

## Data model

| Model | Important fields and relationships |
| --- | --- |
| `WordList` | Unique name, optional description, timestamps, many words and many saved configurations |
| `Word` | Written spelling, `String[]` phoneme sequence, optional hint, difficulty, parent list and timestamps |
| `ActivityConfiguration` | Activity type, difficulty, phoneme length, grid dimensions, attempt limit, hint and answer settings, filename, notes and parent list |
| `ActivityConfigurationWord` | Ordered many-to-many selection between configurations and words, including the Wordle target flag |

The database migration enforces three-to-five phoneme sequences, valid activity phoneme counts, one-to-ten attempts and activity-appropriate grid dimensions. The repository additionally verifies that every selected word belongs to the chosen list and matches the configuration's phoneme count.

## API

Successful JSON responses use `{ "data": ... }`. Errors use a consistent `error` object with a stable code, readable message and optional field details.

| Method and route | Operation |
| --- | --- |
| `GET /api/word-lists` | Retrieve all lists with their words |
| `POST /api/word-lists` | Create a list, optionally with initial words |
| `GET /api/word-lists/:id` | Retrieve one list |
| `PATCH /api/word-lists/:id` | Update a list |
| `DELETE /api/word-lists/:id` | Delete a list and its dependent records |
| `GET /api/words?wordListId=:id` | Retrieve words, optionally filtered by list |
| `POST /api/words` | Create a word |
| `GET /api/words/:id` | Retrieve a word |
| `PATCH /api/words/:id` | Update a word |
| `DELETE /api/words/:id` | Delete an unused word |
| `GET /api/activity-configurations?type=WORDLE` | Retrieve configurations, optionally filtered by type |
| `POST /api/activity-configurations` | Create a configuration |
| `GET /api/activity-configurations/:id` | Retrieve a configuration with ordered words |
| `PATCH /api/activity-configurations/:id` | Partially update a configuration |
| `DELETE /api/activity-configurations/:id` | Delete a configuration |

Example validation error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Check the submitted fields and try again.",
    "details": [
      {
        "field": "phonemes",
        "message": "Enter at least three phonemes."
      }
    ]
  }
}
```

## Run the complete system with Docker

### Prerequisites

- Docker Desktop or Docker Engine
- Docker Compose v2

### Start

```bash
docker compose up --build
```

Compose waits for PostgreSQL, runs every committed migration, seeds 90 demonstration words and two saved activities, and then exposes the application at <http://localhost:3000>.

Check the required health endpoint:

```bash
curl --fail http://localhost:3000/health
```

Expected response structure:

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-09-14T00:00:00.000Z"
}
```

Stop the containers while retaining the database volume:

```bash
docker compose down
```

For a deliberate clean reset, `docker compose down --volumes` also deletes the local PostgreSQL volume and all locally entered content.

## Run locally without Docker

### Prerequisites

- Node.js 22 or later
- npm
- PostgreSQL

Copy the example environment file and replace the credentials if required:

```bash
cp .env.example .env
npm ci
npm run db:deploy
npm run db:seed
npm run dev
```

Open <http://localhost:3000>.

The committed `.env.example` contains only local example values. Real credentials are excluded by `.gitignore`.

## Database commands

| Command | Purpose |
| --- | --- |
| `npm run db:generate` | Regenerate the typed Prisma client |
| `npm run db:migrate` | Create or apply a development migration |
| `npm run db:deploy` | Apply committed migrations without modifying schema history |
| `npm run db:seed` | Idempotently load the demonstration content |
| `npm run db:studio` | Inspect local data in Prisma Studio |

The seed can be run repeatedly. It updates the starter corpus, then recreates only the two named sample configurations. Teacher-created lists and activities are not removed.

## Validation and tests

Run the complete local quality gate:

```bash
npm run check
```

This runs ESLint, TypeScript, eight unit tests and the production build.

With the application and database running, verify HTTP 200 health plus end-to-end list, word and saved-activity CRUD:

```bash
npm run test:api
```

The smoke test uses temporary uniquely named data and removes it when complete. GitHub Actions performs the same database preparation, static checks, unit tests, production build, API smoke test and Docker image build for pull requests.

## Standalone output

The builders generate rather than merely link to an activity page. Each downloaded file contains its own semantic HTML, CSS, JavaScript and serialised activity data. It can be opened from a local `file://` address after the Next.js application has stopped.

The stored settings that affect generated output are:

- activity type and phoneme count
- selected and target words
- Word Search rows and columns
- Wordle maximum attempts
- phoneme hints on or off
- answer key or answer reveal on or off
- requested output filename

## Project structure

```text
phoneme-activity-builder/
├── .github/workflows/       # Automated checks
├── docs/                    # Assessment walkthrough support
├── prisma/
│   ├── migrations/          # Versioned PostgreSQL schema
│   ├── schema.prisma        # ORM data model
│   └── seed.ts              # Demonstration content
├── public/                  # Static guide video
├── scripts/api-smoke.mjs    # Live health and CRUD verification
├── src/
│   ├── app/
│   │   ├── api/             # Backend route handlers
│   │   ├── health/          # Database-aware health endpoint
│   │   ├── library/         # Teacher content-management page
│   │   ├── wordle/          # Wordle page
│   │   └── word-search/     # Word Search page
│   ├── components/          # Reusable client interface components
│   ├── data/                # Demonstration phoneme corpus and hints
│   ├── hooks/               # Shared data-loading hook
│   ├── lib/                 # API client, validation and mappings
│   ├── server/              # Prisma client, repository and HTTP errors
│   ├── types/               # Shared TypeScript contracts
│   └── utils/               # Puzzle and standalone HTML generation
├── tests/                   # Unit tests
├── compose.yaml
├── Dockerfile
└── README.md
```

## Video walkthrough preparation

The submission video must begin with student identification in the first 30 seconds and show the presenter’s face with narration. A concise demonstration order, narration prompts and pre-recording checklist are provided in [`docs/assessment-2-video-script.md`](docs/assessment-2-video-script.md).

The most important live evidence is:

1. schema relationships and multi-character phonemes
2. teacher CRUD for a new list and word
3. saved-configuration CRUD
4. database content driving both builders and downloads
5. `/health` returning HTTP 200
6. the application starting through Docker Compose

## References (APA 7)

Docker, Inc. (n.d.-a). *Compose file reference*. Retrieved September 09, 2026, from https://docs.docker.com/reference/compose-file/

Docker, Inc. (n.d.-b). *Multi-stage builds*. Retrieved September 09, 2026, from https://docs.docker.com/build/building/multi-stage/

International Phonetic Association. (1999). *Handbook of the International Phonetic Association: A guide to the use of the International Phonetic Alphabet*. Cambridge University Press. https://doi.org/10.1017/9780511807954

PostgreSQL Global Development Group. (n.d.). *Arrays*. Retrieved September 09, 2026, from https://www.postgresql.org/docs/current/arrays.html

Prisma Data, Inc. (n.d.-a). *Prisma schema overview*. Retrieved September 11, 2026, from https://www.prisma.io/docs/orm/prisma-schema/overview

Prisma Data, Inc. (n.d.-b). *Prisma Migrate*. Retrieved September 11, 2026, from https://www.prisma.io/docs/orm/prisma-migrate

Vercel. (n.d.). *Route handlers*. Next.js. Retrieved September 11, 2026, from https://nextjs.org/docs/app/getting-started/route-handlers

World Wide Web Consortium. (2023, October 5). *Web Content Accessibility Guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/

## Repository workflow

Assessment 2 work is developed on a feature branch and reviewed through a pull request. The stable `main` branch is not changed directly. Generated clients, dependencies, builds and real environment files are excluded from version control.
