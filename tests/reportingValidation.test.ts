import assert from "node:assert/strict";
import test from "node:test";
import { csvCell, visitSchema, reportQuerySchema } from "@/lib/reportingValidation";

test("telemetry rejects arbitrary routes, negative time and overlong sessions", () => {
  const valid = { id: "67a740ac-9b5c-4f55-b7fa-11864f2d6d1a", path: "/wordle", activeMs: 1200 };
  assert.equal(visitSchema.safeParse(valid).success, true);
  for (const activeMs of [-1, 1.5, 1800001]) assert.equal(visitSchema.safeParse({ ...valid, activeMs }).success, false);
  assert.equal(visitSchema.safeParse({ ...valid, path: "/students/private-id" }).success, false);
});
test("reports default to recent live traffic and reject arbitrary filters", () => {
  assert.deepEqual(reportQuerySchema.parse({}), { days: "7", source: "LIVE" });
  assert.equal(reportQuerySchema.safeParse({ days: "365" }).success, false);
});
test("CSV escapes quotes and neutralises spreadsheet formulas", () => {
  assert.equal(csvCell('a,"b"'), '"a,""b"""');
  for (const value of ["=1+1", "+SUM(A1)", "-2+3", "@SUM(A1)", "\t=1"]) assert.ok(csvCell(value).startsWith('"\''));
});
