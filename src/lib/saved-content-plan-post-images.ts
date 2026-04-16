import type { GeneratedPostContent } from "@/app/analytics/[accountName]/data.mock";
import { emitStorageChange, getKvValue, removeKvValue, setKvValue } from "@/lib/browser-db";

const STORAGE_KEY = "brandgram-saved-content-plan-image-by-account-post";
const IMAGE_REF_PREFIX = "saved-content-plan-image-ref://";
const VOLATILE_CACHE_KEYS = [
  "brandgram-content-lab-generated-image-by-idea",
  "brandgram-content-lab-generated-post-by-idea",
] as const;

function normalizeAccount(accountName: string): string {
  return accountName.trim().toLowerCase();
}

function postFingerprint(post: GeneratedPostContent): string {
  const hashtags = Array.isArray(post.hashtags)
    ? post.hashtags.map((tag) => tag.trim().toLowerCase()).join("|")
    : "";
  return [post.caption.trim(), post.imagePrompt.trim(), post.strategyNote.trim(), hashtags].join("::");
}

function makeKey(accountName: string, post: GeneratedPostContent): string {
  return `${normalizeAccount(accountName)}::${postFingerprint(post)}`;
}

export function buildSavedContentPlanPostImageRef(accountName: string, post: GeneratedPostContent): string {
  return `${IMAGE_REF_PREFIX}${makeKey(accountName, post)}`;
}

export function isSavedContentPlanPostImageRef(imageUrl: string | null | undefined): boolean {
  return typeof imageUrl === "string" && imageUrl.startsWith(IMAGE_REF_PREFIX);
}

async function readMap(): Promise<Record<string, string>> {
  try {
    const raw = await getKvValue<string>(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "string" && v.trim().length > 0) {
        out[k] = v.trim();
      }
    }
    return out;
  } catch {
    return {};
  }
}

async function writeMap(map: Record<string, string>) {
  try {
    await setKvValue(STORAGE_KEY, JSON.stringify(map));
    emitStorageChange("saved-content-plan-images-changed");
    return true;
  } catch {
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

async function writeMapWithRecovery(map: Record<string, string>, preferredKey?: string): Promise<boolean> {
  if (await writeMap(map)) return true;
  await clearVolatileCaches();
  if (await writeMap(map)) return true;
  const working = { ...map };
  const orderedKeys = Object.keys(working).filter((key) => key !== preferredKey);
  for (let i = 0; i < orderedKeys.length; i += 1) {
    delete working[orderedKeys[i]];
    if (await writeMap(working)) return true;
  }
  return false;
}

export async function getSavedContentPlanPostImage(
  accountName: string,
  post: GeneratedPostContent
): Promise<string | null> {
  const map = await readMap();
  return map[makeKey(accountName, post)] ?? null;
}

export async function setSavedContentPlanPostImage(
  accountName: string,
  post: GeneratedPostContent,
  imageUrl: string
): Promise<boolean> {
  if (typeof imageUrl !== "string" || imageUrl.trim().length === 0) return false;
  const map = await readMap();
  const key = makeKey(accountName, post);
  map[key] = imageUrl.trim();
  return await writeMapWithRecovery(map, key);
}

export async function removeSavedContentPlanPostImage(
  accountName: string,
  post: GeneratedPostContent
): Promise<boolean> {
  const key = makeKey(accountName, post);
  const map = await readMap();
  if (!(key in map)) return true;
  delete map[key];
  return await writeMap(map);
}

