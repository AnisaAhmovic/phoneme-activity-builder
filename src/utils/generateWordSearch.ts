import type { PhonemeWord } from "@/types/phoneme";

export interface GridCoordinate {
  row: number;
  column: number;
}

export interface WordSearchEntry {
  word: PhonemeWord;
  coordinates: readonly GridCoordinate[];
}

export interface GeneratedWordSearch {
  grid: readonly (readonly string[])[];
  entries: readonly WordSearchEntry[];
  unplacedWordIds: readonly string[];
}

interface Direction {
  rowStep: -1 | 0 | 1;
  columnStep: -1 | 0 | 1;
}

const DIRECTIONS: readonly Direction[] = [
  { rowStep: 0, columnStep: 1 },
  { rowStep: 0, columnStep: -1 },
  { rowStep: 1, columnStep: 0 },
  { rowStep: -1, columnStep: 0 },
  { rowStep: 1, columnStep: 1 },
  { rowStep: 1, columnStep: -1 },
  { rowStep: -1, columnStep: 1 },
  { rowStep: -1, columnStep: -1 },
];

const MAX_PLACEMENT_ATTEMPTS = 200;

function createSeededRandom(seed: number): () => number {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function randomItem<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)] as T;
}

function getCoordinates(
  startRow: number,
  startColumn: number,
  direction: Direction,
  length: number,
): GridCoordinate[] {
  return Array.from({ length }, (_, index) => ({
    row: startRow + direction.rowStep * index,
    column: startColumn + direction.columnStep * index,
  }));
}

function canPlaceWord(
  grid: readonly (readonly (string | null)[])[],
  phonemes: readonly string[],
  coordinates: readonly GridCoordinate[],
): boolean {
  return coordinates.every(({ row, column }, index) => {
    const current = grid[row]?.[column];
    return current !== undefined && (current === null || current === phonemes[index]);
  });
}

export function generateWordSearch(
  words: readonly PhonemeWord[],
  rows: number,
  columns: number,
  seed = Date.now(),
): GeneratedWordSearch {
  const safeRows = Math.max(3, Math.floor(rows));
  const safeColumns = Math.max(3, Math.floor(columns));
  const random = createSeededRandom(seed);
  const grid: (string | null)[][] = Array.from({ length: safeRows }, () =>
    Array<string | null>(safeColumns).fill(null),
  );
  const entries: WordSearchEntry[] = [];
  const unplacedWordIds: string[] = [];

  for (const word of words) {
    let placed = false;

    for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt += 1) {
      const direction = randomItem(DIRECTIONS, random);
      const startRow = Math.floor(random() * safeRows);
      const startColumn = Math.floor(random() * safeColumns);
      const coordinates = getCoordinates(
        startRow,
        startColumn,
        direction,
        word.phonemes.length,
      );

      if (!canPlaceWord(grid, word.phonemes, coordinates)) {
        continue;
      }

      coordinates.forEach(({ row, column }, index) => {
        grid[row][column] = word.phonemes[index] ?? null;
      });
      entries.push({ word, coordinates });
      placed = true;
      break;
    }

    if (!placed) {
      unplacedWordIds.push(word.id);
    }
  }

  const phonemePool = Array.from(
    new Set(words.flatMap((word) => [...word.phonemes])),
  );
  const fallbackPool = ["p", "t", "k", "m", "n", "s", "æ", "ɪ", "ɐ"];
  const fillerPool = phonemePool.length > 0 ? phonemePool : fallbackPool;

  const completedGrid = grid.map((row) =>
    row.map((cell) => cell ?? randomItem(fillerPool, random)),
  );

  return {
    grid: completedGrid,
    entries,
    unplacedWordIds,
  };
}
