import type { ContentLabIdea } from "@/app/analytics/[accountName]/data.mock";
import { emitStorageChange, getKvValue, setKvValue } from "@/lib/browser-db";

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

export async function listSavedIdeas(): Promise<SavedPostIdea[]> {
  const raw = await getKvValue<string>(STORAGE_KEY);
  return parseStored(raw);
}

export async function getSavedFingerprintSet(): Promise<Set<string>> {
  const set = new Set<string>();
  for (const row of await listSavedIdeas()) {
    set.add(ideaFingerprint(row.accountName, row.idea));
  }
  return set;
}

async function writeAll(items: SavedPostIdea[]) {
  try {
    await setKvValue(STORAGE_KEY, JSON.stringify(items));
    emitStorageChange("saved-content-lab-ideas-changed");
  } catch {
    // quota / private mode
  }
}

export async function addSavedIdea(
  accountName: string,
  idea: ContentLabIdea
): Promise<{ ok: true; duplicate?: false } | { ok: false; duplicate: true }> {
  if (typeof window === "undefined") return { ok: false, duplicate: true };
  const fp = ideaFingerprint(accountName, idea);
  const existing = await listSavedIdeas();
  if (existing.some((row) => ideaFingerprint(row.accountName, row.idea) === fp)) {
    return { ok: false, duplicate: true };
  }
  const row: SavedPostIdea = {
    id: crypto.randomUUID(),
    savedAt: Date.now(),
    accountName: accountName.trim(),
    idea,
  };
  await writeAll([row, ...existing]);
  return { ok: true };
}

export async function removeSavedIdea(id: string): Promise<void> {
  if (typeof window === "undefined") return;
  const next = (await listSavedIdeas()).filter((row) => row.id !== id);
  await writeAll(next);
}
