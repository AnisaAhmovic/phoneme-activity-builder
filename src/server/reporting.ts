import { getPrismaClient } from "@/server/prisma";
import type { reportQuerySchema } from "@/lib/reportingValidation";
import type { z } from "zod";

export type ReportQuery = z.infer<typeof reportQuerySchema>;
export function reportWhere(query: ReportQuery, now = new Date()) {
  return {
    ...(query.source === "ALL" ? {} : { source: query.source }),
    createdAt: {
      gte:
        query.days === "all"
          ? new Date(0)
          : new Date(now.getTime() - Number(query.days) * 86400000),
      lte: now,
    },
  };
}

export async function getReport(query: ReportQuery) {
  const db = getPrismaClient();
  const now = new Date();
  const where = reportWhere(query, now);
  return db.$transaction(
    async (tx) => {
      const [
        lists,
        words,
        configurations,
        outcomes,
        visits,
        pages,
        recent,
        daily,
      ] = await Promise.all([
        tx.wordList.findMany({
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            _count: { select: { words: true, activityConfigurations: true } },
          },
        }),
        tx.word.count(),
        tx.activityConfiguration.groupBy({
          by: ["activityType"],
          _count: true,
        }),
        tx.generationEvent.groupBy({
          by: ["activityType", "status"],
          where,
          _count: true,
          _avg: { durationMs: true },
        }),
        tx.pageVisit.aggregate({
          where,
          _count: true,
          _avg: { activeMs: true },
        }),
        tx.pageVisit.groupBy({
          by: ["path"],
          where,
          _count: true,
          _avg: { activeMs: true },
        }),
        tx.generationEvent.findMany({
          where,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: 50,
          select: {
            id: true,
            createdAt: true,
            activityType: true,
            status: true,
            source: true,
            filename: true,
            errorCode: true,
            message: true,
            durationMs: true,
          },
        }),
        // SQL aggregation, so the dashboard does not download the HTML or entire event history.
        tx.$queryRaw<Array<{ day: string; status: string; count: number }>>`
        SELECT to_char("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day, "status"::text AS status, COUNT(*)::int AS count
        FROM "GenerationEvent"
        WHERE "createdAt" >= ${where.createdAt.gte} AND "createdAt" <= ${now}
          AND (${query.source} = 'ALL' OR "source"::text = ${query.source})
        GROUP BY day, "status" ORDER BY day DESC LIMIT 62`,
      ]);
      const success = outcomes
        .filter((row) => row.status === "SUCCESS")
        .reduce((sum, row) => sum + row._count, 0);
      const failed = outcomes
        .filter((row) => row.status === "FAILED")
        .reduce((sum, row) => sum + row._count, 0);
      const byType = (["WORDLE", "WORD_SEARCH"] as const).map((type) => ({
        type,
        saved:
          configurations.find((row) => row.activityType === type)?._count ?? 0,
        generated:
          outcomes.find(
            (row) => row.activityType === type && row.status === "SUCCESS",
          )?._count ?? 0,
        failed:
          outcomes.find(
            (row) => row.activityType === type && row.status === "FAILED",
          )?._count ?? 0,
      }));
      const mostUsed =
        success === 0
          ? "No successful outputs"
          : byType[0].generated === byType[1].generated
            ? "Equal usage"
            : byType[0].generated > byType[1].generated
              ? "Wordle"
              : "Word Search";
      return {
        generatedAt: now.toISOString(),
        filters: query,
        inventory: {
          lists,
          wordCount: words,
          configurationCount: configurations.reduce(
            (sum, row) => sum + row._count,
            0,
          ),
        },
        totals: {
          success,
          failed,
          attempts: success + failed,
          successRate:
            success + failed
              ? Math.round((1000 * success) / (success + failed)) / 10
              : null,
          visitCount: visits._count,
          averageTimeSeconds: visits._count
            ? Math.round((visits._avg.activeMs ?? 0) / 100) / 10
            : null,
          mostUsed,
        },
        byType,
        pages: pages.map((row) => ({
          path: row.path,
          visits: row._count,
          averageSeconds: Math.round((row._avg.activeMs ?? 0) / 100) / 10,
        })),
        recent,
        daily,
      };
    },
    { isolationLevel: "RepeatableRead", timeout: 15000 },
  );
}

export type DashboardReport = Awaited<ReturnType<typeof getReport>>;
