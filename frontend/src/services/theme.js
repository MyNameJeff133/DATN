const THEME_STORAGE_KEY = "theme";
const THEME_CHANGE_EVENT = "ur-theme-change";
const VALID_THEME_PREFERENCES = ["system", "light", "dark"];

const isValidThemePreference = (theme) => VALID_THEME_PREFERENCES.includes(theme);

export function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getStoredTheme() {
  return getStoredThemePreference();
}

export function getStoredThemePreference() {
  try {
    const theme = localStorage.getItem(THEME_STORAGE_KEY);
    return isValidThemePreference(theme) ? theme : "system";
  } catch {
    return "system";
  }
}

export function resolveThemePreference(themePreference = getStoredThemePreference()) {
  return themePreference === "system" ? getSystemTheme() : themePreference;
}

const updateThemeMeta = (effectiveTheme) => {
  if (typeof document === "undefined") return;

  const themeColor = effectiveTheme === "dark" ? "#08111f" : "#f6f9fc";
  let themeMeta = document.querySelector('meta[name="theme-color"]');

  if (!themeMeta) {
    themeMeta = document.createElement("meta");
    themeMeta.setAttribute("name", "theme-color");
    document.head.appendChild(themeMeta);
  }

  themeMeta.setAttribute("content", themeColor);
};

const emitThemeChange = (themePreference, effectiveTheme) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(THEME_CHANGE_EVENT, {
      detail: { themePreference, effectiveTheme },
    }),
  );
};

export function applyTheme(themePreference = getStoredThemePreference()) {
  if (typeof document === "undefined") {
    return "light";
  }

  const safePreference = isValidThemePreference(themePreference) ? themePreference : "system";
  const effectiveTheme = resolveThemePreference(safePreference);
  const root = document.documentElement;

  root.classList.toggle("dark", effectiveTheme === "dark");
  root.dataset.theme = effectiveTheme;
  root.dataset.themePreference = safePreference;
  updateThemeMeta(effectiveTheme);

  return effectiveTheme;
}

export function setThemePreference(themePreference) {
  const safePreference = isValidThemePreference(themePreference) ? themePreference : "system";

  try {
    localStorage.setItem(THEME_STORAGE_KEY, safePreference);
  } catch {}

  const effectiveTheme = applyTheme(safePreference);
  emitThemeChange(safePreference, effectiveTheme);

  return { themePreference: safePreference, effectiveTheme };
}

export function toggleTheme() {
  const next = getCurrentTheme() === "dark" ? "light" : "dark";
  setThemePreference(next);
  return next;
}

export function syncTheme() {
  const themePreference = getStoredThemePreference();
  const effectiveTheme = applyTheme(themePreference);
  return { themePreference, effectiveTheme };
}

export function getCurrentTheme() {
  if (typeof document === "undefined") {
    return getSystemTheme();
  }

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function getThemeState() {
  const themePreference = getStoredThemePreference();
  return {
    themePreference,
    effectiveTheme: resolveThemePreference(themePreference),
  };
}

export function subscribeThemeChanges(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");

  const notify = () => {
    const themePreference = getStoredThemePreference();
    const effectiveTheme = applyTheme(themePreference);
    callback({ themePreference, effectiveTheme });
  };

  const handleStorage = (event) => {
    if (event.key === THEME_STORAGE_KEY) {
      notify();
    }
  };

  const handleThemeEvent = (event) => {
    callback(event.detail || getThemeState());
  };

  const handleSystemChange = () => {
    if (getStoredThemePreference() === "system") {
      notify();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(THEME_CHANGE_EVENT, handleThemeEvent);
  if (mediaQuery?.addEventListener) {
    mediaQuery.addEventListener("change", handleSystemChange);
  } else {
    mediaQuery?.addListener?.(handleSystemChange);
  }

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, handleThemeEvent);
    if (mediaQuery?.removeEventListener) {
      mediaQuery.removeEventListener("change", handleSystemChange);
    } else {
      mediaQuery?.removeListener?.(handleSystemChange);
    }
  };
}
