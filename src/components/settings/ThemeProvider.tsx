"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import {
  createInterfacePreferencesCookie,
  type InterfaceTheme,
} from "@/utils/interfacePreferences";

interface ThemeContextValue {
  theme: InterfaceTheme;
  setTheme: (theme: InterfaceTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme: InterfaceTheme;
}

export function ThemeProvider({
  children,
  initialTheme,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<InterfaceTheme>(initialTheme);

  function setTheme(newTheme: InterfaceTheme) {
    setThemeState(newTheme);

    document.documentElement.dataset.theme = newTheme;

    const layout =
      document.documentElement.dataset.layout === "wide"
        ? "wide"
        : "standard";

    document.cookie = createInterfacePreferencesCookie({
      theme: newTheme,
      layout,
    });
  }

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}