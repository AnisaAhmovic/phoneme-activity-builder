import { csvCell, parseReportQuery } from "@/lib/reportingValidation";
import { getPrismaClient } from "@/server/prisma";
import { reportWhere } from "@/server/reporting";
import { apiError, handleApiError } from "@/server/http";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const query = parseReportQuery(request.url);
    const rows = await getPrismaClient().generationEvent.findMany({ where: reportWhere(query), take: 10001, orderBy: [{ createdAt: "desc" }, { id: "desc" }], select: { id: true, createdAt: true, activityType: true, status: true, source: true, durationMs: true, filename: true, errorCode: true, message: true } });
    if (rows.length > 10000) return apiError(422, "REPORT_TOO_LARGE", "Choose a shorter period or a single traffic source. Export limit: 10,000 records.");
    const csv = ["id,timestamp_utc,activity_type,status,source,generation_ms,filename,error_code,message", ...rows.map(row => [row.id, row.createdAt.toISOString(), row.activityType, row.status, row.source, row.durationMs, row.filename, row.errorCode, row.message].map(csvCell).join(","))].join("\r\n");
    return new Response("\uFEFF" + csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="generation-report.csv"', "Cache-Control": "no-store" } });
  } catch (error) { return handleApiError(error); }
}
