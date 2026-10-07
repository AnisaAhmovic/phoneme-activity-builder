import assert from "node:assert/strict";
import test from "node:test";

import type { PhonemeWord } from "@/types/phoneme";
import { generateWordSearch } from "@/utils/generateWordSearch";
import { generateWordSearchActivityHtml } from "@/utils/generateWordSearchActivityHtml";
import { generateWordleActivityHtml } from "@/utils/generateWordleActivityHtml";

const teacherWord: PhonemeWord = {
  id: "teacher-chip",
  word: "chip",
  phonemes: ["tʃ", "ɪ", "p"],
};

test("Wordle export embeds teacher content and saved output settings", () => {
  const html = generateWordleActivityHtml(teacherWord, {
    maxAttempts: 4,
    hintsEnabled: false,
    includeAnswerKey: false,
  });

  assert.match(html, /<!doctype html>/u);
  assert.match(html, /"targetWord":"chip"/u);
  assert.match(html, /"targetPhonemes":\["tʃ","ɪ","p"\]/u);
  assert.match(html, /"maxAttempts":4/u);
  assert.match(html, /"hintsEnabled":false/u);
  assert.match(html, /"includeAnswerKey":false/u);
});

test("Word Search export embeds a generated puzzle from teacher words", () => {
  const secondWord: PhonemeWord = {
    id: "teacher-ship",
    word: "ship",
    phonemes: ["ʃ", "ɪ", "p"],
  };
  const puzzle = generateWordSearch([teacherWord, secondWord], 8, 8, 42);
  const html = generateWordSearchActivityHtml(puzzle, {
    hintsEnabled: true,
    includeAnswerKey: false,
  });

  assert.equal(puzzle.entries.length, 2);
  assert.match(html, /"word":"chip"/u);
  assert.match(html, /"word":"ship"/u);
  assert.match(html, /"includeAnswerKey":false/u);
  assert.doesNotMatch(html, /id="answers-button"/u);
});

test("teacher-entered phonemes remain playable in the exported Wordle keyboard", () => {
  const html = generateWordleActivityHtml({ id: "custom", word: "custom", phonemes: ["x", "y", "z"] });
  const payload = JSON.parse(html.match(/const activity = (.*);/u)![1]);
  assert.ok(payload.keyboard.includes("x"));
  assert.ok(payload.keyboard.includes("y"));
});
