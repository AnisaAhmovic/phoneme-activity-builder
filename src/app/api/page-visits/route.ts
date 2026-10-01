import { visitSchema } from "@/lib/reportingValidation";
import { getPrismaClient } from "@/server/prisma";
import { trafficSource } from "@/server/generation";
import { handleApiError } from "@/server/http";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const visit = visitSchema.parse(await request.json());
    const source = trafficSource(request);
    // GREATEST prevents late heartbeats from reducing cumulative foreground time.
    await getPrismaClient().$executeRaw`
      INSERT INTO "PageVisit" ("id", "path", "activeMs", "source", "createdAt", "updatedAt")
      VALUES (${visit.id}, ${visit.path}, ${visit.activeMs}, ${source}::"TrafficSource", NOW(), NOW())
      ON CONFLICT ("id") DO UPDATE SET "activeMs" = GREATEST("PageVisit"."activeMs", EXCLUDED."activeMs"), "updatedAt" = NOW()
      WHERE "PageVisit"."path" = EXCLUDED."path" AND "PageVisit"."source" = EXCLUDED."source"`;
    return new Response(null, { status: 204 });
  } catch (error) { return handleApiError(error); }
}
