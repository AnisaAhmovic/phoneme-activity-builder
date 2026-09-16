import { wordListUpdateSchema } from "@/lib/activityValidation";
import {
  deleteWordList,
  getWordList,
  updateWordList,
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
    const wordList = await getWordList(id);

    return wordList
      ? apiSuccess(wordList)
      : apiError(404, "NOT_FOUND", "The requested word list was not found.");
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
    const input = wordListUpdateSchema.parse(await request.json());

    return apiSuccess(await updateWordList(id, input));
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

    await deleteWordList(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
