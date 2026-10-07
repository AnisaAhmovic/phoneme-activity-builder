import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";

test("builder: word-list and word CRUD persists after reload", async ({
  page,
  request,
}) => {
  const name = `E2E-${Date.now()}`;
  let listId = "";
  try {
    await page.goto("/library");
    await page.locator("#new-list-name").fill(name);
    const created = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/word-lists") &&
        response.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Create word list", exact: true })
      .click();
    listId = (await (await created).json()).data.id;
    await expect(page.locator("#stored-list-select")).toHaveValue(listId);
    await page.getByLabel("Written word", { exact: true }).fill("chip");
    await page.getByLabel("Phonemes", { exact: true }).fill("tʃ ɪ p");
    await page.getByLabel("Hint", { exact: true }).fill("Starts with CH");
    await page.getByRole("button", { name: "Add word", exact: true }).click();
    await expect(
      page.getByRole("row").filter({ hasText: "chip" }),
    ).toContainText("tʃ · ɪ · p");
    await page.reload();
    await page.locator("#stored-list-select").selectOption(listId);
    const row = page.getByRole("row").filter({ hasText: "chip" });
    await row.getByRole("button", { name: "Edit", exact: true }).click();
    await page.getByLabel("Hint", { exact: true }).fill("Updated hint");
    await page
      .getByRole("button", { name: "Update word", exact: true })
      .click();
    await expect(row).toContainText("Updated hint");
    await page.locator("#stored-list-name").fill(`${name}-updated`);
    await page
      .getByRole("button", { name: "Update word list", exact: true })
      .click();
    await expect(
      page.getByText(`Updated ${name}-updated.`, { exact: true }),
    ).toBeVisible();
    page.on("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(
      page.getByText("No words have been added to this list."),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Delete word list", exact: true })
      .click();
    await expect(
      page.getByText(`Deleted ${name}-updated.`, { exact: true }),
    ).toBeVisible();
    expect((await request.get(`/api/word-lists/${listId}`)).status()).toBe(404);
    listId = "";
  } finally {
    if (listId) await request.delete(`/api/word-lists/${listId}`);
  }
});

test("learner: Wordle downloads, plays offline and remains available from its saved snapshot", async ({
  page,
  context,
  request,
}, testInfo) => {
  await page.goto("/wordle");
  await page
    .getByLabel("Stored word list", { exact: true })
    .selectOption({ label: "Core phoneme words" });
  await page
    .getByLabel("Target word", { exact: true })
    .selectOption({ label: "boot" });
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Generate HTML", exact: true })
    .click();
  const file = await downloaded;
  const output = testInfo.outputPath("wordle.html");
  await file.saveAs(output);
  expect(await readFile(output, "utf8")).toContain('"targetWord":"boot"');
  const href = await page
    .getByRole("link", { name: "Open saved output in a new tab" })
    .getAttribute("href");
  expect((await request.get(href!)).status()).toBe(200);
  const offline = await context.newPage();
  await offline.goto(pathToFileURL(output).href);
  await context.setOffline(true);
  for (const phoneme of ["b", "ʉː", "t"])
    await offline
      .locator("#keyboard button")
      .filter({ hasText: new RegExp(`^${phoneme}$`) })
      .click();
  await offline
    .getByRole("button", { name: "Submit guess", exact: true })
    .click();
  await expect(offline.locator("#status")).toContainText("Correct");
  await offline.getByRole("button", { name: "Restart", exact: true }).click();
  await expect(offline.locator("#status")).toContainText("first guess");
  await context.setOffline(false);
});

test("learner: generated Word Search supports keyboard selection and answer control", async ({
  page,
  context,
}, testInfo) => {
  await page.goto("/word-search");
  await page
    .getByLabel("Stored word list", { exact: true })
    .selectOption({ label: "Core phoneme words" });
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Generate HTML", exact: true })
    .click();
  const output = testInfo.outputPath("word-search.html");
  await (await downloaded).saveAs(output);
  const html = await readFile(output, "utf8");
  const data = JSON.parse(html.match(/const activity = (.*);/u)![1]);
  const learner = await context.newPage();
  await learner.goto(pathToFileURL(output).href);
  const coordinates = data.entries[0].coordinates as Array<{
    row: number;
    column: number;
  }>;
  const first = coordinates[0],
    last = coordinates.at(-1)!;
  const cells = learner.locator("#grid .cell");
  const width = data.grid[0].length;
  await cells.nth(first.row * width + first.column).focus();
  await learner.keyboard.press("Enter");
  await cells.nth(last.row * width + last.column).focus();
  await learner.keyboard.press("Enter");
  await expect(learner.locator("#found-count")).toContainText("1");
  await learner
    .getByRole("button", { name: "Show answers", exact: true })
    .click();
  await expect(
    learner.getByRole("button", { name: "Hide answers", exact: true }),
  ).toBeVisible();
});

test("monitoring: health, invalid generation, idempotency, monotonic page time and CSV", async ({
  request,
  page,
}) => {
  expect((await request.get("/health")).status()).toBe(200);
  const body = {
    requestId: randomUUID(),
    activity: { activityType: "WORDLE", selectedWordIds: [] },
  };
  const headers = { "x-traffic-source": "LOAD_TEST" };
  const before = (
    await (await request.get("/api/reports?days=all&source=LOAD_TEST")).json()
  ).data;
  const failures = await Promise.all([
    request.post("/api/generations", { data: body, headers }),
    request.post("/api/generations", { data: body, headers }),
  ]);
  expect(failures.map((response) => response.status())).toEqual([422, 422]);
  const visit = { id: randomUUID(), path: "/wordle", activeMs: 123000 };
  expect(
    (await request.post("/api/page-visits", { data: visit, headers })).status(),
  ).toBe(204);
  expect(
    (
      await request.post("/api/page-visits", {
        data: { ...visit, activeMs: 1000 },
        headers,
      })
    ).status(),
  ).toBe(204);
  expect(
    (
      await request.post("/api/page-visits", {
        data: { ...visit, activeMs: -1 },
        headers,
      })
    ).status(),
  ).toBe(400);
  const after = (
    await (await request.get("/api/reports?days=all&source=LOAD_TEST")).json()
  ).data;
  expect(after.totals.failed).toBe(before.totals.failed + 1);
  expect(after.totals.visitCount).toBe(before.totals.visitCount + 1);
  const timeBefore = before.totals.averageTimeSeconds ?? 0;
  const expectedTime =
    (timeBefore * before.totals.visitCount + 123) / after.totals.visitCount;
  expect(after.totals.averageTimeSeconds).toBeCloseTo(expectedTime, 0);
  const csv = await request.get("/api/reports/export?days=all&source=ALL");
  expect(csv.headers()["content-type"]).toContain("text/csv");
  expect(await csv.text()).toContain("VALIDATION_ERROR");
  await page.goto("/dashboard");
  await page.getByLabel("Traffic source").selectOption("SIMULATED");
  await expect(page.getByText("24", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("57.5 s", { exact: true })).toBeVisible();
});

test("dashboard: keyboard access and mobile layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Operational overview" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Skip to main content" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  await page.getByLabel("Reporting period").focus();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Traffic source")).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
