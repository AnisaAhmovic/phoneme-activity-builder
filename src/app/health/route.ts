import { apiError } from "@/server/http";
import { getPrismaClient } from "@/server/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  try {
    await getPrismaClient().$queryRaw`SELECT 1`;

    return Response.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed", error);

    return apiError(
      503,
      "DATABASE_UNAVAILABLE",
      "The application is running but the database is unavailable.",
    );
  }
}
