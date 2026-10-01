import { writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
// A second independent application process proves records are not held in process memory.
const base = "http://127.0.0.1:3000";
const before = (await (await fetch(`${base}/api/reports?days=all&source=LOAD_TEST`)).json()).data;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3001"], { stdio: "ignore", env: process.env });
try {
  let ready = false;
  for (let i = 0; i < 30; i++) { try { if ((await fetch("http://127.0.0.1:3001/health")).ok) { ready = true; break; } } catch {} await new Promise(resolve => setTimeout(resolve, 1000)); }
  assert.ok(ready, "Second application process must start");
  const after = (await (await fetch("http://127.0.0.1:3001/api/reports?days=all&source=LOAD_TEST")).json()).data;
  assert.deepEqual(after.totals, before.totals);
  const output = before.recent.find(row => row.status === "SUCCESS");
  assert.ok(output, "A generated output must exist");
  assert.equal((await fetch(`http://127.0.0.1:3001/activities/${output.id}`)).status, 200);
  await writeFile("evidence/persistence.json", JSON.stringify({ checkedAt: new Date().toISOString(), method: "Read the same database from a fresh independent application process on port 3001", totals: after.totals, savedOutputId: output.id, result: "PASS" }, null, 2));
  console.log("PASS: fresh application process reads the same totals and saved HTML.");
} finally { server.kill("SIGTERM"); }
