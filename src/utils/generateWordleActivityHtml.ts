import { PHONEME_HINT_ENTRIES } from "@/data/phonemeHints";
import { NORMALISED_PHONEME_KEYBOARD } from "@/data/phonemeKeyboard";
import type { PhonemeWord } from "@/types/phoneme";

function serialiseForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function generateWordleActivityHtml(word: PhonemeWord): string {
  const payload = serialiseForScript({
    targetWord: word.word,
    targetPhonemes: word.phonemes,
    keyboard: NORMALISED_PHONEME_KEYBOARD,
    hints: Object.fromEntries(PHONEME_HINT_ENTRIES),
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Phoneme Wordle Activity</title>
  <style>
    :root { color-scheme: light; font-family: Arial, Helvetica, sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #f3f6f9; color: #172033; }
    main { width: min(960px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 48px; }
    .card { border: 1px solid #cbd5e1; border-radius: 14px; padding: 24px; background: #fff; }
    h1 { margin: 0; font-size: clamp(2rem, 6vw, 3rem); }
    .intro { max-width: 680px; color: #475569; line-height: 1.6; }
    .game { display: grid; grid-template-columns: minmax(260px, 420px) minmax(260px, 1fr); gap: 28px; align-items: start; }
    .grid { display: grid; gap: 8px; }
    .row { display: grid; gap: 8px; }
    .cell { display: grid; aspect-ratio: 1; place-items: center; border: 2px solid #cbd5e1; border-radius: 8px; background: #fff; font-size: clamp(1.25rem, 5vw, 2rem); font-weight: 800; }
    .cell--exact { border-color: #166534; background: #dcfce7; color: #14532d; }
    .cell--present { border-color: #a16207; background: #fef3c7; color: #713f12; }
    .cell--absent { border-color: #64748b; background: #e2e8f0; color: #334155; }
    .keyboard { display: flex; flex-wrap: wrap; gap: 8px; }
    button { min-width: 46px; min-height: 44px; border: 1px solid #94a3b8; border-radius: 8px; padding: 8px 10px; background: #fff; color: #172033; font: inherit; font-weight: 700; cursor: pointer; }
    button:hover { background: #e8f2f7; }
    button:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }
    button:disabled { cursor: not-allowed; opacity: .5; }
    .controls { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
    .controls button { min-width: 110px; }
    .primary { border-color: #155e75; background: #155e75; color: #fff; }
    .primary:hover { background: #164e63; }
    .status { min-height: 52px; margin: 0 0 18px; border-left: 4px solid #155e75; padding: 10px 12px; background: #f1f5f9; line-height: 1.5; }
    .hint { margin: 14px 0 0; color: #475569; font-size: .95rem; line-height: 1.5; }
    .equivalence { margin-top: 18px; border-radius: 8px; padding: 14px; background: #dcfce7; color: #14532d; font-weight: 700; }
    [hidden] { display: none !important; }
    @media (max-width: 760px) { .game { grid-template-columns: 1fr; } .card { padding: 18px; } }
  </style>
</head>
<body>
  <main>
    <section class="card" aria-labelledby="activity-title">
      <h1 id="activity-title">Phoneme Wordle</h1>
      <p class="intro">Build a phoneme sequence using the keyboard. Green means the phoneme is in the correct position, yellow means it appears elsewhere in the word, and grey means it is not in the target.</p>
      <p class="status" id="status" role="status" aria-live="polite">Select phonemes to make your first guess.</p>
      <div class="game">
        <div>
          <div class="grid" id="grid" aria-label="Phoneme Wordle grid"></div>
          <div class="equivalence" id="equivalence" hidden></div>
        </div>
        <div>
          <h2>Phoneme keyboard</h2>
          <p class="hint">Hover over or focus a phoneme button to see its English letter equivalence, for example /θ/ is TH (as in thin).</p>
          <div class="keyboard" id="keyboard" aria-label="Phoneme keyboard"></div>
          <div class="controls">
            <button id="delete-button" type="button">Delete</button>
            <button class="primary" id="submit-button" type="button">Submit guess</button>
            <button id="restart-button" type="button">Restart</button>
          </div>
        </div>
      </div>
    </section>
  </main>
  <script>
    const activity = ${payload};
    const MAX_ROWS = 6;
    let currentGuess = [];
    let currentRow = 0;
    let gameOver = false;

    const grid = document.getElementById('grid');
    const keyboard = document.getElementById('keyboard');
    const status = document.getElementById('status');
    const equivalence = document.getElementById('equivalence');
    const deleteButton = document.getElementById('delete-button');
    const submitButton = document.getElementById('submit-button');
    const restartButton = document.getElementById('restart-button');

    function cellId(row, column) {
      return 'cell-' + row + '-' + column;
    }

    function buildGrid() {
      grid.innerHTML = '';
      for (let row = 0; row < MAX_ROWS; row += 1) {
        const rowElement = document.createElement('div');
        rowElement.className = 'row';
        rowElement.style.gridTemplateColumns = 'repeat(' + activity.targetPhonemes.length + ', minmax(0, 1fr))';

        for (let column = 0; column < activity.targetPhonemes.length; column += 1) {
          const cell = document.createElement('div');
          cell.className = 'cell';
          cell.id = cellId(row, column);
          cell.setAttribute('aria-label', 'Row ' + (row + 1) + ', cell ' + (column + 1) + ': empty');
          rowElement.appendChild(cell);
        }

        grid.appendChild(rowElement);
      }
    }

    function buildKeyboard() {
      keyboard.innerHTML = '';
      activity.keyboard.forEach(function (phoneme) {
        const button = document.createElement('button');
        const hint = activity.hints[phoneme] || ('Phoneme /' + phoneme + '/');
        button.type = 'button';
        button.textContent = phoneme;
        button.title = '/' + phoneme + '/ — ' + hint;
        button.setAttribute('aria-label', 'Enter phoneme ' + phoneme + '. ' + hint);
        button.addEventListener('click', function () { enterPhoneme(phoneme); });
        keyboard.appendChild(button);
      });
    }

    function renderCurrentGuess() {
      for (let column = 0; column < activity.targetPhonemes.length; column += 1) {
        const cell = document.getElementById(cellId(currentRow, column));
        const phoneme = currentGuess[column] || '';
        cell.textContent = phoneme;
        cell.setAttribute('aria-label', 'Row ' + (currentRow + 1) + ', cell ' + (column + 1) + ': ' + (phoneme || 'empty'));
      }
    }

    function enterPhoneme(phoneme) {
      if (gameOver || currentGuess.length >= activity.targetPhonemes.length) return;
      currentGuess.push(phoneme);
      renderCurrentGuess();
      status.textContent = 'Guess ' + (currentRow + 1) + ': ' + currentGuess.length + ' of ' + activity.targetPhonemes.length + ' phonemes entered.';
    }

    function deletePhoneme() {
      if (gameOver || currentGuess.length === 0) return;
      currentGuess.pop();
      renderCurrentGuess();
    }

    function scoreGuess(guess) {
      const result = Array(activity.targetPhonemes.length).fill('absent');
      const remaining = activity.targetPhonemes.slice();

      guess.forEach(function (phoneme, index) {
        if (phoneme === activity.targetPhonemes[index]) {
          result[index] = 'exact';
          remaining[index] = null;
        }
      });

      guess.forEach(function (phoneme, index) {
        if (result[index] === 'exact') return;
        const matchIndex = remaining.indexOf(phoneme);
        if (matchIndex !== -1) {
          result[index] = 'present';
          remaining[matchIndex] = null;
        }
      });

      return result;
    }

    function submitGuess() {
      if (gameOver) return;
      if (currentGuess.length !== activity.targetPhonemes.length) {
        status.textContent = 'Enter ' + activity.targetPhonemes.length + ' phonemes before submitting.';
        return;
      }

      const result = scoreGuess(currentGuess);
      result.forEach(function (state, column) {
        const cell = document.getElementById(cellId(currentRow, column));
        cell.classList.add('cell--' + state);
      });

      const isCorrect = result.every(function (state) { return state === 'exact'; });
      if (isCorrect) {
        gameOver = true;
        status.textContent = 'Correct. The English word is ' + activity.targetWord + '.';
        equivalence.hidden = false;
        equivalence.textContent = activity.targetWord + ' = /' + activity.targetPhonemes.join(' · ') + '/';
        return;
      }

      currentRow += 1;
      currentGuess = [];

      if (currentRow >= MAX_ROWS) {
        gameOver = true;
        status.textContent = 'No guesses remain. The answer was ' + activity.targetWord + ' = /' + activity.targetPhonemes.join(' · ') + '/.';
        equivalence.hidden = false;
        equivalence.textContent = activity.targetWord + ' = /' + activity.targetPhonemes.join(' · ') + '/';
      } else {
        status.textContent = 'Try again. Start guess ' + (currentRow + 1) + '.';
      }
    }

    function restart() {
      currentGuess = [];
      currentRow = 0;
      gameOver = false;
      equivalence.hidden = true;
      equivalence.textContent = '';
      status.textContent = 'Select phonemes to make your first guess.';
      buildGrid();
    }

    deleteButton.addEventListener('click', deletePhoneme);
    submitButton.addEventListener('click', submitGuess);
    restartButton.addEventListener('click', restart);

    buildGrid();
    buildKeyboard();
  </script>
</body>
</html>`;
}
