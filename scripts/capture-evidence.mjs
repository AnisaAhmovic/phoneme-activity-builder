import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.BASE_URL || "http://127.0.0.1:3000";
await mkdir("evidence/screenshots", { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.goto(`${base}/dashboard`);
  await page.getByLabel("Traffic source").selectOption("SIMULATED");
  await page.getByText("57.5 s", { exact: true }).waitFor();
  await page.screenshot({
    path: "evidence/screenshots/dashboard-simulated.png",
    fullPage: true,
  });
  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/api/reports?") && response.url().includes("source=LIVE")),
    page.getByLabel("Traffic source").selectOption("LIVE"),
  ]);
  await page.screenshot({
    path: "evidence/screenshots/dashboard-live.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "evidence/screenshots/dashboard-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const route of ["wordle", "word-search", "library"]) {
    await page.goto(`${base}/${route}`);
    await page
      .getByLabel("Stored word list", { exact: true })
      .selectOption({
        label:
          route === "library"
            ? "Core phoneme words (90 words)"
            : "Core phoneme words",
      });
    await page.screenshot({
      path: `evidence/screenshots/${route}.png`,
      fullPage: true,
    });
  }
  await writeFile(
    "evidence/screenshots/context.json",
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        database: process.env.TEST_DATABASE_LABEL || "See test environment",
        baseURL: base,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
