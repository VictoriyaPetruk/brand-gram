import type { ContentLabIdea, GeneratedPostContent } from "@/app/analytics/[accountName]/data.mock";
import { ideaFingerprint } from "@/lib/saved-content-lab-ideas";

const STORAGE_KEY = "brandgram-content-lab-generated-post-by-idea";
const IMAGE_STORAGE_KEY = "brandgram-content-lab-generated-image-by-idea";

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

function readMap(): Record<string, GeneratedPostContent> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, GeneratedPostContent> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (isValidGeneratedPostContent(v)) {
        out[k] = v;
      }
    }
    return out;
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, GeneratedPostContent>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // quota / private mode
  }
}

function readImageMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(IMAGE_STORAGE_KEY);
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

function writeImageMap(map: Record<string, string>) {
  try {
    localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // quota / private mode
  }
}

/** Full post JSON for this account + idea, if the user already generated it in Content Lab. */
export function getCachedGeneratedPostForIdea(
  accountName: string,
  idea: ContentLabIdea
): GeneratedPostContent | null {
  const fp = ideaFingerprint(accountName, idea);
  const map = readMap();
  const hit = map[fp];
  return hit && isValidGeneratedPostContent(hit) ? hit : null;
}

export function setCachedGeneratedPostForIdea(
  accountName: string,
  idea: ContentLabIdea,
  content: GeneratedPostContent
): void {
  if (!isValidGeneratedPostContent(content)) return;
  const fp = ideaFingerprint(accountName, idea);
  const map = readMap();
  map[fp] = content;
  writeMap(map);
}

export function getCachedGeneratedImageForIdea(accountName: string, idea: ContentLabIdea): string | null {
  const fp = ideaFingerprint(accountName, idea);
  const map = readImageMap();
  const hit = map[fp];
  return typeof hit === "string" && hit.trim().length > 0 ? hit : null;
}

export function setCachedGeneratedImageForIdea(
  accountName: string,
  idea: ContentLabIdea,
  imageUrl: string
): void {
  if (typeof imageUrl !== "string" || imageUrl.trim().length === 0) return;
  const fp = ideaFingerprint(accountName, idea);
  const map = readImageMap();
  map[fp] = imageUrl;
  writeImageMap(map);
}
