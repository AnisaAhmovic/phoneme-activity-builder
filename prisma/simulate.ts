import "dotenv/config";
import { getPrismaClient } from "../src/server/prisma";

const db = getPrismaClient();
async function main() {
  const now = Date.now();
  await db.$transaction(async tx => {
    for (let i = 0; i < 28; i++) {
      const status = i % 7 === 0 ? "FAILED" : "SUCCESS";
      const data = {
        requestId: `assessment3-simulated-${i}`, source: "SIMULATED" as const,
        activityType: i % 3 === 0 ? "WORD_SEARCH" as const : "WORDLE" as const,
        status: status as "FAILED" | "SUCCESS", durationMs: 12 + i * 2,
        filename: status === "SUCCESS" ? "synthetic-example.html" : null,
        errorCode: status === "FAILED" ? "EMPTY_WORD_LIST" : null,
        message: status === "FAILED" ? "Simulated empty-list generation attempt." : null,
        createdAt: new Date(now - (i % 7) * 86400000 - (i + 1) * 60000),
      };
      await tx.generationEvent.upsert({ where: { requestId: data.requestId }, create: data, update: data });
    }
    for (let i = 0; i < 12; i++) {
      const data = { path: i % 2 ? "/wordle" : "/word-search", activeMs: 30000 + i * 5000, source: "SIMULATED" as const, createdAt: new Date(now - (i % 6) * 86400000 - 60000) };
      await tx.pageVisit.upsert({ where: { id: `assessment3-visit-${i}` }, create: { id: `assessment3-visit-${i}`, ...data }, update: data });
    }
  });
  console.log("Stored 28 labelled simulated attempts (24 success, 4 failed) and 12 page visits. No live records changed.");
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
