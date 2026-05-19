export function getStoredTheme() {
  try {
    return localStorage.getItem('theme');
  } catch {
    return null;
  }
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  try {
    localStorage.setItem('theme', theme);
  } catch {}
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  const next = isDark ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

export function syncTheme() {
  const stored = getStoredTheme();
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored);
    return stored;
  }

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = prefersDark ? 'dark' : 'light';
  applyTheme(initial);
  return initial;
}

export function getCurrentTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}
