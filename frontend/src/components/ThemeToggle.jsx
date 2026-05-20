import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getThemeState,
  setThemePreference,
  subscribeThemeChanges,
  syncTheme,
} from "../services/theme";

const themeOptions = [
  { value: "light", label: "Sáng", icon: Sun },
  { value: "dark", label: "Tối", icon: Moon },
  { value: "system", label: "Theo máy", icon: Monitor },
];

export default function ThemeToggle({ className = "" }) {
  const [themeState, setThemeState] = useState(() => getThemeState());

  useEffect(() => {
    setThemeState(syncTheme());
    return subscribeThemeChanges(setThemeState);
  }, []);

  const handleChange = (themePreference) => {
    setThemeState(setThemePreference(themePreference));
  };

  return (
    <div
      className={`inline-flex h-11 items-center rounded-2xl border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur transition dark:border-slate-700 dark:bg-slate-900/90 ${className}`}
      role="group"
      aria-label="Chọn giao diện"
      title={`Giao diện hiện tại: ${themeState.effectiveTheme === "dark" ? "tối" : "sáng"}`}
    >
      {themeOptions.map((option) => {
        const Icon = option.icon;
        const active = themeState.themePreference === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-label={`Giao diện ${option.label}`}
            aria-pressed={active}
            title={option.label}
            onClick={() => handleChange(option.value)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm transition ${
              active
                ? "bg-cyan-700 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100 hover:text-cyan-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-cyan-300"
            }`}
          >
            <Icon size={17} />
          </button>
        );
      })}
    </div>
  );
}
