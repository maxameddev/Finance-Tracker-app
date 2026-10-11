import { createContext, useContext, useEffect, useState } from "react";

// shadcn/ui's standard Vite theme provider (JS version).
// theme is "light" | "dark" | "system"; "system" follows prefers-color-scheme.
const ThemeProviderContext = createContext({
  theme: "system",
  setTheme: () => null,
});

const readStored = (key, fallback) => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "vite-ui-theme" }) {
  const [theme, setThemeState] = useState(() => readStored(storageKey, defaultTheme));

  useEffect(() => {
    const root = window.document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const resolved = theme === "system" ? (media.matches ? "dark" : "light") : theme;
      root.classList.remove("light", "dark");
      root.classList.add(resolved);
    };

    apply();

    // While on "system", follow live OS theme changes too.
    if (theme === "system") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [theme]);

  const setTheme = (next) => {
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
    setThemeState(next);
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>{children}</ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
