import { FIVE_PHONEME_WORDS } from "@/data/fivePhonemeWords";
import { FOUR_PHONEME_WORDS } from "@/data/fourPhonemeWords";
import { THREE_PHONEME_WORDS } from "@/data/threePhonemeWords";
import type { PhonemeCount, PhonemeWord } from "@/types/phoneme";

export const PHONEME_WORDS_BY_COUNT = {
  3: THREE_PHONEME_WORDS,
  4: FOUR_PHONEME_WORDS,
  5: FIVE_PHONEME_WORDS,
} as const satisfies Readonly<
  Record<PhonemeCount, readonly PhonemeWord[]>
>;

export const ALL_PHONEME_WORDS: readonly PhonemeWord[] = [
  ...THREE_PHONEME_WORDS,
  ...FOUR_PHONEME_WORDS,
  ...FIVE_PHONEME_WORDS,
];

export const PHONEME_CORPUS_SUMMARY = {
  totalWords: ALL_PHONEME_WORDS.length,
  byCount: {
    3: THREE_PHONEME_WORDS.length,
    4: FOUR_PHONEME_WORDS.length,
    5: FIVE_PHONEME_WORDS.length,
  },
} as const;

export function getWordsByPhonemeCount(
  count: PhonemeCount,
): readonly PhonemeWord[] {
  return PHONEME_WORDS_BY_COUNT[count];
}