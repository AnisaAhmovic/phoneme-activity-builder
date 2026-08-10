# Phoneme Activity Builder

A frontend web application for creating phoneme-based Wordle and Word Search activities for Speech Pathology teaching and learning.

The builder allows an activity to be configured and previewed in the Next.js interface, then downloaded as a single standalone HTML file that can be opened and played directly in a normal web browser without the Next.js development server.

## Author

**Anisa Ahmovic**  
Student number: **22318777**

Repository: https://github.com/AnisaAhmovic/phoneme-activity-builder

## Project scope

This version is a frontend-only implementation. It focuses on:

- interface design and usability
- responsive behaviour
- accessibility and keyboard interaction
- phoneme-based Wordle and Word Search activities
- live activity previews
- standalone downloadable HTML activities
- persistent display preferences

Database support and dynamic server-side word management are outside the current scope.

## Features

### Phoneme Wordle

The Wordle builder allows the user to:

- choose a target containing 3, 4 or 5 phonemes
- preview the target phoneme sequence
- enter phonemes using an on-screen phoneme keyboard
- use phoneme hover hints that show an English letter equivalence
- generate a standalone playable HTML activity

The downloaded Wordle activity includes:

- a six-row guessing grid
- an interactive phoneme keyboard
- Delete, Submit guess and Restart controls
- feedback for correct position, present elsewhere and absent phonemes
- English word and phoneme equivalence feedback when the answer is revealed
- phoneme hints such as `/θ/ — TH (as in thin)`

### Phoneme Word Search

The Word Search builder allows the user to:

- choose a 3, 4 or 5 phoneme word set
- select words for the puzzle
- use a five-word default selection
- configure the number of rows and columns
- regenerate the preview
- reveal or hide answers
- find placed words by dragging across the grid
- use keyboard-based first-cell and last-cell selection
- generate a standalone playable HTML activity

The downloaded Word Search activity includes:

- horizontal, vertical and diagonal word placement
- forward and reverse word matching
- found-word tracking
- persistent found-cell highlighting
- a found-word counter
- answer reveal controls
- pointer and keyboard interaction
- phoneme hover and focus hints

## Display and accessibility features

The application includes:

- Light and Dark themes
- Standard and Wide content layouts
- theme and layout persistence using a browser cookie
- visible keyboard focus states
- semantic headings and labelled controls
- ARIA labels and live status feedback where appropriate
- keyboard-accessible Word Search selection
- responsive layouts for desktop, tablet and compact screens
- a hamburger navigation menu at compact widths

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | Home page and activity entry points |
| `/about` | Project purpose, student details, scope and website-guide section |
| `/wordle` | Phoneme Wordle builder |
| `/word-search` | Phoneme Word Search builder |
| `/settings` | Light/Dark theme and layout preferences |

## Technology

The project uses:

- Next.js 16.3.0
- React 19.2.8
- TypeScript
- CSS
- ESLint
- Tailwind CSS tooling included by the Next.js project setup

The project was created from the Next.js `create-next-app` workflow.

## Getting started

### Prerequisites

Install Node.js and npm before running the project locally.

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Create a production build

```bash
npm run build
```

### Run the production server

After building:

```bash
npm run start
```

## Generating a standalone activity

### Wordle

1. Open `/wordle`.
2. Choose the number of phonemes.
3. Choose a target word.
4. Review the live preview.
5. Select **Generate HTML**.
6. Open the downloaded `.html` file from the Downloads folder.

The downloaded activity runs independently from the Next.js application. Its browser address can use a local `file://` path rather than `localhost`.

### Word Search

1. Open `/word-search`.
2. Choose the phoneme count.
3. Select the required words.
4. Set the grid dimensions if needed.
5. Select **Regenerate Preview** when the configuration changes.
6. Review the live puzzle.
7. Select **Generate HTML**.
8. Open `phoneme-word-search.html` from the Downloads folder.

The exported activity contains its puzzle data, styles and interaction logic in a single HTML file.

## Display preferences

Open `/settings` to change:

- **Colour theme:** Light or Dark
- **Content layout:** Standard or Wide

The selected preferences are saved in a browser cookie and restored when the application is opened again in that browser.

## Website guide video

The About page is prepared to display the required short website guide video from:

```text
public/phoneme-activity-builder-guide.mp4
```

The final recorded guide should be added at that path before submission.

## Project structure

```text
phoneme-activity-builder/
├── public/
├── src/
│   ├── app/
│   │   ├── about/
│   │   ├── settings/
│   │   ├── wordle/
│   │   ├── word-search/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── ui-polish.css
│   ├── components/
│   │   ├── layout/
│   │   ├── settings/
│   │   ├── wordle/
│   │   └── word-search/
│   ├── data/
│   │   ├── phonemeCorpus.ts
│   │   ├── phonemeHints.ts
│   │   └── phonemeKeyboard.ts
│   ├── types/
│   └── utils/
│       ├── downloadHtmlFile.ts
│       ├── generateWordleActivityHtml.ts
│       ├── generateWordSearchActivityHtml.ts
│       ├── generateWordSearch.ts
│       └── interfacePreferences.ts
├── package.json
└── README.md
```

## Validation

Before merging or submitting changes, run:

```bash
npm run lint
npm run build
git diff --check
```

The expected result is:

- ESLint completes without errors
- the production build completes successfully
- `git diff --check` reports no whitespace errors

The standalone Wordle and Word Search downloads should also be opened directly from the file system and tested independently of `localhost`.

## Repository workflow

Development has been completed using feature branches and pull requests. The main branch is kept as the stable integrated version of the application.
