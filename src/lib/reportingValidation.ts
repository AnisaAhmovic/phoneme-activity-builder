import { z } from "zod";
import { activityConfigurationCreateSchema } from "@/lib/activityValidation";

export const generationRequestSchema = z.object({
  requestId: z.uuid(),
  activity: activityConfigurationCreateSchema,
});

export const visitSchema = z.object({
  id: z.uuid(),
  path: z.enum([
    "/",
    "/wordle",
    "/word-search",
    "/library",
    "/dashboard",
    "/settings",
    "/about",
  ]),
  activeMs: z.number().int().min(0).max(1_800_000),
});

export const reportQuerySchema = z.object({
  days: z.enum(["7", "30", "all"]).default("7"),
  source: z.enum(["LIVE", "SIMULATED", "LOAD_TEST", "ALL"]).default("LIVE"),
});

export function parseReportQuery(url: string) {
  const query = new URL(url).searchParams;
  return reportQuerySchema.parse({
    days: query.get("days") ?? undefined,
    source: query.get("source") ?? undefined,
  });
}

export function csvCell(value: unknown): string {
  const text = String(value ?? "");
  // A quoted CSV field alone does not neutralise spreadsheet formulas.
  const safe = /^[=+\-@\t\r]/u.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}
