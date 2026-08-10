"use client";

import { useEffect } from "react";

import { readInterfacePreferencesCookie } from "@/utils/interfacePreferences";

export default function PreferenceInitializer() {
  useEffect(() => {
    const preferences = readInterfacePreferencesCookie(document.cookie);

    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.dataset.layout = preferences.layout;
  }, []);

  return null;
}
