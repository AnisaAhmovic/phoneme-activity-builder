"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";

import PrintButton from "@/components/export/PrintButton";
import { getWordsByPhonemeCount } from "@/data/phonemeCorpus";
import { PHONEME_KEYBOARD_ROWS } from "@/data/phonemeKeyboard";
import type { PhonemeCount } from "@/types/phoneme";
import { normalisePhoneme } from "@/utils/normalisePhoneme";

const PHONEME_COUNTS: readonly PhonemeCount[] = [3, 4, 5];
const GRID_ROW_COUNT = 6;
const DEFAULT_PHONEME_COUNT: PhonemeCount = 3;

const defaultWordId =
  getWordsByPhonemeCount(DEFAULT_PHONEME_COUNT)[0]?.id ?? "";

export default function WordleBuilder() {
  const [phonemeCount, setPhonemeCount] = useState<PhonemeCount>(
    DEFAULT_PHONEME_COUNT,
  );
  const [selectedWordId, setSelectedWordId] = useState(defaultWordId);
  const [previewGuess, setPreviewGuess] = useState<string[]>([]);

  const availableWords = getWordsByPhonemeCount(phonemeCount);

  const selectedWord =
    availableWords.find((word) => word.id === selectedWordId) ??
    availableWords[0];

  function handlePhonemeCountChange(
    event: ChangeEvent<HTMLSelectElement>,
  ): void {
    const nextCount = Number(event.target.value) as PhonemeCount;
    const nextWords = getWordsByPhonemeCount(nextCount);

    setPhonemeCount(nextCount);
    setSelectedWordId(nextWords[0]?.id ?? "");
    setPreviewGuess([]);
  }

  function handleWordChange(event: ChangeEvent<HTMLSelectElement>): void {
    setSelectedWordId(event.target.value);
    setPreviewGuess([]);
  }

  function handlePhonemeSelection(phoneme: string): void {
    setPreviewGuess((currentGuess) => {
      if (currentGuess.length >= phonemeCount) {
        return currentGuess;
      }

      return [...currentGuess, phoneme];
    });
  }

  function handleDeletePhoneme(): void {
    setPreviewGuess((currentGuess) => currentGuess.slice(0, -1));
  }

  function handleClearGuess(): void {
    setPreviewGuess([]);
  }

  if (!selectedWord) {
    return (
      <p role="alert">
        No words are available for the selected phoneme count.
      </p>
    );
  }

  return (
    <section aria-label="Wordle activity builder" className="wordle-builder">
      <section className="wordle-builder__controls">
        <div className="section-heading">
          <p className="eyebrow">Configuration</p>
          <h2>Activity settings</h2>
        </div>

        <div className="form-field">
          <label htmlFor="phoneme-count">Number of phonemes</label>

          <select
            aria-describedby="phoneme-count-help"
            id="phoneme-count"
            onChange={handlePhonemeCountChange}
            value={phonemeCount}
          >
            {PHONEME_COUNTS.map((count) => (
              <option key={count} value={count}>
                {count} phonemes
              </option>
            ))}
          </select>

          <p className="form-help" id="phoneme-count-help">
            This determines the number of cells in each grid row.
          </p>
        </div>

        <div className="form-field">
          <label htmlFor="target-word">Target word</label>

          <select
            id="target-word"
            onChange={handleWordChange}
            value={selectedWord.id}
          >
            {availableWords.map((word) => (
              <option key={word.id} value={word.id}>
                {word.word}
              </option>
            ))}
          </select>
        </div>

        <div aria-live="polite" className="selected-word-summary">
          <p>Selected word</p>
          <strong>{selectedWord.word}</strong>
          <span>{selectedWord.phonemes.join(" · ")}</span>
        </div>
      </section>

      <section
        aria-labelledby="wordle-preview-heading"
        className="wordle-builder__preview"
      >
        <div className="activity-preview-heading">
          <div className="section-heading">
            <p className="eyebrow">Live preview</p>
            <h2 id="wordle-preview-heading">Wordle activity</h2>
          </div>

          <div className="export-actions">
            <PrintButton
              label="Print / Save as PDF"
              mode="wordle-activity"
            />
          </div>
        </div>

        <header aria-hidden="true" className="print-sheet-header">
          <p className="print-sheet-header__eyebrow">
            Phoneme Activity Builder
          </p>
          <h1>Phoneme Wordle Activity</h1>
          <div className="print-student-fields">
            <span>Name:</span>
            <span>Date:</span>
          </div>
          <p className="print-sheet-instructions">
            Use the phoneme keyboard to record your guesses. Enter one phoneme
            in each cell.
          </p>
        </header>

        <div className="wordle-workspace">
          <div className="wordle-board">
            <div
              aria-label={`${phonemeCount}-phoneme Wordle grid`}
              className="wordle-grid"
            >
              {Array.from({ length: GRID_ROW_COUNT }, (_, rowIndex) => (
                <div
                  className="wordle-grid__row"
                  key={`row-${rowIndex}`}
                  style={{
                    gridTemplateColumns: `repeat(${phonemeCount}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: phonemeCount }, (_, columnIndex) => {
                    const answerPhoneme =
                      rowIndex === 0
                        ? (selectedWord.phonemes[columnIndex] ?? "")
                        : "";

                    const enteredPhoneme =
                      rowIndex === 1
                        ? (previewGuess[columnIndex] ?? "")
                        : "";

                    const displayedPhoneme = answerPhoneme || enteredPhoneme;

                    const cellState = answerPhoneme
                      ? "answer"
                      : enteredPhoneme
                        ? "entry"
                        : "empty";

                    return (
                      <div
                        aria-label={
                          displayedPhoneme
                            ? `Row ${rowIndex + 1}, cell ${columnIndex + 1}: ${displayedPhoneme}`
                            : `Row ${rowIndex + 1}, cell ${columnIndex + 1}: empty`
                        }
                        className={`wordle-cell wordle-cell--${cellState}`}
                        key={`cell-${rowIndex}-${columnIndex}`}
                      >
                        {displayedPhoneme}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="wordle-preview-key">
              <p>
                <strong>Row 1:</strong> answer preview
              </p>
              <p>
                <strong>Row 2:</strong> keyboard entry preview
              </p>
            </div>
          </div>

          <section
            aria-labelledby="phoneme-keyboard-heading"
            className="phoneme-keyboard"
          >
            <div className="phoneme-keyboard__heading">
              <div>
                <h3 id="phoneme-keyboard-heading">Phoneme keyboard</h3>
                <p>Select symbols to fill the second grid row.</p>
              </div>

              <div className="phoneme-keyboard__actions">
                <button
                  disabled={previewGuess.length === 0}
                  onClick={handleDeletePhoneme}
                  type="button"
                >
                  Delete
                </button>

                <button
                  disabled={previewGuess.length === 0}
                  onClick={handleClearGuess}
                  type="button"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="phoneme-keyboard__rows">
              {PHONEME_KEYBOARD_ROWS.map((row, rowIndex) => (
                <div
                  className="phoneme-keyboard__row"
                  key={`keyboard-row-${rowIndex}`}
                >
                  {row.map((sourcePhoneme) => {
                    const phoneme = normalisePhoneme(sourcePhoneme);

                    return (
                      <button
                        aria-label={`Enter phoneme ${phoneme}`}
                        className="phoneme-key"
                        disabled={previewGuess.length >= phonemeCount}
                        key={`${rowIndex}-${phoneme}`}
                        onClick={() => handlePhonemeSelection(phoneme)}
                        type="button"
                      >
                        {phoneme}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </section>
  );
}
