import {
  wordListCreateSchema,
} from "@/lib/activityValidation";
import {
  createWordList,
  listWordLists,
} from "@/server/activityRepository";
import { apiSuccess, handleApiError } from "@/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  try {
    return apiSuccess(await listWordLists());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const input = wordListCreateSchema.parse(await request.json());

    return apiSuccess(await createWordList(input), 201);
  } catch (error) {
    return handleApiError(error);
  }
}
