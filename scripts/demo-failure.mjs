import { randomUUID } from "node:crypto";
const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const response = await fetch(`${base}/api/generations`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    requestId: randomUUID(),
    activity: {
      name: "Deliberate validation example",
      activityType: "WORDLE",
      phonemeCount: 3,
      wordListId: "invalid-demo-list",
      selectedWordIds: [],
    },
  }),
});
console.log(`Expected HTTP 422; received HTTP ${response.status}`);
console.log(JSON.stringify(await response.json(), null, 2));
if (response.status !== 422) process.exitCode = 1;
