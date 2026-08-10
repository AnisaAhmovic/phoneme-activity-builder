import { PHONEME_HINT_ENTRIES } from "@/data/phonemeHints";
import type { GeneratedWordSearch } from "@/utils/generateWordSearch";

function serialiseForScript(value: unknown): string {
  const json = JSON.stringify(value) ?? "null";

  return json
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function generateWordSearchActivityHtml(
  puzzle: GeneratedWordSearch,
): string {
  const payload = serialiseForScript({
    grid: puzzle.grid,
    entries: puzzle.entries,
    hints: Object.fromEntries(PHONEME_HINT_ENTRIES),
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Phoneme Word Search Activity</title>
  <style>
    :root { color-scheme: light; font-family: Arial, Helvetica, sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #f3f6f9; color: #172033; }
    main { width: min(1040px, calc(100% - 28px)); margin: 0 auto; padding: 28px 0 48px; }
    .card { border: 1px solid #cbd5e1; border-radius: 14px; padding: 24px; background: #fff; }
    .heading { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 16px; }
    h1 { margin: 0; font-size: clamp(2rem, 6vw, 3rem); }
    .intro { max-width: 760px; color: #475569; line-height: 1.6; }
    .status { min-height: 48px; margin: 18px 0; border-left: 4px solid #155e75; padding: 10px 12px; background: #f1f5f9; line-height: 1.5; }
    .grid { display: grid; width: min(100%, 720px); margin: 0 auto; gap: 4px; touch-action: none; }
    .cell { display: grid; min-width: 0; aspect-ratio: 1; place-items: center; border: 1px solid #cbd5e1; border-radius: 5px; padding: 2px; background: #f8fafc; color: #172033; font: inherit; font-size: clamp(.82rem, 2.2vw, 1.05rem); font-weight: 800; cursor: pointer; }
    .cell:hover { background: #e8f2f7; }
    .cell:focus-visible { outline: 3px solid #f59e0b; outline-offset: 1px; }
    .cell--selected { border-color: #a16207; background: #fef3c7; }
    .cell--found { border-color: #166534; background: #dcfce7; color: #14532d; }
    .cell--answer { box-shadow: inset 0 0 0 2px #be185d; background: #fce7f3; }
    .word-list { margin-top: 22px; border-top: 1px solid #cbd5e1; padding-top: 18px; }
    .word-list__heading { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
    .words { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; }
    .word { border-radius: 8px; padding: 10px; background: #f1f5f9; }
    .word strong, .word span { display: block; }
    .word span { margin-top: 3px; color: #475569; font-size: .9rem; }
    .word--found strong { text-decoration: line-through; }
    .word--found { background: #dcfce7; color: #14532d; }
    button.control { min-height: 42px; border: 1px solid #155e75; border-radius: 8px; padding: 8px 14px; background: #fff; color: #155e75; font: inherit; font-weight: 700; cursor: pointer; }
    button.control:hover { background: #e8f2f7; }
    button.control:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }
    @media (max-width: 620px) { .card { padding: 16px; } .grid { gap: 2px; } }
  </style>
</head>
<body>
  <main>
    <section class="card" aria-labelledby="activity-title">
      <div class="heading">
        <div>
          <h1 id="activity-title">Phoneme Word Search</h1>
          <p class="intro">Find the phoneme words horizontally, vertically or diagonally. Drag from the first cell to the last, or use the keyboard by activating the first cell and then the last cell. Hover over or focus a cell to see its English letter equivalence.</p>
        </div>
        <button class="control" id="answers-button" type="button">Show answers</button>
      </div>
      <p class="status" id="status" role="status" aria-live="polite">Find the words in the grid.</p>
      <div class="grid" id="grid" role="grid" aria-label="Interactive phoneme word-search grid"></div>
      <section class="word-list" aria-labelledby="word-list-heading">
        <div class="word-list__heading">
          <h2 id="word-list-heading">Word list</h2>
          <p id="found-count">0 found</p>
        </div>
        <div class="words" id="words"></div>
      </section>
    </section>
  </main>
  <script>
    const activity = ${payload};
    const gridElement = document.getElementById('grid');
    const wordsElement = document.getElementById('words');
    const statusElement = document.getElementById('status');
    const foundCountElement = document.getElementById('found-count');
    const answersButton = document.getElementById('answers-button');

    const foundWordIds = new Set();
    let pointerStart = null;
    let pointerPath = [];
    let keyboardStart = null;
    let didPointerDrag = false;
    let suppressNextClick = false;
    let showingAnswers = false;

    function key(coordinate) {
      return coordinate.row + ':' + coordinate.column;
    }

    function getPath(start, end) {
      const rowDelta = end.row - start.row;
      const columnDelta = end.column - start.column;

      if (rowDelta !== 0 && columnDelta !== 0 && Math.abs(rowDelta) !== Math.abs(columnDelta)) {
        return [];
      }

      const steps = Math.max(Math.abs(rowDelta), Math.abs(columnDelta));
      const rowStep = steps === 0 ? 0 : rowDelta / steps;
      const columnStep = steps === 0 ? 0 : columnDelta / steps;

      return Array.from({ length: steps + 1 }, function (_, index) {
        return {
          row: start.row + rowStep * index,
          column: start.column + columnStep * index,
        };
      });
    }

    function pathsMatch(first, second) {
      if (first.length !== second.length) return false;

      const forward = first.every(function (coordinate, index) {
        return coordinate.row === second[index].row && coordinate.column === second[index].column;
      });
      if (forward) return true;

      return first.every(function (coordinate, index) {
        const reverse = second[second.length - 1 - index];
        return coordinate.row === reverse.row && coordinate.column === reverse.column;
      });
    }

    function cellFor(coordinate) {
      return document.querySelector('[data-key="' + key(coordinate) + '"]');
    }

    function clearSelected() {
      gridElement.querySelectorAll('.cell--selected').forEach(function (cell) {
        cell.classList.remove('cell--selected');
      });
    }

    function showSelected(path) {
      clearSelected();
      path.forEach(function (coordinate) {
        const cell = cellFor(coordinate);
        if (cell) cell.classList.add('cell--selected');
      });
    }

    function updateFoundCount() {
      foundCountElement.textContent = foundWordIds.size + ' of ' + activity.entries.length + ' found';
    }

    function markFound(entry) {
      foundWordIds.add(entry.word.id);
      entry.coordinates.forEach(function (coordinate) {
        const cell = cellFor(coordinate);
        if (cell) cell.classList.add('cell--found');
      });
      const item = document.getElementById('word-' + entry.word.id);
      if (item) item.classList.add('word--found');
      updateFoundCount();
      statusElement.textContent = 'Found ' + entry.word.word + ' = /' + entry.word.phonemes.join(' · ') + '/.';
    }

    function checkPath(path) {
      if (path.length === 0) {
        statusElement.textContent = 'Selections must be horizontal, vertical or diagonal.';
        return;
      }

      const entry = activity.entries.find(function (candidate) {
        return !foundWordIds.has(candidate.word.id) && pathsMatch(path, candidate.coordinates);
      });

      if (entry) {
        markFound(entry);
      } else {
        statusElement.textContent = 'That selection is not one of the placed words.';
      }
    }

    function handleKeyboardActivation(coordinate) {
      if (!keyboardStart) {
        keyboardStart = coordinate;
        showSelected([coordinate]);
        statusElement.textContent = 'Start cell selected. Move focus to the final cell and activate it.';
        return;
      }

      const path = getPath(keyboardStart, coordinate);
      checkPath(path);
      keyboardStart = null;
      clearSelected();
    }

    function buildGrid() {
      const columns = activity.grid[0] ? activity.grid[0].length : 1;
      gridElement.style.gridTemplateColumns = 'repeat(' + columns + ', minmax(0, 1fr))';

      activity.grid.forEach(function (row, rowIndex) {
        row.forEach(function (phoneme, columnIndex) {
          const coordinate = { row: rowIndex, column: columnIndex };
          const button = document.createElement('button');
          const hint = activity.hints[phoneme] || ('Phoneme /' + phoneme + '/');
          button.type = 'button';
          button.className = 'cell';
          button.dataset.key = key(coordinate);
          button.textContent = phoneme;
          button.title = '/' + phoneme + '/ — ' + hint;
          button.setAttribute('role', 'gridcell');
          button.setAttribute('aria-label', 'Row ' + (rowIndex + 1) + ', column ' + (columnIndex + 1) + ': ' + phoneme + '. ' + hint);

          button.addEventListener('pointerdown', function (event) {
            if (event.pointerType === 'mouse' && event.button !== 0) return;
            didPointerDrag = false;
            suppressNextClick = false;
            pointerStart = coordinate;
            pointerPath = [coordinate];
            showSelected(pointerPath);
          });

          button.addEventListener('pointerenter', function () {
            if (!pointerStart) return;

            if (
              coordinate.row !== pointerStart.row ||
              coordinate.column !== pointerStart.column
            ) {
              didPointerDrag = true;
              keyboardStart = null;
            }

            pointerPath = getPath(pointerStart, coordinate);
            showSelected(pointerPath);
          });

          button.addEventListener('click', function () {
            if (suppressNextClick) {
              suppressNextClick = false;
              return;
            }

            handleKeyboardActivation(coordinate);
          });

          button.addEventListener('keydown', function (event) {
            const directions = {
              ArrowUp: { row: -1, column: 0 },
              ArrowDown: { row: 1, column: 0 },
              ArrowLeft: { row: 0, column: -1 },
              ArrowRight: { row: 0, column: 1 },
            };

            const direction = directions[event.key];
            if (!direction) return;

            event.preventDefault();

            const nextCoordinate = {
              row: coordinate.row + direction.row,
              column: coordinate.column + direction.column,
            };

            const rowCount = activity.grid.length;
            const columnCount = activity.grid[0] ? activity.grid[0].length : 0;

            if (
              nextCoordinate.row < 0 ||
              nextCoordinate.row >= rowCount ||
              nextCoordinate.column < 0 ||
              nextCoordinate.column >= columnCount
            ) {
              return;
            }

            const target = cellFor(nextCoordinate);
            if (target) target.focus();
          });

          gridElement.appendChild(button);
        });
      });
    }

    function finishPointerSelection(shouldSuppressClick) {
      if (!pointerStart) return;

      if (didPointerDrag) {
        checkPath(pointerPath);
      }

      if (shouldSuppressClick && didPointerDrag) {
        suppressNextClick = true;
      }

      didPointerDrag = false;
      pointerStart = null;
      pointerPath = [];
      clearSelected();
    }

    function buildWordList() {
      activity.entries.forEach(function (entry) {
        const item = document.createElement('div');
        item.className = 'word';
        item.id = 'word-' + entry.word.id;

        const english = document.createElement('strong');
        english.textContent = entry.word.word;
        const phonemes = document.createElement('span');
        phonemes.textContent = entry.word.phonemes.join(' · ');

        item.appendChild(english);
        item.appendChild(phonemes);
        wordsElement.appendChild(item);
      });
      updateFoundCount();
    }

    function toggleAnswers() {
      showingAnswers = !showingAnswers;
      activity.entries.forEach(function (entry) {
        entry.coordinates.forEach(function (coordinate) {
          const cell = cellFor(coordinate);
          if (cell) cell.classList.toggle('cell--answer', showingAnswers);
        });
      });
      answersButton.textContent = showingAnswers ? 'Hide answers' : 'Show answers';
    }

    gridElement.addEventListener('pointerup', function () {
      finishPointerSelection(true);
    });
    gridElement.addEventListener('pointercancel', function () {
      finishPointerSelection(false);
    });
    gridElement.addEventListener('pointerleave', function () {
      finishPointerSelection(false);
    });
    answersButton.addEventListener('click', toggleAnswers);

    buildGrid();
    buildWordList();
  </script>
</body>
</html>`;
}
