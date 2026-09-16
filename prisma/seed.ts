import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { ALL_PHONEME_WORDS } from "../src/data/phonemeCorpus";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main(): Promise<void> {
  const wordList = await prisma.wordList.upsert({
    where: { name: "Core phoneme words" },
    create: {
      name: "Core phoneme words",
      description:
        "Starter corpus containing three, four and five phoneme words.",
    },
    update: {
      description:
        "Starter corpus containing three, four and five phoneme words.",
    },
  });

  for (const word of ALL_PHONEME_WORDS) {
    await prisma.word.upsert({
      where: {
        wordListId_spelling: {
          wordListId: wordList.id,
          spelling: word.word,
        },
      },
      create: {
        id: word.id,
        wordListId: wordList.id,
        spelling: word.word,
        phonemes: [...word.phonemes],
        hint: `/${word.phonemes.join(" ")}/`,
        difficulty: "BEGINNER",
      },
      update: {
        phonemes: [...word.phonemes],
        hint: `/${word.phonemes.join(" ")}/`,
      },
    });
  }

  const wordleTarget = await prisma.word.findFirstOrThrow({
    where: { wordListId: wordList.id, id: "3-boot" },
  });

  const wordSearchWords = await prisma.word.findMany({
    where: {
      wordListId: wordList.id,
      id: { in: ["3-boot", "3-bait", "3-chin", "3-jam", "3-ring"] },
    },
    orderBy: { id: "asc" },
  });

  await prisma.activityConfiguration.deleteMany({
    where: { id: { in: ["sample-wordle", "sample-word-search"] } },
  });

  await prisma.activityConfiguration.create({
    data: {
      id: "sample-wordle",
      name: "Three phoneme Wordle",
      activityType: "WORDLE",
      difficulty: "BEGINNER",
      phonemeCount: 3,
      maxAttempts: 6,
      hintsEnabled: true,
      includeAnswerKey: true,
      outputFilename: "three-phoneme-wordle.html",
      notes: "Starter configuration for the video walkthrough.",
      wordListId: wordList.id,
      wordSelections: {
        create: {
          wordId: wordleTarget.id,
          position: 0,
          isTarget: true,
        },
      },
    },
  });

  await prisma.activityConfiguration.create({
    data: {
      id: "sample-word-search",
      name: "Five word phoneme search",
      activityType: "WORD_SEARCH",
      difficulty: "BEGINNER",
      phonemeCount: 3,
      gridRows: 10,
      gridColumns: 10,
      maxAttempts: 6,
      hintsEnabled: true,
      includeAnswerKey: true,
      outputFilename: "five-word-phoneme-search.html",
      notes: "Starter configuration for the video walkthrough.",
      wordListId: wordList.id,
      wordSelections: {
        create: wordSearchWords.map((word, position) => ({
          wordId: word.id,
          position,
          isTarget: false,
        })),
      },
    },
  });

  console.log(
    `Seeded ${ALL_PHONEME_WORDS.length} words and two activity configurations.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
