export const ACTIVITY_TYPES = ["WORDLE", "WORD_SEARCH"] as const;
export const DIFFICULTY_LEVELS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "CUSTOM",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export interface StoredWord {
  id: string;
  spelling: string;
  phonemes: string[];
  hint: string | null;
  difficulty: DifficultyLevel;
  wordListId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredWordList {
  id: string;
  name: string;
  description: string | null;
  words: StoredWord[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityConfigurationSelection {
  position: number;
  isTarget: boolean;
  word: StoredWord;
}

export interface StoredActivityConfiguration {
  id: string;
  name: string;
  activityType: ActivityType;
  difficulty: DifficultyLevel;
  phonemeCount: number;
  gridRows: number | null;
  gridColumns: number | null;
  maxAttempts: number;
  hintsEnabled: boolean;
  includeAnswerKey: boolean;
  outputFilename: string | null;
  notes: string | null;
  wordListId: string;
  wordSelections: ActivityConfigurationSelection[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityConfigurationInput {
  name: string;
  activityType: ActivityType;
  difficulty: DifficultyLevel;
  phonemeCount: number;
  wordListId: string;
  selectedWordIds: string[];
  targetWordId?: string | null;
  gridRows?: number | null;
  gridColumns?: number | null;
  maxAttempts?: number;
  hintsEnabled?: boolean;
  includeAnswerKey?: boolean;
  outputFilename?: string | null;
  notes?: string | null;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
