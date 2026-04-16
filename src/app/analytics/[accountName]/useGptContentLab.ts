import { ContentLabResponse } from "./data.mock";
import { getKvValue, setKvValue } from "@/lib/browser-db";

type ContentLabRequest = {
  instagramJson: string;
  analyticsJson: string;
  /**
   * Must match the route segment and other keys: `${accountKey}-igdata`, `${accountKey}-gpt-analytics`.
   * Ideas are stored at `${accountKey}-content-lab-ideas`.
   */
  accountKey: string;
  /** If present and different from accountKey, we also try this key when reading old caches. */
  legacyCacheKey?: string | null;
};

export const contentLabIdeasStorageKey = (accountKey: string) =>
  `${accountKey}-content-lab-ideas`;

export function isValidContentLabResponse(data: unknown): data is ContentLabResponse {
  if (!data || typeof data !== "object" || !("ideas" in (data as object))) return false;
  const ideas = (data as ContentLabResponse).ideas;
  if (!Array.isArray(ideas) || ideas.length !== 5) return false;
  return ideas.every(
    (i) =>
      typeof i?.type === "string" &&
      typeof i?.color === "string" &&
      typeof i?.title === "string" &&
      typeof i?.hook === "string"
  );
}

async function readIdeasFromStorageKey(accountKey: string): Promise<ContentLabResponse | null> {
  try {
    const raw = await getKvValue<string>(contentLabIdeasStorageKey(accountKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return isValidContentLabResponse(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Read cached post ideas for an account from localStorage (browser only). */
export async function getCachedContentLabIdeas(
  accountKey: string,
  legacyCacheKey?: string | null
): Promise<ContentLabResponse | null> {
  if (typeof window === "undefined" || !accountKey.trim()) return null;
  const primary = await readIdeasFromStorageKey(accountKey);
  if (primary) return primary;
  if (legacyCacheKey?.trim() && legacyCacheKey !== accountKey) {
    return await readIdeasFromStorageKey(legacyCacheKey);
  }
  return null;
}

async function writeCachedIdeas(accountKey: string, response: ContentLabResponse) {
  try {
    await setKvValue(contentLabIdeasStorageKey(accountKey), JSON.stringify(response));
  } catch {
    // quota / private mode
  }
}

const useGptContentLab = async ({
  instagramJson,
  analyticsJson,
  accountKey,
  legacyCacheKey,
}: ContentLabRequest): Promise<ContentLabResponse | null> => {
  const cached = await getCachedContentLabIdeas(accountKey, legacyCacheKey);
  if (cached) {
    if (!(await readIdeasFromStorageKey(accountKey)) && legacyCacheKey?.trim()) {
      await writeCachedIdeas(accountKey, cached);
    }
    return cached;
  }

  try {
    const res = await fetch("/api/use-gpt-content-lab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instagramJson, analyticsJson }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (!isValidContentLabResponse(data)) return null;

    await writeCachedIdeas(accountKey, data);
    return data;
  } catch (error) {
    console.error("Content Lab request failed:", error);
    return null;
  }
};

export default useGptContentLab;
