"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import ConfigurationManager from "@/components/activities/ConfigurationManager";
import { getPhonemeHint } from "@/data/phonemeHints";
import { PHONEME_KEYBOARD_ROWS } from "@/data/phonemeKeyboard";
import { useWordLists } from "@/hooks/useWordLists";
import {
  isPhonemeCount,
  storedWordToPhonemeWord,
} from "@/lib/phonemeData";
import type { PhonemeCount } from "@/types/phoneme";
import type { StoredActivityConfiguration } from "@/types/backend";
import { generateAndDownload } from "@/lib/generationApi";
import { normalisePhoneme } from "@/utils/normalisePhoneme";

const PHONEME_COUNTS: readonly PhonemeCount[] = [3, 4, 5];
const DEFAULT_PHONEME_COUNT: PhonemeCount = 3;



export default function WordleBuilder() {
  const { wordLists, isLoading, errorMessage } = useWordLists();
  const [wordListId, setWordListId] = useState("");
  const [phonemeCount, setPhonemeCount] = useState<PhonemeCount>(
    DEFAULT_PHONEME_COUNT,
  );
  const [selectedWordId, setSelectedWordId] = useState("");
  const [previewGuess, setPreviewGuess] = useState<string[]>([]);
  const [maxAttempts, setMaxAttempts] = useState(6);
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [outputFilename, setOutputFilename] = useState("");
  const [downloadStatus, setDownloadStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [outputUrl, setOutputUrl] = useState("");

  const selectedList = useMemo(
    () => wordLists.find((wordList) => wordList.id === wordListId),
    [wordListId, wordLists],
  );

  const availableWords = useMemo(
    () =>
      (selectedList?.words ?? [])
        .filter((word) => word.phonemes.length === phonemeCount)
        .map(storedWordToPhonemeWord),
    [phonemeCount, selectedList],
  );

  const selectedWord =
    availableWords.find((word) => word.id === selectedWordId) ??
    availableWords[0];

  useEffect(() => {
    if (wordLists.length === 0) {
      return;
    }

    let isCurrent = true;

    queueMicrotask(() => {
      if (!isCurrent) {
        return;
      }

      const currentList = wordLists.find(
        (wordList) => wordList.id === wordListId,
      );

      if (!currentList) {
        const nextList = wordLists[0];
        const nextCount =
          PHONEME_COUNTS.find((count) =>
            nextList?.words.some((word) => word.phonemes.length === count),
          ) ?? DEFAULT_PHONEME_COUNT;
        const nextWord = nextList?.words.find(
          (word) => word.phonemes.length === nextCount,
        );

        setWordListId(nextList?.id ?? "");
        setPhonemeCount(nextCount);
        setSelectedWordId(nextWord?.id ?? "");
        return;
      }

      if (!availableWords.some((word) => word.id === selectedWordId)) {
        setSelectedWordId(availableWords[0]?.id ?? "");
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [availableWords, selectedWordId, wordListId, wordLists]);

  function handleWordListChange(event: ChangeEvent<HTMLSelectElement>): void {
    const nextList = wordLists.find(
      (wordList) => wordList.id === event.target.value,
    );
    const nextCount =
      PHONEME_COUNTS.find((count) =>
        nextList?.words.some((word) => word.phonemes.length === count),
      ) ?? DEFAULT_PHONEME_COUNT;
    const nextWord = nextList?.words.find(
      (word) => word.phonemes.length === nextCount,
    );

    setWordListId(nextList?.id ?? "");
    setPhonemeCount(nextCount);
    setSelectedWordId(nextWord?.id ?? "");
    setPreviewGuess([]);
    setDownloadStatus("");
  }

  function handlePhonemeCountChange(
    event: ChangeEvent<HTMLSelectElement>,
  ): void {
    const nextCount = Number(event.target.value) as PhonemeCount;
    const nextWord = selectedList?.words.find(
      (word) => word.phonemes.length === nextCount,
    );

    setPhonemeCount(nextCount);
    setSelectedWordId(nextWord?.id ?? "");
    setPreviewGuess([]);
    setDownloadStatus("");
  }

  function handleWordChange(event: ChangeEvent<HTMLSelectElement>): void {
    setSelectedWordId(event.target.value);
    setPreviewGuess([]);
    setDownloadStatus("");
  }

  function handlePhonemeSelection(phoneme: string): void {
    setPreviewGuess((currentGuess) => {
      if (currentGuess.length >= phonemeCount) {
        return currentGuess;
      }

      return [...currentGuess, phoneme];
    });
  }

  function handleDeletePhoneme(): void {
    setPreviewGuess((currentGuess) => currentGuess.slice(0, -1));
  }

  function handleClearGuess(): void {
    setPreviewGuess([]);
  }

  async function handleGenerateHtml(): Promise<void> {
    if (!configurationDraft || isGenerating) return;
    setIsGenerating(true);
    setGenerationError("");
    setOutputUrl("");
    setDownloadStatus("Generating and saving the output...");
    try {
      const result = await generateAndDownload(configurationDraft, crypto.randomUUID());
      setDownloadStatus(`${result.filename} saved and downloaded.`);
      setOutputUrl(result.outputUrl);
    } catch (error) {
      setDownloadStatus("");
      setGenerationError(error instanceof Error ? error.message : "Generation failed. Try again.");
    } finally { setIsGenerating(false); }
  }

  function loadConfiguration(
    configuration: StoredActivityConfiguration,
  ): void {
    const target =
      configuration.wordSelections.find((selection) => selection.isTarget) ??
      configuration.wordSelections[0];

    if (!target || !isPhonemeCount(configuration.phonemeCount)) {
      return;
    }

    setWordListId(configuration.wordListId);
    setPhonemeCount(configuration.phonemeCount);
    setSelectedWordId(target.word.id);
    setMaxAttempts(configuration.maxAttempts);
    setHintsEnabled(configuration.hintsEnabled);
    setIncludeAnswerKey(configuration.includeAnswerKey);
    setOutputFilename(configuration.outputFilename ?? "");
    setPreviewGuess([]);
    setDownloadStatus("");
  }

  const configurationDraft =
    selectedWord && selectedList
      ? {
          activityType: "WORDLE" as const,
          phonemeCount,
          wordListId: selectedList.id,
          selectedWordIds: [selectedWord.id],
          targetWordId: selectedWord.id,
          gridRows: null,
          gridColumns: null,
          maxAttempts,
          hintsEnabled,
          includeAnswerKey,
          outputFilename: outputFilename || null,
        }
      : null;

  return (
    <section aria-label="Wordle activity builder" className="wordle-builder">
      <section className="wordle-builder__controls">
        <div className="section-heading">
          <p className="eyebrow">Configuration</p>
          <h2>Activity settings</h2>
        </div>

        {isLoading ? <p role="status">Loading saved words...</p> : null}
        {errorMessage ? (
          <p className="form-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className="form-field">
          <label htmlFor="wordle-word-list">Stored word list</label>
          <select
            id="wordle-word-list"
            onChange={handleWordListChange}
            value={wordListId}
          >
            <option value="">Choose a word list</option>
            {wordLists.map((wordList) => (
              <option key={wordList.id} value={wordList.id}>
                {wordList.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="phoneme-count">Number of phonemes</label>
          <select
            aria-describedby="phoneme-count-help"
            id="phoneme-count"
            onChange={handlePhonemeCountChange}
            value={phonemeCount}
          >
            {PHONEME_COUNTS.map((count) => (
              <option key={count} value={count}>
                {count} phonemes
              </option>
            ))}
          </select>
          <p className="form-help" id="phoneme-count-help">
            This determines the number of cells in each grid row.
          </p>
        </div>

        <div className="form-field">
          <label htmlFor="target-word">Target word</label>
          <select
            disabled={availableWords.length === 0}
            id="target-word"
            onChange={handleWordChange}
            value={selectedWord?.id ?? ""}
          >
            {availableWords.length === 0 ? (
              <option value="">No matching words</option>
            ) : null}
            {availableWords.map((word) => (
              <option key={word.id} value={word.id}>
                {word.word}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="wordle-attempts">Maximum attempts</label>
          <input
            id="wordle-attempts"
            max={10}
            min={1}
            onChange={(event) =>
              setMaxAttempts(
                Math.min(10, Math.max(1, Number(event.target.value))),
              )
            }
            type="number"
            value={maxAttempts}
          />
        </div>

        <fieldset className="settings-options">
          <legend>Generated output</legend>
          <label>
            <input
              checked={hintsEnabled}
              onChange={(event) => setHintsEnabled(event.target.checked)}
              type="checkbox"
            />
            Include phoneme hints
          </label>
          <label>
            <input
              checked={includeAnswerKey}
              onChange={(event) => setIncludeAnswerKey(event.target.checked)}
              type="checkbox"
            />
            Reveal the answer after the final attempt
          </label>
        </fieldset>

        <div className="form-field">
          <label htmlFor="wordle-output-filename">Output filename</label>
          <input
            id="wordle-output-filename"
            maxLength={100}
            onChange={(event) => setOutputFilename(event.target.value)}
            placeholder="phoneme-wordle.html"
            value={outputFilename}
          />
        </div>

        {selectedWord ? (
          <div aria-live="polite" className="selected-word-summary">
            <p>Selected word</p>
            <strong>{selectedWord.word}</strong>
            <span>{selectedWord.phonemes.join(" · ")}</span>
          </div>
        ) : (
          <p className="form-error" role="alert">
            Add a {phonemeCount}-phoneme word in the Teacher Library to use
            this activity.
          </p>
        )}

        <button
          className="button button--primary activity-generate-button"
          disabled={!selectedWord || isGenerating}
          onClick={() => void handleGenerateHtml()}
          type="button"
        >
          {isGenerating ? "Generating..." : "Generate HTML"}
        </button>

        <p aria-live="polite" className="activity-download-status">
          {downloadStatus}
        </p>

        {generationError ? <p role="alert" className="form-error">{generationError}</p> : null}
        {outputUrl ? <a href={outputUrl} target="_blank" rel="noreferrer">Open saved output in a new tab</a> : null}

        <ConfigurationManager
          activityType="WORDLE"
          draft={configurationDraft}
          onLoad={loadConfiguration}
        />
      </section>

      <section
        aria-labelledby="wordle-preview-heading"
        className="wordle-builder__preview"
      >
        <div className="section-heading">
          <p className="eyebrow">Live preview</p>
          <h2 id="wordle-preview-heading">Wordle activity</h2>
        </div>

        {!selectedWord ? (
          <p role="status">Choose a stored word to preview the activity.</p>
        ) : (
          <div className="wordle-workspace">
            <div className="wordle-board">
              <div
                aria-colcount={phonemeCount}
                aria-label={`${phonemeCount}-phoneme Wordle grid`}
                aria-rowcount={maxAttempts}
                className="wordle-grid"
                role="grid"
              >
                {Array.from({ length: maxAttempts }, (_, rowIndex) => (
                  <div
                    className="wordle-grid__row"
                    key={`row-${rowIndex}`}
                    role="row"
                    style={{
                      gridTemplateColumns: `repeat(${phonemeCount}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: phonemeCount }, (_, columnIndex) => {
                      const answerPhoneme =
                        rowIndex === 0
                          ? (selectedWord.phonemes[columnIndex] ?? "")
                          : "";
                      const enteredPhoneme =
                        rowIndex === 1
                          ? (previewGuess[columnIndex] ?? "")
                          : "";
                      const displayedPhoneme = answerPhoneme || enteredPhoneme;
                      const cellState = answerPhoneme
                        ? "answer"
                        : enteredPhoneme
                          ? "entry"
                          : "empty";

                      return (
                        <div
                          aria-label={
                            displayedPhoneme
                              ? `Row ${rowIndex + 1}, cell ${columnIndex + 1}: ${displayedPhoneme}`
                              : `Row ${rowIndex + 1}, cell ${columnIndex + 1}: empty`
                          }
                          className={`wordle-cell wordle-cell--${cellState}`}
                          key={`cell-${rowIndex}-${columnIndex}`}
                          role="gridcell"
                        >
                          {displayedPhoneme}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="wordle-preview-key">
                <p>
                  <strong>Row 1:</strong> answer preview
                </p>
                <p>
                  <strong>Row 2:</strong> keyboard entry preview
                </p>
              </div>
            </div>

            <section
              aria-labelledby="phoneme-keyboard-heading"
              className="phoneme-keyboard"
            >
              <div className="phoneme-keyboard__heading">
                <div>
                  <h3 id="phoneme-keyboard-heading">Phoneme keyboard</h3>
                  <p>
                    Select symbols to fill the second grid row.
                    {hintsEnabled
                      ? " Hover over a phoneme for its English letter hint."
                      : ""}
                  </p>
                </div>

                <div className="phoneme-keyboard__actions">
                  <button
                    disabled={previewGuess.length === 0}
                    onClick={handleDeletePhoneme}
                    type="button"
                  >
                    Delete
                  </button>
                  <button
                    disabled={previewGuess.length === 0}
                    onClick={handleClearGuess}
                    type="button"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="phoneme-keyboard__rows">
                {PHONEME_KEYBOARD_ROWS.map((row, rowIndex) => (
                  <div
                    className="phoneme-keyboard__row"
                    key={`keyboard-row-${rowIndex}`}
                  >
                    {row.map((sourcePhoneme) => {
                      const phoneme = normalisePhoneme(sourcePhoneme);
                      const hint = getPhonemeHint(phoneme);

                      return (
                        <button
                          aria-label={
                            hintsEnabled
                              ? `Enter phoneme ${phoneme}. ${hint}`
                              : `Enter phoneme ${phoneme}.`
                          }
                          className="phoneme-key"
                          disabled={previewGuess.length >= phonemeCount}
                          key={`${rowIndex}-${phoneme}`}
                          onClick={() => handlePhonemeSelection(phoneme)}
                          title={hintsEnabled ? `/${phoneme}/ — ${hint}` : undefined}
                          type="button"
                        >
                          {phoneme}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </section>
    </section>
  );
}
