import type {
  ActivityConfigurationInput,
  ActivityType,
  ApiErrorBody,
  DifficultyLevel,
  StoredActivityConfiguration,
  StoredWord,
  StoredWordList,
} from "@/types/backend";

interface DataBody<T> {
  data: T;
}

export class ActivityApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ActivityApiError";
  }
}

async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json()) as DataBody<T> | ApiErrorBody;

  if (!response.ok || !("data" in body)) {
    const error = "error" in body ? body.error : undefined;

    throw new ActivityApiError(
      error?.message ?? "The server could not complete the request.",
      error?.code ?? "REQUEST_FAILED",
      response.status,
      error?.details,
    );
  }

  return body.data;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ActivityApiError && Array.isArray(error.details)) {
    const firstDetail = error.details[0] as { message?: unknown } | undefined;

    if (typeof firstDetail?.message === "string") {
      return firstDetail.message;
    }
  }

  return error instanceof Error
    ? error.message
    : "The server could not complete the request.";
}

export function fetchWordLists(): Promise<StoredWordList[]> {
  return apiRequest("/api/word-lists", { cache: "no-store" });
}

export function createWordList(input: {
  name: string;
  description?: string | null;
}): Promise<StoredWordList> {
  return apiRequest("/api/word-lists", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateWordList(
  id: string,
  input: { name?: string; description?: string | null },
): Promise<StoredWordList> {
  return apiRequest(`/api/word-lists/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteWordList(id: string): Promise<void> {
  return apiRequest(`/api/word-lists/${id}`, { method: "DELETE" });
}

export function createWord(input: {
  wordListId: string;
  spelling: string;
  phonemes: string[];
  hint?: string | null;
  difficulty: DifficultyLevel;
}): Promise<StoredWord> {
  return apiRequest("/api/words", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateWord(
  id: string,
  input: {
    spelling: string;
    phonemes: string[];
    hint?: string | null;
    difficulty: DifficultyLevel;
  },
): Promise<StoredWord> {
  return apiRequest(`/api/words/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteWord(id: string): Promise<void> {
  return apiRequest(`/api/words/${id}`, { method: "DELETE" });
}

export function fetchActivityConfigurations(
  activityType: ActivityType,
): Promise<StoredActivityConfiguration[]> {
  return apiRequest(
    `/api/activity-configurations?type=${encodeURIComponent(activityType)}`,
    { cache: "no-store" },
  );
}

export function createActivityConfiguration(
  input: ActivityConfigurationInput,
): Promise<StoredActivityConfiguration> {
  return apiRequest("/api/activity-configurations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateActivityConfiguration(
  id: string,
  input: ActivityConfigurationInput,
): Promise<StoredActivityConfiguration> {
  return apiRequest(`/api/activity-configurations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteActivityConfiguration(id: string): Promise<void> {
  return apiRequest(`/api/activity-configurations/${id}`, {
    method: "DELETE",
  });
}
