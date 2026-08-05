import type { PhonemeWord } from "@/types/phoneme";

export interface CorpusValidationResult {
  isValid: boolean;
  errors: readonly string[];
}

export function validatePhonemeCorpus(
  words: readonly PhonemeWord[],
): CorpusValidationResult {
  const errors: string[] = [];
  const registeredIds = new Set<string>();
  const registeredWords = new Set<string>();

  for (const entry of words) {
    if (!entry.id.trim()) {
      errors.push("A corpus entry has an empty identifier.");
    }

    if (registeredIds.has(entry.id)) {
      errors.push(`Duplicate identifier: ${entry.id}`);
    }

    registeredIds.add(entry.id);

    if (!entry.word.trim()) {
      errors.push(`Entry ${entry.id} has an empty word.`);
    }

    const normalisedWord = entry.word.trim().toLowerCase();

    if (registeredWords.has(normalisedWord)) {
      errors.push(`Duplicate word: ${entry.word}`);
    }

    registeredWords.add(normalisedWord);

    if (entry.phonemes.length < 3 || entry.phonemes.length > 5) {
      errors.push(
        `${entry.word} has an unsupported phoneme count: ${entry.phonemes.length}`,
      );
    }

    if (!entry.id.startsWith(`${entry.phonemes.length}-`)) {
      errors.push(
        `${entry.id} does not match its phoneme count of ${entry.phonemes.length}.`,
      );
    }

    entry.phonemes.forEach((phoneme, index) => {
      if (!phoneme.trim()) {
        errors.push(
          `${entry.word} has an empty phoneme at position ${index + 1}.`,
        );
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
