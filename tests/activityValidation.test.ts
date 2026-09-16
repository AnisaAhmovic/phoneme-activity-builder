import assert from "node:assert/strict";
import test from "node:test";

import {
  activityConfigurationCreateSchema,
  activityConfigurationUpdateSchema,
  wordCreateSchema,
  wordUpdateSchema,
} from "@/lib/activityValidation";

test("accepts multi-character phonemes as individual sequence items", () => {
  const word = wordCreateSchema.parse({
    wordListId: "list-1",
    spelling: "chip",
    phonemes: ["tʃ", "ɪ", "p"],
    hint: "Starts with CH",
    difficulty: "BEGINNER",
  });

  assert.deepEqual(word.phonemes, ["tʃ", "ɪ", "p"]);
});

test("rejects words outside the supported three-to-five phoneme range", () => {
  const result = wordCreateSchema.safeParse({
    wordListId: "list-1",
    spelling: "at",
    phonemes: ["æ", "t"],
    difficulty: "BEGINNER",
  });

  assert.equal(result.success, false);
});

test("requires one selected target for a Wordle configuration", () => {
  const result = activityConfigurationCreateSchema.safeParse({
    name: "Invalid Wordle",
    activityType: "WORDLE",
    difficulty: "BEGINNER",
    phonemeCount: 3,
    wordListId: "list-1",
    selectedWordIds: ["word-1", "word-2"],
    targetWordId: "word-1",
  });

  assert.equal(result.success, false);
});

test("requires valid grid dimensions for a Word Search configuration", () => {
  const result = activityConfigurationCreateSchema.safeParse({
    name: "Invalid search",
    activityType: "WORD_SEARCH",
    difficulty: "BEGINNER",
    phonemeCount: 3,
    wordListId: "list-1",
    selectedWordIds: ["word-1"],
    gridRows: 5,
    gridColumns: 20,
  });

  assert.equal(result.success, false);
});

test("rejects path separators in downloadable filenames", () => {
  const result = activityConfigurationCreateSchema.safeParse({
    name: "Unsafe filename",
    activityType: "WORDLE",
    difficulty: "BEGINNER",
    phonemeCount: 3,
    wordListId: "list-1",
    selectedWordIds: ["word-1"],
    targetWordId: "word-1",
    outputFilename: "../activity.html",
  });

  assert.equal(result.success, false);
});

test("partial update schemas do not inject unrelated defaults", () => {
  assert.deepEqual(wordUpdateSchema.parse({ hint: "New hint" }), {
    hint: "New hint",
  });
  assert.deepEqual(
    activityConfigurationUpdateSchema.parse({ notes: "Revised" }),
    { notes: "Revised" },
  );
});
