import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toggleTheme, getStoredTheme } from '../services/theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const stored = getStoredTheme();
    if (stored) setTheme(stored);
  }, []);

  const handleToggle = () => {
    const next = toggleTheme();
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="Chuyển giao diện sáng/tối"
      title="Chuyển giao diện sáng/tối"
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-200 hover:text-cyan-700"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
