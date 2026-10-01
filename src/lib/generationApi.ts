import type { ActivityConfigurationInput } from "@/types/backend";
import { downloadHtmlFile } from "@/utils/downloadHtmlFile";

export async function generateAndDownload(
  draft: Omit<ActivityConfigurationInput, "name" | "difficulty" | "notes">,
  requestId: string,
) {
  const response = await fetch("/api/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requestId,
      activity: { ...draft, name: "Builder output", difficulty: "CUSTOM" },
    }),
  });
  const body = await response.json();
  if (!response.ok)
    throw new Error(
      body.error?.message ||
        "Generation failed. Check the connection and try again.",
    );
  downloadHtmlFile(body.data.filename, body.data.html);
  return body.data as { id: string; filename: string; outputUrl: string };
}
