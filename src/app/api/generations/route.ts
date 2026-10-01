import { generateActivity, trafficSource } from "@/server/generation";
import { apiError, apiSuccess, handleApiError } from "@/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const event = await generateActivity(await request.json(), trafficSource(request));
    if (event.status === "FAILED") return apiError(422, event.errorCode!, event.message!, { generationId: event.id });
    return apiSuccess({ id: event.id, filename: event.filename, html: event.html, outputUrl: `/activities/${event.id}` }, 201);
  } catch (error) { return handleApiError(error); }
}
