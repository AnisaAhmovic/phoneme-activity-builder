import { ZodError } from "zod";

export class ApiProblem extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiProblem";
  }
}

export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json({ data }, { status });
}

export function apiError(
  status: number,
  code: string,
  message: string,
  details?: unknown,
): Response {
  return Response.json(
    {
      error: {
        code,
        message,
        ...(details === undefined ? {} : { details }),
      },
    },
    { status },
  );
}

export function handleApiError(error: unknown): Response {
  if (error instanceof ApiProblem) {
    return apiError(error.status, error.code, error.message, error.details);
  }

  if (error instanceof ZodError) {
    return apiError(
      400,
      "VALIDATION_ERROR",
      "Check the submitted fields and try again.",
      error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  if (error instanceof SyntaxError) {
    return apiError(400, "INVALID_JSON", "The request body is not valid JSON.");
  }

  const databaseError = error as { code?: string; meta?: unknown };

  if (databaseError.code === "P2002") {
    return apiError(
      409,
      "DUPLICATE_RECORD",
      "A record with the same unique value already exists.",
      databaseError.meta,
    );
  }

  if (databaseError.code === "P2003") {
    return apiError(
      409,
      "RECORD_IN_USE",
      "This record is still used by another saved item.",
      databaseError.meta,
    );
  }

  if (databaseError.code === "P2025") {
    return apiError(404, "NOT_FOUND", "The requested record was not found.");
  }

  if (databaseError.code === "P1001" || databaseError.code === "P1017") {
    return apiError(
      503,
      "DATABASE_UNAVAILABLE",
      "The database connection is unavailable. Try again shortly.",
    );
  }

  console.error("Unhandled API error", error);

  return apiError(
    500,
    "INTERNAL_ERROR",
    "The server could not complete the request.",
  );
}
