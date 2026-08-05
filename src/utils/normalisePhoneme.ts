const PHONEME_ALIASES: Readonly<Record<string, string>> = {
  g: "ɡ",
};

export function normalisePhoneme(phoneme: string): string {
  const trimmedPhoneme = phoneme.trim();

  return PHONEME_ALIASES[trimmedPhoneme] ?? trimmedPhoneme;
}