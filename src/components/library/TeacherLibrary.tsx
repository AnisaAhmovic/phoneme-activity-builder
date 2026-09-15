"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { useWordLists } from "@/hooks/useWordLists";
import {
  createWord,
  createWordList,
  deleteWord,
  deleteWordList,
  getErrorMessage,
  updateWord,
  updateWordList,
} from "@/lib/activityApi";
import type { DifficultyLevel, StoredWord } from "@/types/backend";

function phonemeTokens(value: string): string[] {
  return value
    .trim()
    .split(/[,\s]+/u)
    .map((phoneme) => phoneme.replace(/^\/(.*)\/$/u, "$1").trim())
    .filter(Boolean);
}

function readableDifficulty(value: DifficultyLevel): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default function TeacherLibrary() {
  const { wordLists, isLoading, errorMessage: loadError, refresh } =
    useWordLists();
  const [selectedListId, setSelectedListId] = useState("");
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [spelling, setSpelling] = useState("");
  const [phonemes, setPhonemes] = useState("");
  const [hint, setHint] = useState("");
  const [difficulty, setDifficulty] =
    useState<DifficultyLevel>("BEGINNER");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  const selectedList = useMemo(
    () => wordLists.find((wordList) => wordList.id === selectedListId),
    [selectedListId, wordLists],
  );

  useEffect(() => {
    if (
      wordLists.length > 0 &&
      !wordLists.some((wordList) => wordList.id === selectedListId)
    ) {
      let isCurrent = true;

      queueMicrotask(() => {
        if (isCurrent) {
          setSelectedListId(wordLists[0]?.id ?? "");
        }
      });

      return () => {
        isCurrent = false;
      };
    }
  }, [selectedListId, wordLists]);

  useEffect(() => {
    let isCurrent = true;

    queueMicrotask(() => {
      if (!isCurrent) {
        return;
      }

      setListName(selectedList?.name ?? "");
      setListDescription(selectedList?.description ?? "");
      setEditingWordId(null);
      setSpelling("");
      setPhonemes("");
      setHint("");
      setDifficulty("BEGINNER");
    });

    return () => {
      isCurrent = false;
    };
  }, [selectedList]);

  function clearMessages(): void {
    setStatusMessage("");
    setErrorMessage("");
  }

  function resetWordForm(): void {
    setEditingWordId(null);
    setSpelling("");
    setPhonemes("");
    setHint("");
    setDifficulty("BEGINNER");
  }

  async function handleCreateList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();
    setIsWorking(true);

    try {
      const created = await createWordList({
        name: newListName,
        description: newListDescription || null,
      });
      await refresh();
      setSelectedListId(created.id);
      setNewListName("");
      setNewListDescription("");
      setStatusMessage(`Created ${created.name}.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  }

  async function handleUpdateList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedList) {
      return;
    }

    clearMessages();
    setIsWorking(true);

    try {
      const updated = await updateWordList(selectedList.id, {
        name: listName,
        description: listDescription || null,
      });
      await refresh();
      setStatusMessage(`Updated ${updated.name}.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  }

  async function handleDeleteList(): Promise<void> {
    if (!selectedList) {
      return;
    }

    if (
      !window.confirm(
        `Delete ${selectedList.name}, its words and its saved activities?`,
      )
    ) {
      return;
    }

    clearMessages();
    setIsWorking(true);

    try {
      await deleteWordList(selectedList.id);
      const nextLists = await refresh();
      setSelectedListId(nextLists[0]?.id ?? "");
      setStatusMessage(`Deleted ${selectedList.name}.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  }

  async function handleWordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedList) {
      setErrorMessage("Create or choose a word list first.");
      return;
    }

    clearMessages();
    setIsWorking(true);

    const input = {
      spelling,
      phonemes: phonemeTokens(phonemes),
      hint: hint || null,
      difficulty,
    };

    try {
      const savedWord = editingWordId
        ? await updateWord(editingWordId, input)
        : await createWord({ ...input, wordListId: selectedList.id });

      await refresh();
      resetWordForm();
      setStatusMessage(
        `${editingWordId ? "Updated" : "Added"} ${savedWord.spelling}.`,
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  }

  function beginWordEdit(word: StoredWord): void {
    clearMessages();
    setEditingWordId(word.id);
    setSpelling(word.spelling);
    setPhonemes(word.phonemes.join(" "));
    setHint(word.hint ?? "");
    setDifficulty(word.difficulty);
  }

  async function handleDeleteWord(word: StoredWord): Promise<void> {
    if (!window.confirm(`Delete ${word.spelling}?`)) {
      return;
    }

    clearMessages();
    setIsWorking(true);

    try {
      await deleteWord(word.id);
      await refresh();
      if (editingWordId === word.id) {
        resetWordForm();
      }
      setStatusMessage(`Deleted ${word.spelling}.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className="teacher-library">
      <section aria-labelledby="word-list-management-heading" className="library-card">
        <div className="section-heading">
          <p className="eyebrow">Create and retrieve</p>
          <h2 id="word-list-management-heading">Word lists</h2>
        </div>

        <div className="library-list-grid">
          <form onSubmit={handleCreateList}>
            <h3>Create a word list</h3>
            <div className="form-field">
              <label htmlFor="new-list-name">Name</label>
              <input
                id="new-list-name"
                maxLength={80}
                onChange={(event) => setNewListName(event.target.value)}
                required
                value={newListName}
              />
            </div>
            <div className="form-field">
              <label htmlFor="new-list-description">Description</label>
              <textarea
                id="new-list-description"
                maxLength={500}
                onChange={(event) =>
                  setNewListDescription(event.target.value)
                }
                rows={3}
                value={newListDescription}
              />
            </div>
            <button
              className="button button--primary"
              disabled={isWorking}
              type="submit"
            >
              Create word list
            </button>
          </form>

          <form onSubmit={handleUpdateList}>
            <h3>Retrieve and update</h3>
            <div className="form-field">
              <label htmlFor="stored-list-select">Stored word list</label>
              <select
                id="stored-list-select"
                onChange={(event) => setSelectedListId(event.target.value)}
                value={selectedListId}
              >
                <option value="">Choose a word list</option>
                {wordLists.map((wordList) => (
                  <option key={wordList.id} value={wordList.id}>
                    {wordList.name} ({wordList.words.length} words)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="stored-list-name">Name</label>
              <input
                disabled={!selectedList}
                id="stored-list-name"
                maxLength={80}
                onChange={(event) => setListName(event.target.value)}
                required
                value={listName}
              />
            </div>
            <div className="form-field">
              <label htmlFor="stored-list-description">Description</label>
              <textarea
                disabled={!selectedList}
                id="stored-list-description"
                maxLength={500}
                onChange={(event) => setListDescription(event.target.value)}
                rows={3}
                value={listDescription}
              />
            </div>
            <div className="library-actions">
              <button
                className="button button--secondary"
                disabled={!selectedList || isWorking}
                type="submit"
              >
                Update word list
              </button>
              <button
                className="button button--danger"
                disabled={!selectedList || isWorking}
                onClick={() => void handleDeleteList()}
                type="button"
              >
                Delete word list
              </button>
            </div>
          </form>
        </div>
      </section>

      <section aria-labelledby="word-management-heading" className="library-card">
        <div className="section-heading">
          <p className="eyebrow">Full CRUD</p>
          <h2 id="word-management-heading">Words and phonemes</h2>
        </div>

        {isLoading ? <p role="status">Loading stored words...</p> : null}
        {loadError ? (
          <p className="form-error" role="alert">
            {loadError}
          </p>
        ) : null}

        <form className="word-editor" onSubmit={handleWordSubmit}>
          <h3>{editingWordId ? "Update word" : "Add word"}</h3>
          <div className="word-editor__fields">
            <div className="form-field">
              <label htmlFor="word-spelling">Written word</label>
              <input
                disabled={!selectedList}
                id="word-spelling"
                maxLength={60}
                onChange={(event) => setSpelling(event.target.value)}
                placeholder="chip"
                required
                value={spelling}
              />
            </div>
            <div className="form-field">
              <label htmlFor="word-phonemes">Phonemes</label>
              <input
                aria-describedby="word-phonemes-help"
                disabled={!selectedList}
                id="word-phonemes"
                onChange={(event) => setPhonemes(event.target.value)}
                placeholder="tʃ ɪ p"
                required
                value={phonemes}
              />
              <p className="form-help" id="word-phonemes-help">
                Separate 3 to 5 phonemes with spaces. Symbols such as tʃ and
                eɪ are stored as single, multi-character values.
              </p>
            </div>
            <div className="form-field">
              <label htmlFor="word-difficulty">Difficulty</label>
              <select
                disabled={!selectedList}
                id="word-difficulty"
                onChange={(event) =>
                  setDifficulty(event.target.value as DifficultyLevel)
                }
                value={difficulty}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="word-hint">Hint</label>
              <input
                disabled={!selectedList}
                id="word-hint"
                maxLength={160}
                onChange={(event) => setHint(event.target.value)}
                placeholder="Optional teacher note"
                value={hint}
              />
            </div>
          </div>
          <div className="library-actions">
            <button
              className="button button--primary"
              disabled={!selectedList || isWorking}
              type="submit"
            >
              {editingWordId ? "Update word" : "Add word"}
            </button>
            {editingWordId ? (
              <button
                className="button button--secondary"
                onClick={resetWordForm}
                type="button"
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>

        <div className="word-table-wrapper">
          <table className="word-table">
            <thead>
              <tr>
                <th scope="col">Word</th>
                <th scope="col">Phonemes</th>
                <th scope="col">Difficulty</th>
                <th scope="col">Hint</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedList?.words.map((word) => (
                <tr key={word.id}>
                  <th scope="row">{word.spelling}</th>
                  <td>{word.phonemes.join(" · ")}</td>
                  <td>{readableDifficulty(word.difficulty)}</td>
                  <td>{word.hint || "None"}</td>
                  <td>
                    <div className="word-table__actions">
                      <button
                        className="button-link"
                        onClick={() => beginWordEdit(word)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="button-link button-link--danger"
                        onClick={() => void handleDeleteWord(word)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {selectedList && selectedList.words.length === 0 ? (
                <tr>
                  <td colSpan={5}>No words have been added to this list.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <p aria-live="polite" className="activity-download-status">
          {statusMessage}
        </p>
        {errorMessage ? (
          <p className="form-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </section>
    </div>
  );
}
