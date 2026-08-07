import { useMemo, useSyncExternalStore } from "react";

export type ResolvedTheme = "light" | "dark";
export type Theme = ResolvedTheme | "system";
export type ColorScheme = "default" | "1" | "2" | "3" | "4" | "5";

export type UseThemeReturn = {
  readonly theme: Theme;
  readonly resolvedTheme: ResolvedTheme;
  readonly updateTheme: (mode: Theme) => void;
  readonly scheme: ColorScheme;
  readonly updateScheme: (scheme: ColorScheme) => void;
};

const listeners = new Set<() => void>();
let currentTheme: Theme = "system";
let systemDark = false;
let currentScheme: ColorScheme = "default";

const SCHEMES: ColorScheme[] = ["default", "1", "2", "3", "4", "5"];

const setCookie = (name: string, value: string, days = 365): void => {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const getStoredTheme = (): Theme => {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("theme") as Theme) || "system";
};

const getStoredScheme = (): ColorScheme => {
  if (typeof window === "undefined") return "default";
  const stored = localStorage.getItem("colorScheme");
  return SCHEMES.includes(stored as ColorScheme) ? (stored as ColorScheme) : "default";
};

const isDarkMode = (theme: Theme): boolean => {
  return theme === "dark" || (theme === "system" && systemDark);
};

const applyTheme = (theme: Theme): void => {
  if (typeof document === "undefined") return;
  const isDark = isDarkMode(theme);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
};

const applyScheme = (scheme: ColorScheme): void => {
  if (typeof document === "undefined") return;
  if (scheme === "default") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", scheme);
  }
};

const subscribe = (callback: () => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const notify = (): void => {
  listeners.forEach((listener) => {
    listener();
  });
};

export function initializeTheme(): void {
  if (typeof window === "undefined") return;

  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  systemDark = mq.matches;

  if (!localStorage.getItem("theme")) {
    localStorage.setItem("theme", "system");
    setCookie("theme", "system");
  }

  currentTheme = getStoredTheme();
  applyTheme(currentTheme);
  currentScheme = getStoredScheme();
  applyScheme(currentScheme);

  mq.addEventListener("change", (e) => {
    systemDark = e.matches;
    applyTheme(currentTheme);
    notify();
  });
}

export function useTheme(): UseThemeReturn {
  const theme = useSyncExternalStore(
    subscribe,
    () => currentTheme,
    () => "system" as const,
  );

  const isSystemDark = useSyncExternalStore(
    subscribe,
    () => systemDark,
    () => false,
  );

  const scheme = useSyncExternalStore(
    subscribe,
    () => currentScheme,
    () => "default" as const,
  );

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    return theme === "dark" || (theme === "system" && isSystemDark) ? "dark" : "light";
  }, [theme, isSystemDark]);

  const updateTheme = (mode: Theme): void => {
    currentTheme = mode;
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", mode);
      setCookie("theme", mode);
    }
    applyTheme(mode);
    notify();
  };

  const updateScheme = (scheme: ColorScheme): void => {
    currentScheme = scheme;
    if (typeof window !== "undefined") {
      localStorage.setItem("colorScheme", scheme);
    }
    applyScheme(scheme);
    notify();
  };

  return {
    theme,
    resolvedTheme,
    updateTheme,
    scheme,
    updateScheme,
  } as const;
}
