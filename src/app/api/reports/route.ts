import { parseReportQuery } from "@/lib/reportingValidation";
import { getReport } from "@/server/reporting";
import { apiSuccess, handleApiError } from "@/server/http";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try { return apiSuccess(await getReport(parseReportQuery(request.url))); }
  catch (error) { return handleApiError(error); }
}
