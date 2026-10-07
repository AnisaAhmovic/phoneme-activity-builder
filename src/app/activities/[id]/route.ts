import { getPrismaClient } from "@/server/prisma";
import { apiError, handleApiError } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const event = await getPrismaClient().generationEvent.findUnique({
      where: { id },
      select: { html: true, status: true },
    });
    if (!event?.html || event.status !== "SUCCESS")
      return apiError(
        404,
        "NOT_FOUND",
        "This generated output is unavailable.",
      );
    return new Response(event.html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy":
          "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
