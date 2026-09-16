export const INTERFACE_PREFERENCES_COOKIE =
  "phoneme_activity_builder_preferences";

export const INTERFACE_THEMES = ["light", "dark", "system"] as const;
export const INTERFACE_LAYOUTS = ["standard", "wide"] as const;

export type InterfaceTheme = (typeof INTERFACE_THEMES)[number];
export type InterfaceLayout = (typeof INTERFACE_LAYOUTS)[number];

export interface InterfacePreferences {
  theme: InterfaceTheme;
  layout: InterfaceLayout;
}

export const DEFAULT_INTERFACE_PREFERENCES: InterfacePreferences = {
  theme: "system",
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

export function readInterfacePreferencesCookie(
  cookieString: string,
): InterfacePreferences {
  const prefix = `${INTERFACE_PREFERENCES_COOKIE}=`;
  const cookieValue = cookieString
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);

  if (!cookieValue) {
    return DEFAULT_INTERFACE_PREFERENCES;
  }

  try {
    return parseInterfacePreferences(decodeURIComponent(cookieValue));
  } catch {
    return DEFAULT_INTERFACE_PREFERENCES;
  }
}

export function createInterfacePreferencesCookie(
  preferences: InterfacePreferences,
): string {
  const value = encodeURIComponent(JSON.stringify(preferences));

  return `${INTERFACE_PREFERENCES_COOKIE}=${value}; Max-Age=31536000; Path=/; SameSite=Lax`;
}

export function createClearInterfacePreferencesCookie(): string {
  return `${INTERFACE_PREFERENCES_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}
