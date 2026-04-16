"use client";

const DB_NAME = "brandgram-browser-db";
const DB_VERSION = 1;
const KV_STORE = "kv";
const MIGRATION_KEY = "__migration_v1_done__";

type KvRow = {
  key: string;
  value: unknown;
};

let dbPromise: Promise<IDBDatabase> | null = null;
let migrationPromise: Promise<void> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(KV_STORE)) {
        db.createObjectStore(KV_STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
  });
  return dbPromise;
}

function runTxn<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => Promise<T>
): Promise<T> {
  return openDb().then((db) => {
    const tx = db.transaction(KV_STORE, mode);
    const store = tx.objectStore(KV_STORE);
    return fn(store);
  });
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function isClient() {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

function shouldMigrateLocalStorageKey(key: string): boolean {
  return (
    key === "saved-instagram-accounts-v1" ||
    key === "brandgram-saved-content-lab-ideas" ||
    key === "brandgram-content-lab-generated-post-by-idea" ||
    key === "brandgram-content-lab-generated-image-by-idea" ||
    key === "brandgram-saved-content-plan-posts" ||
    key === "brandgram-saved-content-plan-image-by-account-post" ||
    key.endsWith("-igdata") ||
    key.endsWith("-gpt-analytics") ||
    key.endsWith("-links") ||
    key.endsWith("-content-lab-ideas")
  );
}

async function runOneTimeLocalStorageMigration() {
  if (!isClient()) return;
  const existingFlag = await runTxn("readonly", async (store) => {
    const row = await idbRequest(store.get(MIGRATION_KEY));
    if (!row || typeof row !== "object") return false;
    return Boolean((row as KvRow).value);
  });
  if (existingFlag) return;
  const keysToMigrate: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (shouldMigrateLocalStorageKey(key)) {
      keysToMigrate.push(key);
    }
  }
  if (keysToMigrate.length > 0) {
    await runTxn("readwrite", async (store) => {
      for (const key of keysToMigrate) {
        const raw = localStorage.getItem(key);
        if (raw == null) continue;
        await idbRequest(store.put({ key, value: raw } satisfies KvRow));
      }
      await idbRequest(store.put({ key: MIGRATION_KEY, value: true } satisfies KvRow));
    });
    return;
  }
  await runTxn("readwrite", async (store) => {
    await idbRequest(store.put({ key: MIGRATION_KEY, value: true } satisfies KvRow));
  });
}

async function ensureMigration() {
  if (!isClient()) return;
  if (!migrationPromise) {
    migrationPromise = runOneTimeLocalStorageMigration().catch(() => {
      migrationPromise = null;
    });
  }
  await migrationPromise;
}

export async function getKvValue<T = unknown>(key: string): Promise<T | null> {
  if (!isClient()) return null;
  await ensureMigration();
  return runTxn("readonly", async (store) => {
    const row = await idbRequest(store.get(key));
    if (!row || typeof row !== "object") return null;
    const typed = row as KvRow;
    return (typed.value as T) ?? null;
  });
}

export async function setKvValue<T = unknown>(key: string, value: T): Promise<void> {
  if (!isClient()) return;
  await ensureMigration();
  await runTxn("readwrite", async (store) => {
    await idbRequest(store.put({ key, value } satisfies KvRow));
  });
}

export async function removeKvValue(key: string): Promise<void> {
  if (!isClient()) return;
  await ensureMigration();
  await runTxn("readwrite", async (store) => {
    await idbRequest(store.delete(key));
  });
}

export async function listKvEntries(): Promise<Array<{ key: string; value: unknown }>> {
  if (!isClient()) return [];
  await ensureMigration();
  return runTxn("readonly", async (store) => {
    const rows = (await idbRequest(store.getAll())) as KvRow[];
    return rows.map((row) => ({ key: row.key, value: row.value }));
  });
}

export async function listKvEntriesByPrefix(
  prefix: string
): Promise<Array<{ key: string; value: unknown }>> {
  const entries = await listKvEntries();
  return entries.filter((entry) => entry.key.startsWith(prefix));
}

export async function listKvEntriesBySuffix(
  suffix: string
): Promise<Array<{ key: string; value: unknown }>> {
  const entries = await listKvEntries();
  return entries.filter((entry) => entry.key.endsWith(suffix));
}

const CHANNEL_NAME = "brandgram-storage-events";
let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (!isClient() || typeof BroadcastChannel === "undefined") return null;
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
  return channel;
}

export function emitStorageChange(event: string): void {
  const c = getChannel();
  c?.postMessage({ event, timestamp: Date.now() });
}

export function subscribeStorageChange(listener: (event: string) => void): () => void {
  const c = getChannel();
  if (!c) return () => undefined;
  const onMessage = (message: MessageEvent<{ event?: string }>) => {
    const event = message.data?.event;
    if (typeof event === "string" && event.trim().length > 0) {
      listener(event);
    }
  };
  c.addEventListener("message", onMessage);
  return () => c.removeEventListener("message", onMessage);
}
