import type { StoredWord } from "@/types/backend";
import type { PhonemeCount, PhonemeWord } from "@/types/phoneme";

export function storedWordToPhonemeWord(word: StoredWord): PhonemeWord {
  return {
    id: word.id,
    word: word.spelling,
    phonemes: word.phonemes,
  };
}

export function isPhonemeCount(value: number): value is PhonemeCount {
  return value === 3 || value === 4 || value === 5;
}
