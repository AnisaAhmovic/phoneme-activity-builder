import { wordCreateSchema } from "@/lib/activityValidation";
import { createWord, listWords } from "@/server/activityRepository";
import { apiSuccess, handleApiError } from "@/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  try {
    const wordListId = new URL(request.url).searchParams.get("wordListId");

    return apiSuccess(await listWords(wordListId ?? undefined));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const input = wordCreateSchema.parse(await request.json());

    return apiSuccess(await createWord(input), 201);
  } catch (error) {
    return handleApiError(error);
  }
}
