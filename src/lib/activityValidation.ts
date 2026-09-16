import { z } from "zod";

import { ACTIVITY_TYPES, DIFFICULTY_LEVELS } from "@/types/backend";

const identifierSchema = z.string().trim().min(1).max(64);
const nullableText = (maximumLength: number) =>
  z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().trim().max(maximumLength).nullable().optional(),
  );

const outputFilenameSchema = nullableText(100).refine(
  (value) => value === undefined || value === null || !/[\\/]/u.test(value),
  "The output filename cannot contain a path separator.",
);

const difficultySchema = z.enum(DIFFICULTY_LEVELS);

const wordFields = {
  spelling: z
    .string()
    .trim()
    .min(1, "Enter the written word.")
    .max(60, "The written word must be 60 characters or fewer.")
    .regex(
      /^[\p{L}\p{M}' -]+$/u,
      "Use letters, spaces, apostrophes or hyphens in the written word.",
    ),
  phonemes: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Phoneme symbols cannot be empty.")
        .max(12, "Each phoneme symbol must be 12 characters or fewer."),
    )
    .min(3, "Enter at least three phonemes.")
    .max(5, "Enter no more than five phonemes."),
  hint: nullableText(160),
  difficulty: difficultySchema,
};

const wordCreateFields = {
  ...wordFields,
  difficulty: difficultySchema.default("BEGINNER"),
};

export const wordListCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a word-list name.")
    .max(80, "The word-list name must be 80 characters or fewer."),
  description: nullableText(500),
  words: z.array(z.object(wordCreateFields)).max(100).default([]),
});

export const wordListUpdateSchema = wordListCreateSchema
  .omit({ words: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one word-list field to update.",
  });

export const wordCreateSchema = z.object({
  wordListId: identifierSchema,
  ...wordCreateFields,
});

export const wordUpdateSchema = z
  .object(wordFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one word field to update.",
  });

const activityConfigurationFields = {
  name: z
    .string()
    .trim()
    .min(1, "Enter a saved activity name.")
    .max(80, "The activity name must be 80 characters or fewer."),
  activityType: z.enum(ACTIVITY_TYPES),
  difficulty: difficultySchema,
  phonemeCount: z.union([z.literal(3), z.literal(4), z.literal(5)]),
  wordListId: identifierSchema,
  selectedWordIds: z
    .array(identifierSchema)
    .min(1, "Select at least one word.")
    .max(12, "Select no more than 12 words."),
  targetWordId: identifierSchema.nullable().optional(),
  gridRows: z.number().int().min(6).max(16).nullable().optional(),
  gridColumns: z.number().int().min(6).max(16).nullable().optional(),
  maxAttempts: z.number().int().min(1).max(10),
  hintsEnabled: z.boolean(),
  includeAnswerKey: z.boolean(),
  outputFilename: outputFilenameSchema,
  notes: nullableText(500),
};

const baseActivityConfigurationSchema = z.object({
  ...activityConfigurationFields,
  difficulty: difficultySchema.default("BEGINNER"),
  maxAttempts: activityConfigurationFields.maxAttempts.default(6),
  hintsEnabled: activityConfigurationFields.hintsEnabled.default(true),
  includeAnswerKey:
    activityConfigurationFields.includeAnswerKey.default(true),
});

export const activityConfigurationCreateSchema =
  baseActivityConfigurationSchema.superRefine((value, context) => {
    const uniqueWordIds = new Set(value.selectedWordIds);

    if (uniqueWordIds.size !== value.selectedWordIds.length) {
      context.addIssue({
        code: "custom",
        path: ["selectedWordIds"],
        message: "Each selected word may only appear once.",
      });
    }

    if (value.activityType === "WORDLE") {
      if (value.selectedWordIds.length !== 1) {
        context.addIssue({
          code: "custom",
          path: ["selectedWordIds"],
          message: "A Wordle activity must contain one target word.",
        });
      }

      if (
        !value.targetWordId ||
        !value.selectedWordIds.includes(value.targetWordId)
      ) {
        context.addIssue({
          code: "custom",
          path: ["targetWordId"],
          message: "Choose the selected word as the Wordle target.",
        });
      }
    }

    if (value.activityType === "WORD_SEARCH") {
      if (value.gridRows === null || value.gridRows === undefined) {
        context.addIssue({
          code: "custom",
          path: ["gridRows"],
          message: "Choose the number of word-search rows.",
        });
      }

      if (value.gridColumns === null || value.gridColumns === undefined) {
        context.addIssue({
          code: "custom",
          path: ["gridColumns"],
          message: "Choose the number of word-search columns.",
        });
      }
    }
  });

export const activityConfigurationUpdateSchema =
  z
    .object(activityConfigurationFields)
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
      message: "Provide at least one activity field to update.",
    });

export const activityTypeQuerySchema = z.enum(ACTIVITY_TYPES).optional();

export type WordListCreateInput = z.infer<typeof wordListCreateSchema>;
export type WordListUpdateInput = z.infer<typeof wordListUpdateSchema>;
export type WordCreateInput = z.infer<typeof wordCreateSchema>;
export type WordUpdateInput = z.infer<typeof wordUpdateSchema>;
export type ActivityConfigurationCreateInput = z.infer<
  typeof activityConfigurationCreateSchema
>;
export type ActivityConfigurationUpdateInput = z.infer<
  typeof activityConfigurationUpdateSchema
>;
