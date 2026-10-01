import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
const jmeter = process.env.JMETER_BIN || "jmeter";
const base = new URL(process.env.BASE_URL || "http://127.0.0.1:3000");
if (!["127.0.0.1", "localhost", "::1", "[::1]"].includes(base.hostname)) throw new Error("Run the assessment load test against a local test instance.");
const levels = (process.env.LOAD_LEVELS || "1,10,25,50,100").split(",").map(Number);
const loops = Number(process.env.LOAD_LOOPS || 5);
if (levels.some(n => !Number.isInteger(n) || n < 1 || n > 10000) || !Number.isInteger(loops) || loops < 1 || loops > 100) throw new Error("Invalid staged load configuration.");
const directory = `evidence/jmeter-${new Date().toISOString().replaceAll(":", "-")}`;
await mkdir(directory, { recursive: true });
const summary = [];
for (const users of levels) {
  const file = `${directory}/${users}-users.jtl`;
  const args = ["-n", "-t", "tests/load/assessment3.jmx", "-l", file, "-j", `${directory}/${users}-users.log`, "-e", "-o", `${directory}/${users}-users-report`, `-Jusers=${users}`, `-Jloops=${loops}`, "-Jramp=5", `-Jhost=${base.hostname}`, `-Jport=${base.port || (base.protocol === "https:" ? 443 : 80)}`, `-Jprotocol=${base.protocol.slice(0, -1)}`];
  console.log(`JMeter stage: ${users} concurrent users, ${loops} workflows each, 5-second ramp`);
  const run = spawnSync(jmeter, args, { stdio: "inherit", env: { ...process.env, JVM_ARGS: process.env.JVM_ARGS || "-Xms256m -Xmx1g" } });
  if (run.status !== 0) throw new Error(`JMeter stage ${users} failed to run: ${run.error || run.status}`);
  const stats = JSON.parse(await readFile(`${directory}/${users}-users-report/statistics.json`, "utf8"));
  const total = stats.Total;
  if (!total?.sampleCount) throw new Error("No JMeter samples were produced.");
  summary.push({ users, loops, requests: total.sampleCount, errors: total.errorCount, errorPercent: total.errorPct, meanMs: total.meanResTime, p95Ms: total.pct2ResTime, throughputPerSecond: total.throughput, report: `${users}-users-report/index.html` });
}
await writeFile(`${directory}/summary.json`, JSON.stringify({ createdAt: new Date().toISOString(), environment: { platform: os.platform(), cpus: os.availableParallelism(), totalMemoryBytes: os.totalmem(), node: process.version, database: process.env.TEST_DATABASE_LABEL || "PostgreSQL (record server version separately)" }, levels, loops, rampSeconds: 5, scope: "HTTP builder/configuration/generation/output workflow; no browser JavaScript or offline learner execution", results: summary }, null, 2));
const table = ["# JMeter staged load results", "", "Measured against the local production build. These are exploratory staged loads, not a production capacity guarantee.", "", "| Concurrent users | Requests | Errors | Error % | Mean ms | p95 ms | Requests/s |", "| --- | --- | --- | --- | --- | --- | --- |", ...summary.map(r => `| ${r.users} | ${r.requests} | ${r.errors} | ${r.errorPercent.toFixed(2)} | ${r.meanMs.toFixed(1)} | ${r.p95Ms.toFixed(1)} | ${r.throughputPerSecond.toFixed(1)} |`), "", "Each user reads builder data, saves an activity configuration, generates a Wordle or Word Search output, retrieves the generated HTML, reads the reporting API and deletes their configuration. HTTP and content assertions are included. Generation records remain labelled LOAD_TEST.", "", "Working review thresholds: fewer than 5% errors and request p95 below 2,000 ms. A threshold breach is a finding to investigate, not evidence to discard."];
await writeFile(`${directory}/SUMMARY.md`, table.join("\n") + "\n");
console.table(summary);
console.log(`Evidence: ${directory}`);
