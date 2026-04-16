import type { ContentLabIdea, GeneratedPostContent } from "@/app/analytics/[accountName]/data.mock";

const STORAGE_KEY = "brandgram-saved-content-plan-posts";

export type SavedContentPlanPost = {
  id: string;
  savedAt: number;
  postedAt: number | null;
  accountName: string;
  post: GeneratedPostContent;
  /** Demo / generated preview image URL when present. */
  imageUrl: string | null;
  /** Idea card context at save time. */
  ideaContext: Pick<ContentLabIdea, "type" | "title" | "hook" | "color"> | null;
};

export type SavedContentPlanPostInput = Omit<SavedContentPlanPost, "id" | "savedAt" | "postedAt"> & {
  postedAt?: number | null;
};

function parseStored(raw: string | null): SavedContentPlanPost[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter((row): row is SavedContentPlanPost => {
      if (!row || typeof row !== "object") return false;
      const r = row as SavedContentPlanPost;
      if (typeof r.id !== "string" || typeof r.savedAt !== "number" || typeof r.accountName !== "string") {
        return false;
      }
      if (r.postedAt !== undefined && r.postedAt !== null && typeof r.postedAt !== "number") {
        return false;
      }
      const p = r.post;
      if (!p || typeof p !== "object") return false;
      if (
        typeof p.caption !== "string" ||
        !Array.isArray(p.hashtags) ||
        !p.hashtags.every((t) => typeof t === "string") ||
        typeof p.imagePrompt !== "string" ||
        typeof p.strategyNote !== "string"
      ) {
        return false;
      }
      if (r.imageUrl !== null && typeof r.imageUrl !== "string") return false;
      if (r.ideaContext !== null && r.ideaContext !== undefined) {
        const ic = r.ideaContext;
        if (
          typeof ic !== "object" ||
          typeof ic.type !== "string" ||
          typeof ic.title !== "string" ||
          typeof ic.hook !== "string" ||
          typeof ic.color !== "string"
        ) {
          return false;
        }
      }
      return true;
    });
  } catch {
    return [];
  }
}

export function listSavedContentPlanPosts(): SavedContentPlanPost[] {
  if (typeof window === "undefined") return [];
  return parseStored(localStorage.getItem(STORAGE_KEY)).map((row) => ({
    ...row,
    postedAt: row.postedAt ?? null,
    ideaContext: row.ideaContext ?? null,
  }));
}

function writeAll(items: SavedContentPlanPost[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota / private mode
  }
}

export function addSavedContentPlanPost(entry: SavedContentPlanPostInput): void {
  if (typeof window === "undefined") return;
  const row: SavedContentPlanPost = {
    ...entry,
    id: crypto.randomUUID(),
    savedAt: Date.now(),
    postedAt: entry.postedAt ?? null,
  };
  const existing = listSavedContentPlanPosts();
  writeAll([row, ...existing]);
}

function sameIdeaContext(
  a: SavedContentPlanPost["ideaContext"],
  b: SavedContentPlanPost["ideaContext"]
): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.type === b.type && a.title === b.title && a.hook === b.hook;
}

export function findSavedContentPlanPostByContext(
  accountName: string,
  ideaContext: SavedContentPlanPost["ideaContext"]
): SavedContentPlanPost | null {
  if (typeof window === "undefined") return null;
  const normalizedAccount = accountName.trim().toLowerCase();
  const existing = listSavedContentPlanPosts();
  return (
    existing.find(
      (row) =>
        row.accountName.trim().toLowerCase() === normalizedAccount &&
        sameIdeaContext(row.ideaContext ?? null, ideaContext ?? null)
    ) ?? null
  );
}

export function upsertSavedContentPlanPost(entry: SavedContentPlanPostInput): "created" | "updated" {
  if (typeof window === "undefined") return "created";
  const normalizedAccount = entry.accountName.trim().toLowerCase();
  const existing = listSavedContentPlanPosts();
  const index = existing.findIndex(
    (row) =>
      row.accountName.trim().toLowerCase() === normalizedAccount &&
      sameIdeaContext(row.ideaContext ?? null, entry.ideaContext ?? null)
  );
  if (index === -1) {
    const row: SavedContentPlanPost = {
      ...entry,
      id: crypto.randomUUID(),
      savedAt: Date.now(),
      postedAt: entry.postedAt ?? null,
    };
    writeAll([row, ...existing]);
    return "created";
  }
  const prev = existing[index];
  const nextRow: SavedContentPlanPost = {
    ...entry,
    id: prev.id,
    savedAt: Date.now(),
    postedAt: entry.postedAt ?? prev.postedAt ?? null,
  };
  const next = [...existing];
  next.splice(index, 1);
  writeAll([nextRow, ...next]);
  return "updated";
}

export function removeSavedContentPlanPost(id: string): void {
  if (typeof window === "undefined") return;
  writeAll(listSavedContentPlanPosts().filter((row) => row.id !== id));
}

export function markSavedContentPlanPostPosted(id: string, posted: boolean): void {
  if (typeof window === "undefined") return;
  const next = listSavedContentPlanPosts().map((row) =>
    row.id === id
      ? {
          ...row,
          postedAt: posted ? Date.now() : null,
        }
      : row
  );
  writeAll(next);
}
