"use client";

import { emitStorageChange, getKvValue, setKvValue } from "@/lib/browser-db";

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

async function writeAll(items: SavedAccount[]) {
  await setKvValue(STORAGE_KEY, JSON.stringify(items));
  emitStorageChange("saved-accounts-changed");
}

export async function listSavedAccounts(): Promise<SavedAccount[]> {
  const raw = await getKvValue<string>(STORAGE_KEY);
  return parseStored(raw).sort((a, b) => b.savedAt - a.savedAt);
}

export async function addSavedAccount(accountName: string): Promise<{ added: boolean }> {
  const normalized = normalizeAccountName(accountName);
  if (!normalized) return { added: false };

  const existing = await listSavedAccounts();
  if (existing.some((row) => normalizeAccountName(row.accountName) === normalized)) {
    return { added: false };
  }

  const row: SavedAccount = {
    id: crypto.randomUUID(),
    accountName: normalized,
    savedAt: Date.now(),
  };

  await writeAll([row, ...existing]);
  return { added: true };
}

export async function removeSavedAccount(id: string): Promise<void> {
  const accounts = await listSavedAccounts();
  await writeAll(accounts.filter((row) => row.id !== id));
}

export async function isAccountSaved(accountName: string): Promise<boolean> {
  const normalized = normalizeAccountName(accountName);
  if (!normalized) return false;
  const accounts = await listSavedAccounts();
  return accounts.some((row) => normalizeAccountName(row.accountName) === normalized);
}
