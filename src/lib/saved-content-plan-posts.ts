import type { ContentLabIdea, GeneratedPostContent } from "@/app/analytics/[accountName]/data.mock";
import { emitStorageChange, getKvValue, removeKvValue, setKvValue } from "@/lib/browser-db";

const STORAGE_KEY = "brandgram-saved-content-plan-posts";
const VOLATILE_CACHE_KEYS = [
  "brandgram-content-lab-generated-image-by-idea",
  "brandgram-content-lab-generated-post-by-idea",
] as const;

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

function normalizePost(post: unknown): GeneratedPostContent | null {
  if (!post || typeof post !== "object") return null;
  const p = post as Partial<GeneratedPostContent>;
  if (typeof p.caption !== "string" || typeof p.imagePrompt !== "string" || typeof p.strategyNote !== "string") {
    return null;
  }
  const hashtags = Array.isArray(p.hashtags)
    ? p.hashtags.map((tag) => String(tag).trim()).filter((tag) => tag.length > 0)
    : [];
  return {
    caption: p.caption,
    hashtags,
    imagePrompt: p.imagePrompt,
    strategyNote: p.strategyNote,
  };
}

function normalizeIdeaContext(
  ideaContext: unknown
): Pick<ContentLabIdea, "type" | "title" | "hook" | "color"> | null {
  if (!ideaContext || typeof ideaContext !== "object") return null;
  const ic = ideaContext as Partial<Pick<ContentLabIdea, "type" | "title" | "hook" | "color">>;
  if (typeof ic.type !== "string" || typeof ic.title !== "string" || typeof ic.hook !== "string") return null;
  return {
    type: ic.type,
    title: ic.title,
    hook: ic.hook,
    color: typeof ic.color === "string" && ic.color.trim().length > 0 ? ic.color : "#6366f1",
  };
}

function parseStored(raw: string | null): SavedContentPlanPost[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    const out: SavedContentPlanPost[] = [];
    for (const row of data) {
      if (!row || typeof row !== "object") continue;
      const r = row as Partial<SavedContentPlanPost>;
      if (typeof r.id !== "string" || typeof r.savedAt !== "number" || typeof r.accountName !== "string") {
        continue;
      }
      const normalizedPost = normalizePost(r.post);
      if (!normalizedPost) continue;
      out.push({
        id: r.id,
        savedAt: r.savedAt,
        postedAt: typeof r.postedAt === "number" ? r.postedAt : null,
        accountName: r.accountName,
        post: normalizedPost,
        imageUrl: typeof r.imageUrl === "string" && r.imageUrl.trim().length > 0 ? r.imageUrl : null,
        ideaContext: normalizeIdeaContext(r.ideaContext),
      });
    }
    return out;
  } catch {
    return [];
  }
}

export async function listSavedContentPlanPosts(): Promise<SavedContentPlanPost[]> {
  const raw = await getKvValue<string>(STORAGE_KEY);
  return parseStored(raw).map((row) => ({
    ...row,
    postedAt: row.postedAt ?? null,
    ideaContext: row.ideaContext ?? null,
  }));
}

async function writeAll(items: SavedContentPlanPost[]) {
  try {
    await setKvValue(STORAGE_KEY, JSON.stringify(items));
    emitStorageChange("saved-content-plan-posts-changed");
    return true;
  } catch {
    // quota / private mode
    return false;
  }
}

async function clearVolatileCaches() {
  for (const key of VOLATILE_CACHE_KEYS) {
    try {
      await removeKvValue(key);
    } catch {
      // ignore
    }
  }
}

async function writeAllWithImageFallback(
  items: SavedContentPlanPost[],
  fallbackRowId?: string
): Promise<boolean> {
  if (await writeAll(items)) return true;
  // Free non-critical caches first, then retry with original payload.
  await clearVolatileCaches();
  if (await writeAll(items)) return true;
  if (items.length === 0) return false;

  // Prefer keeping image on the newly written row; strip older rows first.
  const progressive = [...items];
  for (let i = progressive.length - 1; i >= 0; i -= 1) {
    if (progressive[i]?.id === fallbackRowId) continue;
    if (!progressive[i]?.imageUrl) continue;
    progressive[i] = { ...progressive[i], imageUrl: null };
    if (await writeAll(progressive)) return true;
  }
  // Then drop oldest rows while keeping newest (index 0 = newest/newly saved).
  for (let keepCount = progressive.length - 1; keepCount >= 1; keepCount -= 1) {
    const trimmed = progressive.slice(0, keepCount);
    if (await writeAll(trimmed)) return true;
  }

  // Absolute last resort: strip image from the newly written row.
  const targetedFallback = progressive.map((row) =>
    row.id === fallbackRowId ? { ...row, imageUrl: null } : row
  );
  if (await writeAll(targetedFallback)) return true;
  // Last resort: keep newest rows (including the just-saved row at index 0)
  // and drop oldest rows until write succeeds (with the new row image removed).
  for (let keepCount = targetedFallback.length - 1; keepCount >= 1; keepCount -= 1) {
    const trimmed = targetedFallback.slice(0, keepCount);
    if (await writeAll(trimmed)) return true;
  }
  return false;
}

export async function addSavedContentPlanPost(entry: SavedContentPlanPostInput): Promise<void> {
  if (typeof window === "undefined") return;
  const normalizedPost = normalizePost(entry.post);
  if (!normalizedPost) return;
  const normalizedImageUrl =
    typeof entry.imageUrl === "string" && entry.imageUrl.trim().length > 0
      ? entry.imageUrl.trim()
      : null;
  const row: SavedContentPlanPost = {
    ...entry,
    id: crypto.randomUUID(),
    savedAt: Date.now(),
    postedAt: entry.postedAt ?? null,
    post: normalizedPost,
    imageUrl: normalizedImageUrl,
    ideaContext: normalizeIdeaContext(entry.ideaContext),
  };
  const existing = await listSavedContentPlanPosts();
  await writeAllWithImageFallback([row, ...existing], row.id);
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
): Promise<SavedContentPlanPost | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  const normalizedAccount = accountName.trim().toLowerCase();
  return listSavedContentPlanPosts().then(
    (existing) =>
      existing.find(
        (row) =>
          row.accountName.trim().toLowerCase() === normalizedAccount &&
          sameIdeaContext(row.ideaContext ?? null, ideaContext ?? null)
      ) ?? null
  );
}

export async function upsertSavedContentPlanPost(
  entry: SavedContentPlanPostInput
): Promise<"created" | "updated" | "failed"> {
  if (typeof window === "undefined") return "failed";
  const normalizedPost = normalizePost(entry.post);
  if (!normalizedPost) return "failed";
  const normalizedIdeaContext = normalizeIdeaContext(entry.ideaContext);
  const normalizedImageUrl =
    typeof entry.imageUrl === "string" && entry.imageUrl.trim().length > 0
      ? entry.imageUrl.trim()
      : null;
  const normalizedAccount = entry.accountName.trim().toLowerCase();
  const existing = await listSavedContentPlanPosts();
  const index = existing.findIndex(
    (row) =>
      row.accountName.trim().toLowerCase() === normalizedAccount &&
      sameIdeaContext(row.ideaContext ?? null, normalizedIdeaContext)
  );
  if (index === -1) {
    const row: SavedContentPlanPost = {
      ...entry,
      id: crypto.randomUUID(),
      savedAt: Date.now(),
      postedAt: entry.postedAt ?? null,
      post: normalizedPost,
      imageUrl: normalizedImageUrl,
      ideaContext: normalizedIdeaContext,
    };
    return (await writeAllWithImageFallback([row, ...existing], row.id)) ? "created" : "failed";
  }
  const prev = existing[index];
  const nextRow: SavedContentPlanPost = {
    ...entry,
    id: prev.id,
    savedAt: Date.now(),
    postedAt: entry.postedAt ?? prev.postedAt ?? null,
    post: normalizedPost,
    imageUrl: normalizedImageUrl,
    ideaContext: normalizedIdeaContext,
  };
  const next = [...existing];
  next.splice(index, 1);
  return (await writeAllWithImageFallback([nextRow, ...next], nextRow.id)) ? "updated" : "failed";
}

export async function removeSavedContentPlanPost(id: string): Promise<void> {
  if (typeof window === "undefined") return;
  const items = await listSavedContentPlanPosts();
  await writeAll(items.filter((row) => row.id !== id));
}

export async function markSavedContentPlanPostPosted(id: string, posted: boolean): Promise<void> {
  if (typeof window === "undefined") return;
  const next = (await listSavedContentPlanPosts()).map((row) =>
    row.id === id
      ? {
          ...row,
          postedAt: posted ? Date.now() : null,
        }
      : row
  );
  await writeAll(next);
}
