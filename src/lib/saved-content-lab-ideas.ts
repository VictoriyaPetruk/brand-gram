import type { ContentLabIdea } from "@/app/analytics/[accountName]/data.mock";

const STORAGE_KEY = "brandgram-saved-content-lab-ideas";

export type SavedPostIdea = {
  id: string;
  savedAt: number;
  accountName: string;
  idea: ContentLabIdea;
};

function parseStored(raw: string | null): SavedPostIdea[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(
      (row): row is SavedPostIdea =>
        row &&
        typeof row === "object" &&
        typeof (row as SavedPostIdea).id === "string" &&
        typeof (row as SavedPostIdea).savedAt === "number" &&
        typeof (row as SavedPostIdea).accountName === "string" &&
        typeof (row as SavedPostIdea).idea === "object" &&
        (row as SavedPostIdea).idea !== null &&
        typeof (row as SavedPostIdea).idea.title === "string" &&
        typeof (row as SavedPostIdea).idea.hook === "string" &&
        typeof (row as SavedPostIdea).idea.type === "string" &&
        typeof (row as SavedPostIdea).idea.color === "string"
    );
  } catch {
    return [];
  }
}

export function ideaFingerprint(accountName: string, idea: ContentLabIdea): string {
  return `${accountName.trim().toLowerCase()}|${idea.type}|${idea.title}|${idea.hook}`;
}

export function listSavedIdeas(): SavedPostIdea[] {
  if (typeof window === "undefined") return [];
  return parseStored(localStorage.getItem(STORAGE_KEY));
}

export function getSavedFingerprintSet(): Set<string> {
  const set = new Set<string>();
  for (const row of listSavedIdeas()) {
    set.add(ideaFingerprint(row.accountName, row.idea));
  }
  return set;
}

function writeAll(items: SavedPostIdea[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota / private mode
  }
}

export function addSavedIdea(
  accountName: string,
  idea: ContentLabIdea
): { ok: true; duplicate?: false } | { ok: false; duplicate: true } {
  if (typeof window === "undefined") return { ok: false, duplicate: true };
  const fp = ideaFingerprint(accountName, idea);
  const existing = listSavedIdeas();
  if (existing.some((row) => ideaFingerprint(row.accountName, row.idea) === fp)) {
    return { ok: false, duplicate: true };
  }
  const row: SavedPostIdea = {
    id: crypto.randomUUID(),
    savedAt: Date.now(),
    accountName: accountName.trim(),
    idea,
  };
  writeAll([row, ...existing]);
  return { ok: true };
}

export function removeSavedIdea(id: string): void {
  if (typeof window === "undefined") return;
  const next = listSavedIdeas().filter((row) => row.id !== id);
  writeAll(next);
}
