import { normalisePhoneme } from "@/utils/normalisePhoneme";

export const PHONEME_KEYBOARD_ROWS = [
  ["p", "t", "k"],
  ["b", "d", "g"],
  ["n", "m", "ŋ"],
  ["f", "s", "θ", "ʃ"],
  ["v", "z", "ð", "ʒ"],
  ["l", "ɹ", "w", "j"],
  ["h", "tʃ", "dʒ"],
  ["iː", "ɪ", "e", "eː"],
  ["æ", "ɐ", "ɐː", "ɜː"],
  ["ʉː", "ɔ", "oː", "ʊ"],
  ["æɪ", "ɑe", "oɪ", "əʉ"],
  ["æɔ", "ɪə"],
  ["ə"],
] as const;

export const PHONEME_KEYBOARD = PHONEME_KEYBOARD_ROWS.flat();

export const NORMALISED_PHONEME_KEYBOARD = [
  ...new Set(PHONEME_KEYBOARD.map(normalisePhoneme)),
];

export type KeyboardPhoneme = (typeof PHONEME_KEYBOARD)[number];