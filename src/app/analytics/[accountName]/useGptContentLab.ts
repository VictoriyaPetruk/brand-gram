import { ContentLabResponse } from "./data.mock";

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

function readIdeasFromStorageKey(accountKey: string): ContentLabResponse | null {
  try {
    const raw = localStorage.getItem(contentLabIdeasStorageKey(accountKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return isValidContentLabResponse(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Read cached post ideas for an account from localStorage (browser only). */
export function getCachedContentLabIdeas(
  accountKey: string,
  legacyCacheKey?: string | null
): ContentLabResponse | null {
  if (typeof window === "undefined" || !accountKey.trim()) return null;
  const primary = readIdeasFromStorageKey(accountKey);
  if (primary) return primary;
  if (legacyCacheKey?.trim() && legacyCacheKey !== accountKey) {
    return readIdeasFromStorageKey(legacyCacheKey);
  }
  return null;
}

function writeCachedIdeas(accountKey: string, response: ContentLabResponse) {
  try {
    localStorage.setItem(contentLabIdeasStorageKey(accountKey), JSON.stringify(response));
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
  const cached = getCachedContentLabIdeas(accountKey, legacyCacheKey);
  if (cached) {
    if (!readIdeasFromStorageKey(accountKey) && legacyCacheKey?.trim()) {
      writeCachedIdeas(accountKey, cached);
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

    writeCachedIdeas(accountKey, data);
    return data;
  } catch (error) {
    console.error("Content Lab request failed:", error);
    return null;
  }
};

export default useGptContentLab;
