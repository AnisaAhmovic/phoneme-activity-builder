"use client";

import { useEffect, useRef } from "react";
import type { ChangeEvent } from "react";

import { useTheme } from "@/components/settings/ThemeProvider";
import {
  createClearInterfacePreferencesCookie,
  createInterfacePreferencesCookie,
  DEFAULT_INTERFACE_PREFERENCES,
  readInterfacePreferencesCookie,
  type InterfaceLayout,
  type InterfaceTheme,
} from "@/utils/interfacePreferences";

export default function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const layoutRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const preferences = readInterfacePreferencesCookie(document.cookie);

    if (layoutRef.current) {
      layoutRef.current.value = preferences.layout;
    }

    document.documentElement.dataset.layout = preferences.layout;
  }, []);

  function handleThemeChange(event: ChangeEvent<HTMLSelectElement>): void {
    setTheme(event.target.value as InterfaceTheme);
  }

  function handleLayoutChange(event: ChangeEvent<HTMLSelectElement>): void {
    const layout = event.target.value as InterfaceLayout;

    document.documentElement.dataset.layout = layout;

    document.cookie = createInterfacePreferencesCookie({
      theme,
      layout,
    });
  }

  function handleReset(): void {
    if (layoutRef.current) {
      layoutRef.current.value = DEFAULT_INTERFACE_PREFERENCES.layout;
    }

    setTheme(DEFAULT_INTERFACE_PREFERENCES.theme);

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
              id="interface-theme"
              value={theme}
              onChange={handleThemeChange}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>

            <p className="form-help">
              Use a light or dark theme, or follow the browser and operating
              system preference.
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
