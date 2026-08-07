"use client";

import { useEffect } from "react";

import {
  INTERFACE_PREFERENCES_STORAGE_KEY,
  parseInterfacePreferences,
} from "@/utils/interfacePreferences";

export default function PreferenceInitializer() {
  useEffect(() => {
    const preferences = parseInterfacePreferences(
      window.localStorage.getItem(INTERFACE_PREFERENCES_STORAGE_KEY),
    );

    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.dataset.layout = preferences.layout;
  }, []);

  return null;
}
