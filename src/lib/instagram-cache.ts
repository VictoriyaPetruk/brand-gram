"use client";

import { BusinessDiscovery, GptAnalytics } from "@/app/analytics/[accountName]/data.mock";
import { getKvValue, listKvEntriesBySuffix, setKvValue } from "@/lib/browser-db";

type CachedAccountData = {
  accountKey: string;
  igData: BusinessDiscovery;
};

function normalizeAccountName(value: string): string {
  return value.trim().toLowerCase().replace(/^@/, "");
}

function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

function similarityScore(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

function parseCachedIgData(raw: string | null): BusinessDiscovery | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BusinessDiscovery;
  } catch {
    return null;
  }
}

export async function resolveCachedAccountData(accountName: string): Promise<CachedAccountData | null> {
  if (typeof window === "undefined") return null;

  const target = normalizeAccountName(accountName);
  const directKey = `${target}-igdata`;
  const directData = parseCachedIgData(await getKvValue<string>(directKey));
  if (directData) {
    return { accountKey: target, igData: directData };
  }

  let bestMatch: CachedAccountData | null = null;
  let bestScore = 0.75;

  const entries = await listKvEntriesBySuffix("-igdata");
  for (const entry of entries) {
    const key = entry.key;
    const accountKey = normalizeAccountName(key.slice(0, -"-igdata".length));
    const cachedData = parseCachedIgData(typeof entry.value === "string" ? entry.value : null);
    if (!cachedData) continue;

    const username = normalizeAccountName(cachedData.username ?? "");
    if (username === target || accountKey === target) {
      return { accountKey, igData: cachedData };
    }

    const score = Math.max(similarityScore(target, accountKey), similarityScore(target, username));
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { accountKey, igData: cachedData };
    }
  }

  return bestMatch;
}

export async function getCachedGptAnalytics(accountKey: string): Promise<GptAnalytics | null> {
  const raw = await getKvValue<string>(`${normalizeAccountName(accountKey)}-gpt-analytics`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GptAnalytics;
  } catch {
    return null;
  }
}

export async function setCachedIgData(accountKey: string, igData: BusinessDiscovery): Promise<void> {
  await setKvValue(`${normalizeAccountName(accountKey)}-igdata`, JSON.stringify(igData));
}

export async function setCachedGptAnalytics(accountKey: string, analytics: GptAnalytics): Promise<void> {
  await setKvValue(`${normalizeAccountName(accountKey)}-gpt-analytics`, JSON.stringify(analytics));
}
