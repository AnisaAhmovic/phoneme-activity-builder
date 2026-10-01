import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";

const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const label = process.env.AUDIT_LABEL || "final";
if (!/^[a-z0-9-]+$/i.test(label)) throw new Error("AUDIT_LABEL must be a simple filename label.");
const output = `evidence/lighthouse-${label}`;
await mkdir(output, { recursive: true });
const chrome = await launch({ chromePath: chromium.executablePath(), chromeFlags: ["--headless", "--no-sandbox", "--disable-dev-shm-usage"] });
const summary = [];
try {
  const routes = ["/dashboard", "/library", "/wordle", "/word-search"];
  const configurations = (await (await fetch(`${base}/api/activity-configurations`)).json()).data;
  for (const config of configurations.filter(c => ["sample-wordle", "sample-word-search"].includes(c.id))) {
    const generated = await fetch(`${base}/api/generations`, { method: "POST", headers: { "Content-Type": "application/json", "x-traffic-source": "LOAD_TEST" }, body: JSON.stringify({ requestId: crypto.randomUUID(), activity: { ...config, selectedWordIds: config.wordSelections.map(s => s.word.id), targetWordId: config.wordSelections.find(s => s.isTarget)?.word.id ?? null } }) });
    if (!generated.ok) throw new Error(`Cannot generate Lighthouse fixture: ${generated.status}`);
    routes.push((await generated.json()).data.outputUrl);
  }
  for (const [index, route] of routes.entries()) {
    const name = route.startsWith("/activities/") ? `generated-${index === 4 ? "wordle" : "word-search"}` : route.slice(1);
    const result = await lighthouse(`${base}${route}`, { port: chrome.port, onlyCategories: ["accessibility"], output: ["html", "json"], logLevel: "error", formFactor: "desktop", screenEmulation: { mobile: false, width: 1365, height: 900, deviceScaleFactor: 1, disabled: false } });
    if (!result || result.lhr.runtimeError) throw new Error(JSON.stringify(result?.lhr.runtimeError || "Lighthouse returned no result"));
    await writeFile(`${output}/${name}.html`, result.report[0]);
    await writeFile(`${output}/${name}.json`, result.report[1]);
    const failures = Object.values(result.lhr.audits).filter(audit => audit.score !== null && audit.score < 1).map(audit => ({ id: audit.id, title: audit.title }));
    summary.push({ route, name, score: Math.round(result.lhr.categories.accessibility.score * 100), failures, lighthouseVersion: result.lhr.lighthouseVersion, fetchedAt: result.lhr.fetchTime });
    console.log(`${name}: ${summary.at(-1).score}/100`);
  }
} finally { await chrome.kill(); }
await writeFile(`${output}/summary.json`, JSON.stringify(summary, null, 2));
// A low score is real evidence to fix, never replaced with an expected score.
if (label === "final" && summary.some(row => row.score < 95)) process.exitCode = 1;
