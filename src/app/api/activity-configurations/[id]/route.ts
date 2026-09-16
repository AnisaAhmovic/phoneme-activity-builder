import { activityConfigurationUpdateSchema } from "@/lib/activityValidation";
import {
  deleteActivityConfiguration,
  getActivityConfiguration,
  updateActivityConfiguration,
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
    const configuration = await getActivityConfiguration(id);

    return configuration
      ? apiSuccess(configuration)
      : apiError(
          404,
          "NOT_FOUND",
          "The requested activity configuration was not found.",
        );
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
    const input = activityConfigurationUpdateSchema.parse(await request.json());

    return apiSuccess(await updateActivityConfiguration(id, input));
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

    await deleteActivityConfiguration(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
