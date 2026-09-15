import { wordUpdateSchema } from "@/lib/activityValidation";
import {
  deleteWord,
  getWord,
  updateWord,
} from "@/server/activityRepository";
import { apiError, apiSuccess, handleApiError } from "@/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParameters {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  context: RouteParameters,
): Promise<Response> {
  try {
    const { id } = await context.params;
    const word = await getWord(id);

    return word
      ? apiSuccess(word)
      : apiError(404, "NOT_FOUND", "The requested word was not found.");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  context: RouteParameters,
): Promise<Response> {
  try {
    const { id } = await context.params;
    const input = wordUpdateSchema.parse(await request.json());

    return apiSuccess(await updateWord(id, input));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: RouteParameters,
): Promise<Response> {
  try {
    const { id } = await context.params;

    await deleteWord(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
