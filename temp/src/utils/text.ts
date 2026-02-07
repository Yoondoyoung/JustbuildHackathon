export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(s: string): string[] {
  const normalized = normalizeText(s);
  if (!normalized) return [];
  return normalized.split(' ').filter(Boolean);
}
