"use client";

import { useEffect, useRef } from "react";
import type { ChangeEvent } from "react";

import {
  createClearInterfacePreferencesCookie,
  createInterfacePreferencesCookie,
  DEFAULT_INTERFACE_PREFERENCES,
  readInterfacePreferencesCookie,
  type InterfaceLayout,
  type InterfacePreferences,
  type InterfaceTheme,
} from "@/utils/interfacePreferences";

function applyPreferences(preferences: InterfacePreferences): void {
  document.documentElement.dataset.theme = preferences.theme;
  document.documentElement.dataset.layout = preferences.layout;
  document.cookie = createInterfacePreferencesCookie(preferences);
}

export default function SettingsPanel() {
  const themeRef = useRef<HTMLSelectElement>(null);
  const layoutRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const preferences = readInterfacePreferencesCookie(document.cookie);

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
    document.cookie = createClearInterfacePreferencesCookie();
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
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            <p className="form-help">
              Switches between the required light and dark interface themes.
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
        <strong>Saved in a cookie</strong>
        <p>
          Theme and layout preferences are stored in a browser cookie and
          restored when the application is opened again.
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
