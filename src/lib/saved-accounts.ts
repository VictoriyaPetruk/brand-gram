"use client";

const STORAGE_KEY = "saved-instagram-accounts-v1";

export type SavedAccount = {
  id: string;
  accountName: string;
  savedAt: number;
};

function normalizeAccountName(value: string): string {
  return value.trim().toLowerCase().replace(/^@/, "");
}

function parseStored(raw: string | null): SavedAccount[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(
      (row): row is SavedAccount =>
        typeof row === "object" &&
        row !== null &&
        typeof (row as SavedAccount).id === "string" &&
        typeof (row as SavedAccount).accountName === "string" &&
        typeof (row as SavedAccount).savedAt === "number"
    );
  } catch {
    return [];
  }
}

function writeAll(items: SavedAccount[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listSavedAccounts(): SavedAccount[] {
  if (typeof window === "undefined") return [];
  return parseStored(localStorage.getItem(STORAGE_KEY)).sort((a, b) => b.savedAt - a.savedAt);
}

export function addSavedAccount(accountName: string): { added: boolean } {
  const normalized = normalizeAccountName(accountName);
  if (!normalized) return { added: false };

  const existing = listSavedAccounts();
  if (existing.some((row) => normalizeAccountName(row.accountName) === normalized)) {
    return { added: false };
  }

  const row: SavedAccount = {
    id: crypto.randomUUID(),
    accountName: normalized,
    savedAt: Date.now(),
  };

  writeAll([row, ...existing]);
  return { added: true };
}

export function removeSavedAccount(id: string): void {
  writeAll(listSavedAccounts().filter((row) => row.id !== id));
}

export function isAccountSaved(accountName: string): boolean {
  const normalized = normalizeAccountName(accountName);
  if (!normalized) return false;
  return listSavedAccounts().some((row) => normalizeAccountName(row.accountName) === normalized);
}
