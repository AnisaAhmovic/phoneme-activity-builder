export type PhonemeCount = 3 | 4 | 5;

export type PhonemeSequence = readonly string[];

export interface PhonemeWord {
  id: string;
  word: string;
  phonemes: PhonemeSequence;
}
