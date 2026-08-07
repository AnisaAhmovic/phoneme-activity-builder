export const INTERFACE_PREFERENCES_STORAGE_KEY =
  "phoneme-activity-builder:interface-preferences";

export const INTERFACE_THEMES = ["blue", "teal", "high-contrast"] as const;
export const INTERFACE_LAYOUTS = ["standard", "wide"] as const;

export type InterfaceTheme = (typeof INTERFACE_THEMES)[number];
export type InterfaceLayout = (typeof INTERFACE_LAYOUTS)[number];

export interface InterfacePreferences {
  theme: InterfaceTheme;
  layout: InterfaceLayout;
}

export const DEFAULT_INTERFACE_PREFERENCES: InterfacePreferences = {
  theme: "blue",
  layout: "standard",
};

function isInterfaceTheme(value: unknown): value is InterfaceTheme {
  return INTERFACE_THEMES.includes(value as InterfaceTheme);
}

function isInterfaceLayout(value: unknown): value is InterfaceLayout {
  return INTERFACE_LAYOUTS.includes(value as InterfaceLayout);
}

export function parseInterfacePreferences(
  rawValue: string | null,
): InterfacePreferences {
  if (!rawValue) {
    return DEFAULT_INTERFACE_PREFERENCES;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<InterfacePreferences>;

    return {
      theme: isInterfaceTheme(parsedValue.theme)
        ? parsedValue.theme
        : DEFAULT_INTERFACE_PREFERENCES.theme,
      layout: isInterfaceLayout(parsedValue.layout)
        ? parsedValue.layout
        : DEFAULT_INTERFACE_PREFERENCES.layout,
    };
  } catch {
    return DEFAULT_INTERFACE_PREFERENCES;
  }
}
