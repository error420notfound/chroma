const STORAGE_VERSION = 1;
const VERSION_KEY = 'chroma:storage-version';

function ensureVersion() {
  try {
    const stored = localStorage.getItem(VERSION_KEY);
    if (stored !== String(STORAGE_VERSION)) {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('chroma:') && key !== VERSION_KEY) localStorage.removeItem(key);
      }
      localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION));
    }
  } catch {
    /* Storage may be blocked; callers receive their safe fallback. */
  }
}

export function readStored<T>(
  key: string,
  fallback: T,
  validate?: (value: unknown) => value is T,
): T {
  if (typeof window === 'undefined') return fallback;
  try {
    ensureVersion();
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? '');
    return validate ? (validate(value) ? value : fallback) : (value as T);
  } catch {
    return fallback;
  }
}
export function saveStored<T>(key: string, value: T) {
  ensureVersion();
  localStorage.setItem(key, JSON.stringify(value));
}

export function clearStored() {
  if (typeof window === 'undefined') return;
  try {
    for (const key of Object.keys(localStorage))
      if (key.startsWith('chroma:') && key !== VERSION_KEY) localStorage.removeItem(key);
  } catch {
    /* Reset remains a no-op when browser storage is unavailable. */
  }
}
