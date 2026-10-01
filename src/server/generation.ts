import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import { generationRequestSchema } from "@/lib/reportingValidation";
import { getPrismaClient } from "@/server/prisma";
import { ApiProblem } from "@/server/http";
import { generateWordleActivityHtml } from "@/utils/generateWordleActivityHtml";
import { generateWordSearchActivityHtml } from "@/utils/generateWordSearchActivityHtml";
import { generateWordSearch } from "@/utils/generateWordSearch";
import type { ActivityType } from "@/types/backend";

export function trafficSource(request: Request): "LIVE" | "LOAD_TEST" {
  return process.env.ALLOW_TEST_TRAFFIC === "1" && request.headers.get("x-traffic-source") === "LOAD_TEST"
    ? "LOAD_TEST" : "LIVE";
}

export async function generateActivity(body: unknown, source: "LIVE" | "LOAD_TEST" = "LIVE") {
  const prisma = getPrismaClient();
  const started = performance.now();
  const raw = body as { requestId?: unknown; activity?: { activityType?: unknown } } | null;
  const validId = typeof raw?.requestId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw.requestId);
  const requestId = validId ? raw!.requestId as string : randomUUID();
  const activityType: ActivityType | null = raw?.activity?.activityType === "WORDLE" || raw?.activity?.activityType === "WORD_SEARCH" ? raw.activity.activityType : null;
  const existing = await prisma.generationEvent.findUnique({ where: { requestId } });
  if (existing) return existing;

  let outcome;
  try {
    const { activity } = generationRequestSchema.parse(body);
    const list = await prisma.wordList.findUnique({ where: { id: activity.wordListId }, include: { words: true } });
    if (!list) throw new ApiProblem(400, "LIST_NOT_FOUND", "Choose an existing word list.");
    if (!list.words.length) throw new ApiProblem(400, "EMPTY_WORD_LIST", "Add words to the selected list before generating.");
    const words = activity.selectedWordIds.map(id => list.words.find(word => word.id === id));
    if (words.some(word => !word || word.phonemes.length !== activity.phonemeCount)) {
      throw new ApiProblem(400, "INVALID_WORD_SELECTION", "Selected words must belong to this list and match the phoneme count.");
    }
    const selected = words.map(word => ({ id: word!.id, word: word!.spelling, phonemes: word!.phonemes }));
    let html: string;
    if (activity.activityType === "WORDLE") {
      html = generateWordleActivityHtml(selected[0], activity);
    } else {
      const puzzle = generateWordSearch(selected, activity.gridRows!, activity.gridColumns!);
      if (puzzle.unplacedWordIds.length) throw new ApiProblem(422, "WORDS_NOT_PLACED", "Some words could not be placed. Increase the grid size and try again.");
      html = generateWordSearchActivityHtml(puzzle, activity);
    }
    const base = activity.outputFilename || (activity.activityType === "WORDLE" ? "phoneme-wordle.html" : "phoneme-word-search.html");
    const filename = base.toLowerCase().endsWith(".html") ? base : `${base}.html`;
    outcome = {
      requestId, activityType, source, status: "SUCCESS" as const, filename, html,
      snapshot: { ...activity, wordListName: list.name, words: words.map(word => ({ id: word!.id, spelling: word!.spelling, phonemes: word!.phonemes, hint: word!.hint, difficulty: word!.difficulty })) },
      durationMs: Math.max(0, Math.round(performance.now() - started)),
    };
  } catch (error) {
    // Database/infrastructure failures must remain HTTP errors, never plausible business metrics.
    if (!(error instanceof ZodError) && !(error instanceof ApiProblem)) throw error;
    outcome = {
      requestId, activityType, source, status: "FAILED" as const,
      errorCode: error instanceof ApiProblem ? error.code : "VALIDATION_ERROR",
      message: error instanceof ApiProblem ? error.message : error.issues[0]?.message || "Invalid activity data.",
      durationMs: Math.max(0, Math.round(performance.now() - started)),
    };
  }
  // Unique requestId and upsert mean retried/concurrent requests count only once.
  return prisma.generationEvent.upsert({ where: { requestId }, create: outcome, update: {} });
}
