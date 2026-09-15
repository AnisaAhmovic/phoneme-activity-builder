import {
  activityConfigurationCreateSchema,
  activityTypeQuerySchema,
} from "@/lib/activityValidation";
import {
  createActivityConfiguration,
  listActivityConfigurations,
} from "@/server/activityRepository";
import { apiSuccess, handleApiError } from "@/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  try {
    const rawActivityType = new URL(request.url).searchParams.get("type");
    const activityType = activityTypeQuerySchema.parse(
      rawActivityType ?? undefined,
    );

    return apiSuccess(await listActivityConfigurations(activityType));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const input = activityConfigurationCreateSchema.parse(await request.json());

    return apiSuccess(await createActivityConfiguration(input), 201);
  } catch (error) {
    return handleApiError(error);
  }
}
