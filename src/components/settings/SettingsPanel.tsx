"use client";

import { useEffect, useRef } from "react";
import type { ChangeEvent } from "react";

import {
  DEFAULT_INTERFACE_PREFERENCES,
  INTERFACE_PREFERENCES_STORAGE_KEY,
  parseInterfacePreferences,
  type InterfaceLayout,
  type InterfacePreferences,
  type InterfaceTheme,
} from "@/utils/interfacePreferences";

function applyPreferences(preferences: InterfacePreferences): void {
  document.documentElement.dataset.theme = preferences.theme;
  document.documentElement.dataset.layout = preferences.layout;

  window.localStorage.setItem(
    INTERFACE_PREFERENCES_STORAGE_KEY,
    JSON.stringify(preferences),
  );
}

export default function SettingsPanel() {
  const themeRef = useRef<HTMLSelectElement>(null);
  const layoutRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const preferences = parseInterfacePreferences(
      window.localStorage.getItem(INTERFACE_PREFERENCES_STORAGE_KEY),
    );

    if (themeRef.current) {
      themeRef.current.value = preferences.theme;
    }

    if (layoutRef.current) {
      layoutRef.current.value = preferences.layout;
    }

    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.dataset.layout = preferences.layout;
  }, []);

  function handleThemeChange(event: ChangeEvent<HTMLSelectElement>): void {
    const preferences: InterfacePreferences = {
      theme: event.target.value as InterfaceTheme,
      layout:
        (layoutRef.current?.value as InterfaceLayout | undefined) ??
        DEFAULT_INTERFACE_PREFERENCES.layout,
    };

    applyPreferences(preferences);
  }

  function handleLayoutChange(event: ChangeEvent<HTMLSelectElement>): void {
    const preferences: InterfacePreferences = {
      theme:
        (themeRef.current?.value as InterfaceTheme | undefined) ??
        DEFAULT_INTERFACE_PREFERENCES.theme,
      layout: event.target.value as InterfaceLayout,
    };

    applyPreferences(preferences);
  }

  function handleReset(): void {
    if (themeRef.current) {
      themeRef.current.value = DEFAULT_INTERFACE_PREFERENCES.theme;
    }

    if (layoutRef.current) {
      layoutRef.current.value = DEFAULT_INTERFACE_PREFERENCES.layout;
    }

    document.documentElement.dataset.theme =
      DEFAULT_INTERFACE_PREFERENCES.theme;
    document.documentElement.dataset.layout =
      DEFAULT_INTERFACE_PREFERENCES.layout;
    window.localStorage.removeItem(INTERFACE_PREFERENCES_STORAGE_KEY);
  }

  return (
    <section
      aria-labelledby="interface-settings-heading"
      className="settings-panel"
    >
      <div className="section-heading">
        <p className="eyebrow">Interface</p>
        <h2 id="interface-settings-heading">Display preferences</h2>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <div className="form-field">
            <label htmlFor="interface-theme">Colour theme</label>
            <select
              defaultValue={DEFAULT_INTERFACE_PREFERENCES.theme}
              id="interface-theme"
              onChange={handleThemeChange}
              ref={themeRef}
            >
              <option value="blue">Blue</option>
              <option value="teal">Teal</option>
              <option value="high-contrast">High contrast</option>
            </select>
            <p className="form-help">
              Changes the accent colour while keeping activity-state colours
              distinct.
            </p>
          </div>
        </div>

        <div className="settings-card">
          <div className="form-field">
            <label htmlFor="interface-layout">Content layout</label>
            <select
              defaultValue={DEFAULT_INTERFACE_PREFERENCES.layout}
              id="interface-layout"
              onChange={handleLayoutChange}
              ref={layoutRef}
            >
              <option value="standard">Standard</option>
              <option value="wide">Wide</option>
            </select>
            <p className="form-help">
              Wide layout gives the activity builders more horizontal space on
              larger screens.
            </p>
          </div>
        </div>
      </div>

      <div className="settings-note">
        <strong>Saved in this browser</strong>
        <p>
          These preferences are stored locally and applied when the application
          is opened again on this device.
        </p>
      </div>

      <div className="settings-actions">
        <button
          className="button button--secondary"
          onClick={handleReset}
          type="button"
        >
          Reset preferences
        </button>
      </div>
    </section>
  );
}
