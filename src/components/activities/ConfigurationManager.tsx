"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import {
  createActivityConfiguration,
  deleteActivityConfiguration,
  fetchActivityConfigurations,
  getErrorMessage,
  updateActivityConfiguration,
} from "@/lib/activityApi";
import type {
  ActivityConfigurationInput,
  ActivityType,
  DifficultyLevel,
  StoredActivityConfiguration,
} from "@/types/backend";

type ConfigurationDraft = Omit<
  ActivityConfigurationInput,
  "name" | "difficulty" | "notes"
>;

interface ConfigurationManagerProps {
  activityType: ActivityType;
  draft: ConfigurationDraft | null;
  onLoad: (configuration: StoredActivityConfiguration) => void;
}

export default function ConfigurationManager({
  activityType,
  draft,
  onLoad,
}: ConfigurationManagerProps) {
  const [configurations, setConfigurations] = useState<
    StoredActivityConfiguration[]
  >([]);
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] =
    useState<DifficultyLevel>("BEGINNER");
  const [notes, setNotes] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  const selectedConfiguration = useMemo(
    () => configurations.find((configuration) => configuration.id === selectedId),
    [configurations, selectedId],
  );

  const refreshConfigurations = useCallback(async () => {
    try {
      setErrorMessage("");
      const nextConfigurations =
        await fetchActivityConfigurations(activityType);
      setConfigurations(nextConfigurations);
      return nextConfigurations;
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      return [];
    }
  }, [activityType]);

  useEffect(() => {
    let isCurrent = true;

    async function loadConfigurations(): Promise<void> {
      try {
        const nextConfigurations =
          await fetchActivityConfigurations(activityType);

        if (isCurrent) {
          setConfigurations(nextConfigurations);
          setErrorMessage("");
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getErrorMessage(error));
        }
      }
    }

    void loadConfigurations();

    return () => {
      isCurrent = false;
    };
  }, [activityType]);

  function handleSelectionChange(event: ChangeEvent<HTMLSelectElement>): void {
    const nextId = event.target.value;
    const configuration = configurations.find((item) => item.id === nextId);

    setSelectedId(nextId);
    setStatusMessage("");
    setErrorMessage("");

    if (configuration) {
      setName(configuration.name);
      setDifficulty(configuration.difficulty);
      setNotes(configuration.notes ?? "");
    }
  }

  function buildInput(): ActivityConfigurationInput | null {
    if (!draft) {
      setErrorMessage("Choose valid activity content before saving.");
      return null;
    }

    return {
      ...draft,
      name,
      difficulty,
      notes: notes || null,
    };
  }

  async function handleCreate(): Promise<void> {
    const input = buildInput();

    if (!input) {
      return;
    }

    setIsWorking(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const created = await createActivityConfiguration(input);
      const nextConfigurations = await refreshConfigurations();
      setSelectedId(created.id);
      setConfigurations(
        nextConfigurations.some((item) => item.id === created.id)
          ? nextConfigurations
          : [created, ...nextConfigurations],
      );
      setStatusMessage(`Saved ${created.name}.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  }

  async function handleUpdate(): Promise<void> {
    const input = buildInput();

    if (!input || !selectedId) {
      if (!selectedId) {
        setErrorMessage("Choose a saved activity to update.");
      }
      return;
    }

    setIsWorking(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const updated = await updateActivityConfiguration(selectedId, input);
      await refreshConfigurations();
      setStatusMessage(`Updated ${updated.name}.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!selectedConfiguration) {
      setErrorMessage("Choose a saved activity to delete.");
      return;
    }

    if (!window.confirm(`Delete ${selectedConfiguration.name}?`)) {
      return;
    }

    setIsWorking(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      await deleteActivityConfiguration(selectedConfiguration.id);
      await refreshConfigurations();
      setSelectedId("");
      setName("");
      setDifficulty("BEGINNER");
      setNotes("");
      setStatusMessage(`Deleted ${selectedConfiguration.name}.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  }

  function handleLoad(): void {
    if (!selectedConfiguration) {
      setErrorMessage("Choose a saved activity to load.");
      return;
    }

    onLoad(selectedConfiguration);
    setStatusMessage(`Loaded ${selectedConfiguration.name}.`);
    setErrorMessage("");
  }

  return (
    <section aria-labelledby={`${activityType}-saved-heading`} className="saved-configuration">
      <div className="section-heading section-heading--compact">
        <p className="eyebrow">Database</p>
        <h3 id={`${activityType}-saved-heading`}>Saved activities</h3>
      </div>

      <div className="form-field">
        <label htmlFor={`${activityType}-saved-select`}>Saved activity</label>
        <select
          id={`${activityType}-saved-select`}
          onChange={handleSelectionChange}
          value={selectedId}
        >
          <option value="">Choose a saved activity</option>
          {configurations.map((configuration) => (
            <option key={configuration.id} value={configuration.id}>
              {configuration.name}
            </option>
          ))}
        </select>
      </div>

      <div className="saved-configuration__fields">
        <div className="form-field">
          <label htmlFor={`${activityType}-configuration-name`}>
            Activity name
          </label>
          <input
            id={`${activityType}-configuration-name`}
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Week 4 consonant practice"
            value={name}
          />
        </div>

        <div className="form-field">
          <label htmlFor={`${activityType}-configuration-difficulty`}>
            Difficulty
          </label>
          <select
            id={`${activityType}-configuration-difficulty`}
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
      </div>

      <div className="form-field">
        <label htmlFor={`${activityType}-configuration-notes`}>Notes</label>
        <textarea
          id={`${activityType}-configuration-notes`}
          maxLength={500}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          value={notes}
        />
      </div>

      <div className="saved-configuration__actions">
        <button
          className="button button--secondary"
          disabled={!selectedConfiguration || isWorking}
          onClick={handleLoad}
          type="button"
        >
          Load selected
        </button>
        <button
          className="button button--primary"
          disabled={!draft || isWorking}
          onClick={() => void handleCreate()}
          type="button"
        >
          Save new
        </button>
        <button
          className="button button--secondary"
          disabled={!selectedConfiguration || !draft || isWorking}
          onClick={() => void handleUpdate()}
          type="button"
        >
          Update selected
        </button>
        <button
          className="button button--danger"
          disabled={!selectedConfiguration || isWorking}
          onClick={() => void handleDelete()}
          type="button"
        >
          Delete selected
        </button>
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
  );
}
