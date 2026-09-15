-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('WORDLE', 'WORD_SEARCH');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'CUSTOM');

-- CreateTable
CREATE TABLE "WordList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "spelling" TEXT NOT NULL,
    "phonemes" TEXT[],
    "hint" TEXT,
    "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'BEGINNER',
    "wordListId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityConfiguration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'BEGINNER',
    "phonemeCount" INTEGER NOT NULL,
    "gridRows" INTEGER,
    "gridColumns" INTEGER,
    "maxAttempts" INTEGER NOT NULL DEFAULT 6,
    "hintsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "includeAnswerKey" BOOLEAN NOT NULL DEFAULT true,
    "outputFilename" TEXT,
    "notes" TEXT,
    "wordListId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityConfigurationWord" (
    "configurationId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isTarget" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ActivityConfigurationWord_pkey" PRIMARY KEY ("configurationId","wordId")
);

-- CreateIndex
CREATE UNIQUE INDEX "WordList_name_key" ON "WordList"("name");

-- CreateIndex
CREATE INDEX "WordList_name_idx" ON "WordList"("name");

-- CreateIndex
CREATE INDEX "Word_wordListId_idx" ON "Word"("wordListId");

-- CreateIndex
CREATE INDEX "Word_difficulty_idx" ON "Word"("difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "Word_wordListId_spelling_key" ON "Word"("wordListId", "spelling");

-- CreateIndex
CREATE INDEX "ActivityConfiguration_activityType_idx" ON "ActivityConfiguration"("activityType");

-- CreateIndex
CREATE INDEX "ActivityConfiguration_wordListId_idx" ON "ActivityConfiguration"("wordListId");

-- CreateIndex
CREATE INDEX "ActivityConfigurationWord_wordId_idx" ON "ActivityConfigurationWord"("wordId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityConfigurationWord_configurationId_position_key" ON "ActivityConfigurationWord"("configurationId", "position");

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_wordListId_fkey" FOREIGN KEY ("wordListId") REFERENCES "WordList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityConfiguration" ADD CONSTRAINT "ActivityConfiguration_wordListId_fkey" FOREIGN KEY ("wordListId") REFERENCES "WordList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityConfigurationWord" ADD CONSTRAINT "ActivityConfigurationWord_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "ActivityConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityConfigurationWord" ADD CONSTRAINT "ActivityConfigurationWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
