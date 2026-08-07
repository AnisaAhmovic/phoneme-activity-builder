"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, PointerEvent as ReactPointerEvent } from "react";

import { getWordsByPhonemeCount } from "@/data/phonemeCorpus";
import type { PhonemeCount } from "@/types/phoneme";
import {
  generateWordSearch,
  type GeneratedWordSearch,
  type GridCoordinate,
} from "@/utils/generateWordSearch";

const PHONEME_COUNTS: readonly PhonemeCount[] = [3, 4, 5];
const DEFAULT_PHONEME_COUNT: PhonemeCount = 3;
const DEFAULT_ROWS = 10;
const DEFAULT_COLUMNS = 10;
const DEFAULT_WORD_LIMIT = 9;
const DEFAULT_WORD_IDS = [
  "3-boot",
  "3-bait",
  "3-chin",
  "3-jam",
  "3-ring",
  "3-log",
  "3-fan",
  "3-van",
  "3-sun",
] as const;
const MIN_GRID_SIZE = 6;
const MAX_GRID_SIZE = 16;

function coordinateKey({ row, column }: GridCoordinate): string {
  return `${row}:${column}`;
}

function getSelectionPath(
  start: GridCoordinate,
  end: GridCoordinate,
): GridCoordinate[] {
  const rowDelta = end.row - start.row;
  const columnDelta = end.column - start.column;

  if (
    rowDelta !== 0 &&
    columnDelta !== 0 &&
    Math.abs(rowDelta) !== Math.abs(columnDelta)
  ) {
    return [];
  }

  const steps = Math.max(Math.abs(rowDelta), Math.abs(columnDelta));
  const rowStep = steps === 0 ? 0 : rowDelta / steps;
  const columnStep = steps === 0 ? 0 : columnDelta / steps;

  return Array.from({ length: steps + 1 }, (_, index) => ({
    row: start.row + rowStep * index,
    column: start.column + columnStep * index,
  }));
}

function normaliseGridSize(value: number): number {
  return Math.min(MAX_GRID_SIZE, Math.max(MIN_GRID_SIZE, Math.floor(value)));
}

function buildPuzzle(
  selectedWords: ReturnType<typeof getWordsByPhonemeCount>,
  selectedWordIds: readonly string[],
  rows: number,
  columns: number,
  seed: number,
): GeneratedWordSearch {
  const words = selectedWords.filter((word) => selectedWordIds.includes(word.id));
  return generateWordSearch(words, rows, columns, seed);
}

export default function WordSearchBuilder() {
  const [phonemeCount, setPhonemeCount] = useState<PhonemeCount>(
    DEFAULT_PHONEME_COUNT,
  );
  const availableWords = getWordsByPhonemeCount(phonemeCount);
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>(() =>
    DEFAULT_WORD_IDS.filter((id) =>
      getWordsByPhonemeCount(DEFAULT_PHONEME_COUNT).some((word) => word.id === id),
    ),
  );
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [seed, setSeed] = useState(1);
  const [puzzle, setPuzzle] = useState<GeneratedWordSearch>(() =>
    buildPuzzle(
      getWordsByPhonemeCount(DEFAULT_PHONEME_COUNT),
      DEFAULT_WORD_IDS.filter((id) =>
        getWordsByPhonemeCount(DEFAULT_PHONEME_COUNT).some((word) => word.id === id),
      ),
      DEFAULT_ROWS,
      DEFAULT_COLUMNS,
      1,
    ),
  );
  const [showAnswers, setShowAnswers] = useState(false);
  const [dragStart, setDragStart] = useState<GridCoordinate | null>(null);
  const [selectedPath, setSelectedPath] = useState<GridCoordinate[]>([]);
  const [foundSelections, setFoundSelections] = useState<
    Record<string, readonly GridCoordinate[]>
  >({});

  const selectedWords = useMemo(
    () => availableWords.filter((word) => selectedWordIds.includes(word.id)),
    [availableWords, selectedWordIds],
  );
  const foundWordIds = useMemo(
    () => new Set(Object.keys(foundSelections)),
    [foundSelections],
  );
  const selectedCellKeys = useMemo(
    () => new Set(selectedPath.map(coordinateKey)),
    [selectedPath],
  );
  const foundCellKeys = useMemo(
    () =>
      new Set(
        Object.values(foundSelections).flatMap((coordinates) =>
          coordinates.map(coordinateKey),
        ),
      ),
    [foundSelections],
  );
  const answerCellKeys = useMemo(
    () =>
      new Set(
        puzzle.entries.flatMap((entry) => entry.coordinates.map(coordinateKey)),
      ),
    [puzzle.entries],
  );

  function resetInteractionState(): void {
    setShowAnswers(false);
    setDragStart(null);
    setSelectedPath([]);
    setFoundSelections({});
  }

  function handlePhonemeCountChange(
    event: ChangeEvent<HTMLSelectElement>,
  ): void {
    const nextCount = Number(event.target.value) as PhonemeCount;
    const nextWords = getWordsByPhonemeCount(nextCount);
    const nextIds = nextWords
      .slice(0, DEFAULT_WORD_LIMIT)
      .map((word) => word.id);
    const nextSeed = seed + 1;

    setPhonemeCount(nextCount);
    setSelectedWordIds(nextIds);
    setSeed(nextSeed);
    setPuzzle(buildPuzzle(nextWords, nextIds, rows, columns, nextSeed));
    resetInteractionState();
  }

  function handleWordToggle(wordId: string): void {
    setSelectedWordIds((currentIds) =>
      currentIds.includes(wordId)
        ? currentIds.filter((id) => id !== wordId)
        : [...currentIds, wordId],
    );
  }

  function handleGridSizeChange(
    setter: (value: number) => void,
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    setter(normaliseGridSize(Number(event.target.value)));
  }

  function handleGeneratePuzzle(): void {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    setPuzzle(buildPuzzle(availableWords, selectedWordIds, rows, columns, nextSeed));
    resetInteractionState();
  }

  const checkSelection = useCallback(
    (path: readonly GridCoordinate[]): void => {
      if (path.length === 0) {
        return;
      }

      const selectedPhonemes = path.map(
        ({ row, column }) => puzzle.grid[row]?.[column] ?? "",
      );
      const forwards = selectedPhonemes.join("\u0000");
      const backwards = [...selectedPhonemes].reverse().join("\u0000");
      const matchedWord = selectedWords.find((word) => {
        if (foundWordIds.has(word.id)) {
          return false;
        }

        const target = word.phonemes.join("\u0000");
        return target === forwards || target === backwards;
      });

      if (matchedWord) {
        setFoundSelections((current) => ({
          ...current,
          [matchedWord.id]: [...path],
        }));
      }
    },
    [foundWordIds, puzzle.grid, selectedWords],
  );

  const finishSelection = useCallback((): void => {
    if (!dragStart) {
      return;
    }

    checkSelection(selectedPath);
    setDragStart(null);
    setSelectedPath([]);
  }, [checkSelection, dragStart, selectedPath]);

  useEffect(() => {
    if (!dragStart) {
      return undefined;
    }

    window.addEventListener("pointerup", finishSelection);
    window.addEventListener("pointercancel", finishSelection);

    return () => {
      window.removeEventListener("pointerup", finishSelection);
      window.removeEventListener("pointercancel", finishSelection);
    };
  }, [dragStart, finishSelection]);

  function handlePointerDown(
    coordinate: GridCoordinate,
    event: ReactPointerEvent<HTMLButtonElement>,
  ): void {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    event.preventDefault();
    setDragStart(coordinate);
    setSelectedPath([coordinate]);
  }

  function handlePointerEnter(coordinate: GridCoordinate): void {
    if (!dragStart) {
      return;
    }

    setSelectedPath(getSelectionPath(dragStart, coordinate));
  }

  return (
    <section aria-label="Word Search activity builder" className="word-search-builder">
      <section className="word-search-builder__controls">
        <div className="section-heading">
          <p className="eyebrow">Configuration</p>
          <h2>Activity settings</h2>
        </div>

        <div className="form-field">
          <label htmlFor="word-search-phoneme-count">Number of phonemes</label>
          <select
            id="word-search-phoneme-count"
            onChange={handlePhonemeCountChange}
            value={phonemeCount}
          >
            {PHONEME_COUNTS.map((count) => (
              <option key={count} value={count}>
                {count} phonemes
              </option>
            ))}
          </select>
        </div>

        <div className="word-search-builder__dimensions">
          <div className="form-field">
            <label htmlFor="word-search-rows">Rows</label>
            <input
              id="word-search-rows"
              max={MAX_GRID_SIZE}
              min={MIN_GRID_SIZE}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleGridSizeChange(setRows, event)
              }
              type="number"
              value={rows}
            />
          </div>
          <div className="form-field">
            <label htmlFor="word-search-columns">Columns</label>
            <input
              id="word-search-columns"
              max={MAX_GRID_SIZE}
              min={MIN_GRID_SIZE}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleGridSizeChange(setColumns, event)
              }
              type="number"
              value={columns}
            />
          </div>
        </div>

        <fieldset className="word-search-builder__word-options">
          <legend>Select words</legend>
          <p className="form-help">Select words to include in the generated puzzle.</p>
          <div className="word-search-builder__word-checkboxes">
            {availableWords.map((word) => (
              <label key={word.id}>
                <input
                  checked={selectedWordIds.includes(word.id)}
                  onChange={() => handleWordToggle(word.id)}
                  type="checkbox"
                />
                <span>{word.word}</span>
                <small>{word.phonemes.join(" · ")}</small>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          className="button button--primary word-search-builder__generate"
          disabled={selectedWordIds.length === 0}
          onClick={handleGeneratePuzzle}
          type="button"
        >
          Generate Puzzle
        </button>
      </section>

      <section
        aria-labelledby="word-search-preview-heading"
        className="word-search-builder__preview"
      >
        <div className="word-search-builder__preview-heading">
          <div className="section-heading">
            <p className="eyebrow">Live preview</p>
            <h2 id="word-search-preview-heading">Phoneme word search</h2>
          </div>
          <button
            className="button button--secondary"
            onClick={() => setShowAnswers((current) => !current)}
            type="button"
          >
            {showAnswers ? "Hide Answers" : "Show Answers"}
          </button>
        </div>

        {puzzle.unplacedWordIds.length > 0 ? (
          <p className="word-search-builder__warning" role="status">
            Some selected words could not be placed. Increase the grid size and generate again.
          </p>
        ) : null}

        <div
          aria-label="Interactive phoneme word-search grid"
          className="word-search-grid"
          role="grid"
          style={{
            gridTemplateColumns: `repeat(${puzzle.grid[0]?.length ?? columns}, minmax(0, 1fr))`,
          }}
        >
          {puzzle.grid.flatMap((row, rowIndex) =>
            row.map((phoneme, columnIndex) => {
              const coordinate = { row: rowIndex, column: columnIndex };
              const key = coordinateKey(coordinate);
              const isSelected = selectedCellKeys.has(key);
              const isFound = foundCellKeys.has(key);
              const isAnswer = showAnswers && answerCellKeys.has(key);
              const stateClasses = [
                isAnswer ? "word-search-cell--answer" : "",
                isSelected ? "word-search-cell--selected" : "",
                isFound ? "word-search-cell--found" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}: ${phoneme}`}
                  className={`word-search-cell ${stateClasses}`.trim()}
                  key={key}
                  onPointerDown={(event: ReactPointerEvent<HTMLButtonElement>) =>
                    handlePointerDown(coordinate, event)
                  }
                  onPointerEnter={() => handlePointerEnter(coordinate)}
                  role="gridcell"
                  type="button"
                >
                  {phoneme}
                </button>
              );
            }),
          )}
        </div>

        <section aria-labelledby="word-search-word-list-heading" className="word-search-word-list">
          <div className="word-search-word-list__heading">
            <h3 id="word-search-word-list-heading">Word list</h3>
            <p>{foundWordIds.size} of {puzzle.entries.length} found</p>
          </div>
          <div className="word-search-word-list__items">
            {puzzle.entries.map(({ word }) => {
              const isFound = foundWordIds.has(word.id);
              return (
                <div
                  className={`word-search-word${isFound ? " word-search-word--found" : ""}`}
                  key={word.id}
                >
                  <strong>{word.word}</strong>
                  <span>{word.phonemes.join(" · ")}</span>
                </div>
              );
            })}
          </div>
        </section>
      </section>
    </section>
  );
}
