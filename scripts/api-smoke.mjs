import assert from "node:assert/strict";

const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
const runId = Date.now().toString(36);
let wordListId;
let activityId;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const body = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(
      `${options.method ?? "GET"} ${path} returned ${response.status}: ${JSON.stringify(body)}`,
    );
  }

  return { response, body };
}

try {
  const health = await request("/health");
  assert.equal(health.response.status, 200);
  assert.equal(health.body.status, "ok");
  assert.equal(health.body.database, "connected");

  const createdList = await request("/api/word-lists", {
    method: "POST",
    body: JSON.stringify({
      name: `API smoke list ${runId}`,
      description: "Temporary end-to-end verification data.",
    }),
  });
  assert.equal(createdList.response.status, 201);
  wordListId = createdList.body.data.id;

  const createdWord = await request("/api/words", {
    method: "POST",
    body: JSON.stringify({
      wordListId,
      spelling: "chip",
      phonemes: ["tʃ", "ɪ", "p"],
      difficulty: "BEGINNER",
      hint: "Starts with CH",
    }),
  });
  assert.equal(createdWord.response.status, 201);
  const wordId = createdWord.body.data.id;

  const updatedWord = await request(`/api/words/${wordId}`, {
    method: "PATCH",
    body: JSON.stringify({ hint: "Updated through the API" }),
  });
  assert.equal(updatedWord.body.data.hint, "Updated through the API");

  const createdActivity = await request("/api/activity-configurations", {
    method: "POST",
    body: JSON.stringify({
      name: `API smoke Wordle ${runId}`,
      activityType: "WORDLE",
      difficulty: "BEGINNER",
      phonemeCount: 3,
      wordListId,
      selectedWordIds: [wordId],
      targetWordId: wordId,
      maxAttempts: 4,
      hintsEnabled: true,
      includeAnswerKey: false,
      outputFilename: "api-smoke-wordle.html",
    }),
  });
  assert.equal(createdActivity.response.status, 201);
  activityId = createdActivity.body.data.id;

  const retrievedActivity = await request(
    `/api/activity-configurations/${activityId}`,
  );
  assert.equal(retrievedActivity.body.data.maxAttempts, 4);
  assert.equal(retrievedActivity.body.data.wordSelections[0].word.spelling, "chip");

  const updatedActivity = await request(
    `/api/activity-configurations/${activityId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ notes: "CRUD update verified" }),
    },
  );
  assert.equal(updatedActivity.body.data.notes, "CRUD update verified");

  const retrievedList = await request(`/api/word-lists/${wordListId}`);
  assert.equal(retrievedList.body.data.words.length, 1);

  await request(`/api/activity-configurations/${activityId}`, {
    method: "DELETE",
  });
  activityId = undefined;

  await request(`/api/word-lists/${wordListId}`, { method: "DELETE" });
  wordListId = undefined;

  console.log("API smoke test passed: health and end-to-end CRUD are working.");
} finally {
  if (activityId) {
    await request(`/api/activity-configurations/${activityId}`, {
      method: "DELETE",
    }).catch(() => undefined);
  }

  if (wordListId) {
    await request(`/api/word-lists/${wordListId}`, {
      method: "DELETE",
    }).catch(() => undefined);
  }
}
