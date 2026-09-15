-- Keep core teaching and activity invariants valid even when data is written
-- outside the application API.
ALTER TABLE "Word"
ADD CONSTRAINT "Word_phoneme_count_check"
CHECK (cardinality("phonemes") BETWEEN 3 AND 5);

ALTER TABLE "ActivityConfiguration"
ADD CONSTRAINT "ActivityConfiguration_phoneme_count_check"
CHECK ("phonemeCount" BETWEEN 3 AND 5);

ALTER TABLE "ActivityConfiguration"
ADD CONSTRAINT "ActivityConfiguration_max_attempts_check"
CHECK ("maxAttempts" BETWEEN 1 AND 10);

ALTER TABLE "ActivityConfiguration"
ADD CONSTRAINT "ActivityConfiguration_grid_settings_check"
CHECK (
  (
    "activityType" = 'WORD_SEARCH'
    AND "gridRows" BETWEEN 6 AND 16
    AND "gridColumns" BETWEEN 6 AND 16
  )
  OR
  (
    "activityType" = 'WORDLE'
    AND "gridRows" IS NULL
    AND "gridColumns" IS NULL
  )
);
