import type { ContentLabIdea, GeneratedPostContent } from "@/app/analytics/[accountName]/data.mock";
import { ideaFingerprint } from "@/lib/saved-content-lab-ideas";
import { emitStorageChange, getKvValue, setKvValue } from "@/lib/browser-db";

const STORAGE_KEY = "brandgram-content-lab-generated-post-by-idea";
const IMAGE_STORAGE_KEY = "brandgram-content-lab-generated-image-by-idea";
type CachedGeneratedPostRecord = GeneratedPostContent & { imageUrl?: string };

function isValidGeneratedPostContent(data: unknown): data is GeneratedPostContent {
  if (!data || typeof data !== "object") return false;
  const o = data as GeneratedPostContent;
  return (
    typeof o.caption === "string" &&
    Array.isArray(o.hashtags) &&
    o.hashtags.length > 0 &&
    o.hashtags.every((t) => typeof t === "string") &&
    typeof o.imagePrompt === "string" &&
    typeof o.strategyNote === "string"
  );
}

async function readMap(): Promise<Record<string, CachedGeneratedPostRecord>> {
  try {
    const raw = await getKvValue<string>(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, CachedGeneratedPostRecord> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (isValidGeneratedPostContent(v)) {
        const row = v as CachedGeneratedPostRecord;
        out[k] =
          typeof row.imageUrl === "string" && row.imageUrl.trim().length > 0
            ? { ...row, imageUrl: row.imageUrl }
            : { ...row };
      }
    }
    return out;
  } catch {
    return {};
  }
}

async function writeMap(map: Record<string, CachedGeneratedPostRecord>) {
  try {
    await setKvValue(STORAGE_KEY, JSON.stringify(map));
    emitStorageChange("generated-post-cache-changed");
  } catch {
    // quota / private mode
  }
}

async function readImageMap(): Promise<Record<string, string>> {
  try {
    const raw = await getKvValue<string>(IMAGE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "string" && v.trim().length > 0) {
        out[k] = v;
      }
    }
    return out;
  } catch {
    return {};
  }
}

async function writeImageMap(map: Record<string, string>) {
  try {
    await setKvValue(IMAGE_STORAGE_KEY, JSON.stringify(map));
    emitStorageChange("generated-image-cache-changed");
  } catch {
    // quota / private mode
  }
}

/** Full post JSON for this account + idea, if the user already generated it in Content Lab. */
export function getCachedGeneratedPostForIdea(
  accountName: string,
  idea: ContentLabIdea
): Promise<GeneratedPostContent | null> {
  const fp = ideaFingerprint(accountName, idea);
  return readMap().then((map) => {
    const hit = map[fp];
    return hit && isValidGeneratedPostContent(hit) ? hit : null;
  });
}

export async function setCachedGeneratedPostForIdea(
  accountName: string,
  idea: ContentLabIdea,
  content: GeneratedPostContent
): Promise<void> {
  if (!isValidGeneratedPostContent(content)) return;
  const fp = ideaFingerprint(accountName, idea);
  const map = await readMap();
  const imageMap = await readImageMap();
  const prevImage = map[fp]?.imageUrl ?? imageMap[fp];
  map[fp] =
    typeof prevImage === "string" && prevImage.trim().length > 0
      ? { ...content, imageUrl: prevImage }
      : { ...content };
  await writeMap(map);
}

export async function getCachedGeneratedImageForIdea(
  accountName: string,
  idea: ContentLabIdea
): Promise<string | null> {
  const fp = ideaFingerprint(accountName, idea);
  const imageMapHit = (await readImageMap())[fp];
  if (typeof imageMapHit === "string" && imageMapHit.trim().length > 0) {
    return imageMapHit;
  }
  const postMapHit = (await readMap())[fp]?.imageUrl;
  return typeof postMapHit === "string" && postMapHit.trim().length > 0 ? postMapHit : null;
}

export async function setCachedGeneratedImageForIdea(
  accountName: string,
  idea: ContentLabIdea,
  imageUrl: string
): Promise<void> {
  if (typeof imageUrl !== "string" || imageUrl.trim().length === 0) return;
  const fp = ideaFingerprint(accountName, idea);
  const normalizedImageUrl = imageUrl.trim();
  const map = await readImageMap();
  map[fp] = normalizedImageUrl;
  await writeImageMap(map);
  const postMap = await readMap();
  const post = postMap[fp];
  if (post && isValidGeneratedPostContent(post)) {
    postMap[fp] = { ...post, imageUrl: normalizedImageUrl };
    await writeMap(postMap);
  }
}
