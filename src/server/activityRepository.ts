import type {
  ActivityConfigurationCreateInput,
  ActivityConfigurationUpdateInput,
  WordCreateInput,
  WordListCreateInput,
  WordListUpdateInput,
  WordUpdateInput,
} from "@/lib/activityValidation";
import { activityConfigurationCreateSchema } from "@/lib/activityValidation";
import { ApiProblem } from "@/server/http";
import { getPrismaClient } from "@/server/prisma";
import type { ActivityType } from "@/types/backend";

const wordListInclude = {
  words: {
    orderBy: [{ spelling: "asc" as const }, { createdAt: "asc" as const }],
  },
};

const activityConfigurationInclude = {
  wordSelections: {
    include: { word: true },
    orderBy: { position: "asc" as const },
  },
};

export function listWordLists() {
  return getPrismaClient().wordList.findMany({
    include: wordListInclude,
    orderBy: { name: "asc" },
  });
}

export function getWordList(id: string) {
  return getPrismaClient().wordList.findUnique({
    where: { id },
    include: wordListInclude,
  });
}

export function createWordList(input: WordListCreateInput) {
  return getPrismaClient().wordList.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      words: {
        create: input.words.map((word) => ({
          spelling: word.spelling,
          phonemes: word.phonemes,
          hint: word.hint ?? null,
          difficulty: word.difficulty,
        })),
      },
    },
    include: wordListInclude,
  });
}

export function updateWordList(id: string, input: WordListUpdateInput) {
  return getPrismaClient().wordList.update({
    where: { id },
    data: input,
    include: wordListInclude,
  });
}

export function deleteWordList(id: string) {
  return getPrismaClient().wordList.delete({ where: { id } });
}

export function listWords(wordListId?: string) {
  return getPrismaClient().word.findMany({
    where: wordListId ? { wordListId } : undefined,
    orderBy: [{ spelling: "asc" }, { createdAt: "asc" }],
  });
}

export function getWord(id: string) {
  return getPrismaClient().word.findUnique({ where: { id } });
}

export function createWord(input: WordCreateInput) {
  return getPrismaClient().word.create({
    data: {
      wordListId: input.wordListId,
      spelling: input.spelling,
      phonemes: input.phonemes,
      hint: input.hint ?? null,
      difficulty: input.difficulty,
    },
  });
}

export function updateWord(id: string, input: WordUpdateInput) {
  return getPrismaClient().word.update({
    where: { id },
    data: input,
  });
}

export function deleteWord(id: string) {
  return getPrismaClient().word.delete({ where: { id } });
}

export function listActivityConfigurations(activityType?: ActivityType) {
  return getPrismaClient().activityConfiguration.findMany({
    where: activityType ? { activityType } : undefined,
    include: activityConfigurationInclude,
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
  });
}

export function getActivityConfiguration(id: string) {
  return getPrismaClient().activityConfiguration.findUnique({
    where: { id },
    include: activityConfigurationInclude,
  });
}

async function validateConfigurationWords(
  input: ActivityConfigurationCreateInput,
): Promise<void> {
  const uniqueWordIds = [...new Set(input.selectedWordIds)];
  const words = await getPrismaClient().word.findMany({
    where: {
      id: { in: uniqueWordIds },
      wordListId: input.wordListId,
    },
    select: { id: true, phonemes: true },
  });

  if (words.length !== uniqueWordIds.length) {
    throw new ApiProblem(
      400,
      "INVALID_WORD_SELECTION",
      "Every selected word must exist in the chosen word list.",
    );
  }

  if (words.some((word) => word.phonemes.length !== input.phonemeCount)) {
    throw new ApiProblem(
      400,
      "PHONEME_COUNT_MISMATCH",
      "Every selected word must match the activity phoneme count.",
    );
  }
}

function configurationData(input: ActivityConfigurationCreateInput) {
  return {
    name: input.name,
    activityType: input.activityType,
    difficulty: input.difficulty,
    phonemeCount: input.phonemeCount,
    gridRows: input.activityType === "WORD_SEARCH" ? input.gridRows : null,
    gridColumns:
      input.activityType === "WORD_SEARCH" ? input.gridColumns : null,
    maxAttempts: input.maxAttempts,
    hintsEnabled: input.hintsEnabled,
    includeAnswerKey: input.includeAnswerKey,
    outputFilename: input.outputFilename ?? null,
    notes: input.notes ?? null,
    wordListId: input.wordListId,
    wordSelections: {
      create: input.selectedWordIds.map((wordId, position) => ({
        wordId,
        position,
        isTarget:
          input.activityType === "WORDLE" && wordId === input.targetWordId,
      })),
    },
  };
}

export async function createActivityConfiguration(
  input: ActivityConfigurationCreateInput,
) {
  await validateConfigurationWords(input);

  return getPrismaClient().activityConfiguration.create({
    data: configurationData(input),
    include: activityConfigurationInclude,
  });
}

export async function updateActivityConfiguration(
  id: string,
  input: ActivityConfigurationUpdateInput,
) {
  const current = await getActivityConfiguration(id);

  if (!current) {
    throw new ApiProblem(404, "NOT_FOUND", "The saved activity was not found.");
  }

  const currentTarget = current.wordSelections.find(
    (selection) => selection.isTarget,
  )?.wordId;

  const mergedInput = activityConfigurationCreateSchema.parse({
    name: current.name,
    activityType: current.activityType,
    difficulty: current.difficulty,
    phonemeCount: current.phonemeCount,
    wordListId: current.wordListId,
    selectedWordIds: current.wordSelections.map((selection) => selection.wordId),
    targetWordId: currentTarget ?? null,
    gridRows: current.gridRows,
    gridColumns: current.gridColumns,
    maxAttempts: current.maxAttempts,
    hintsEnabled: current.hintsEnabled,
    includeAnswerKey: current.includeAnswerKey,
    outputFilename: current.outputFilename,
    notes: current.notes,
    ...input,
  });

  await validateConfigurationWords(mergedInput);

  return getPrismaClient().activityConfiguration.update({
    where: { id },
    data: {
      ...configurationData(mergedInput),
      wordSelections: {
        deleteMany: {},
        create: configurationData(mergedInput).wordSelections.create,
      },
    },
    include: activityConfigurationInclude,
  });
}

export function deleteActivityConfiguration(id: string) {
  return getPrismaClient().activityConfiguration.delete({ where: { id } });
}
