const FAVORITES_KEY = "itera.favorites.v1";

export function loadFavorites(): string[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(FAVORITES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function saveFavorites(slugs: string[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(new Set(slugs))));
}

export function toggleFavorite(slug: string) {
  const current = loadFavorites();
  const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
  saveFavorites(next);
  return next;
}
