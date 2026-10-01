-- CreateEnum
CREATE TYPE "TrafficSource" AS ENUM ('LIVE', 'SIMULATED', 'LOAD_TEST');

-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "GenerationEvent" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "activityType" "ActivityType",
    "status" "GenerationStatus" NOT NULL,
    "source" "TrafficSource" NOT NULL DEFAULT 'LIVE',
    "filename" TEXT,
    "errorCode" TEXT,
    "message" TEXT,
    "durationMs" INTEGER NOT NULL,
    "snapshot" JSONB,
    "html" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenerationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageVisit" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "activeMs" INTEGER NOT NULL DEFAULT 0,
    "source" "TrafficSource" NOT NULL DEFAULT 'LIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GenerationEvent_requestId_key" ON "GenerationEvent"("requestId");

-- CreateIndex
CREATE INDEX "GenerationEvent_source_createdAt_idx" ON "GenerationEvent"("source", "createdAt");

-- CreateIndex
CREATE INDEX "GenerationEvent_status_activityType_createdAt_idx" ON "GenerationEvent"("status", "activityType", "createdAt");

-- CreateIndex
CREATE INDEX "PageVisit_source_createdAt_idx" ON "PageVisit"("source", "createdAt");


-- Bound anonymous telemetry and prevent inconsistent generation outcomes.
ALTER TABLE "PageVisit" ADD CONSTRAINT "PageVisit_activeMs_check" CHECK ("activeMs" BETWEEN 0 AND 1800000);
ALTER TABLE "GenerationEvent" ADD CONSTRAINT "GenerationEvent_durationMs_check" CHECK ("durationMs" >= 0);
ALTER TABLE "GenerationEvent" ADD CONSTRAINT "GenerationEvent_outcome_check" CHECK (
  ("status" = 'SUCCESS' AND "activityType" IS NOT NULL AND ("html" IS NOT NULL OR "source" = 'SIMULATED')) OR
  ("status" = 'FAILED' AND "html" IS NULL AND "errorCode" IS NOT NULL)
);
