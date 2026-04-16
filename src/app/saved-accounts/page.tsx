"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookmarkX } from "lucide-react";
import Header from "@/components/header";
import { listSavedAccounts, removeSavedAccount, type SavedAccount } from "@/lib/saved-accounts";
import { subscribeStorageChange } from "@/lib/browser-db";
import { resolveCachedAccountData } from "@/lib/instagram-cache";

export default function SavedAccountsPage() {
  const [items, setItems] = useState<SavedAccount[]>([]);
  const [accountImages, setAccountImages] = useState<Record<string, string | null>>({});
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    setItems(await listSavedAccounts());
  }, []);

  useEffect(() => {
    void refresh();
    setHydrated(true);
  }, [refresh]);

  useEffect(() => {
    void (async () => {
      const next: Record<string, string | null> = {};
      for (const row of items) {
        const cached = await resolveCachedAccountData(row.accountName);
        next[row.id] = cached?.igData?.profile_picture_url ?? null;
      }
      setAccountImages(next);
    })();
  }, [items]);

  useEffect(() => {
    const handleFocus = () => void refresh();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };
    const unsubscribe = subscribeStorageChange((event) => {
      if (event === "saved-accounts-changed") {
        void refresh();
      }
    });

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      unsubscribe();
    };
  }, [refresh]);

  const handleRemove = async (id: string) => {
    await removeSavedAccount(id);
    await refresh();
  };

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-5rem)] bg-[#f5f6fb] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-[1280px]">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#111b38]">Saved accounts</h1>
          <p className="mt-2 text-base sm:text-lg text-[#6b7280]">Quickly reopen analytics pages for your saved Instagram accounts.</p>

          {!hydrated && (
            <div className="mt-10 animate-pulse space-y-4">
              <div className="h-28 rounded-3xl bg-muted" />
              <div className="h-28 rounded-3xl bg-muted" />
            </div>
          )}

          {hydrated && items.length === 0 && (
            <div className="mt-8 sm:mt-10 rounded-3xl border border-[#eceff5] bg-white p-6 sm:p-10 text-center shadow-[0_3px_14px_rgba(15,23,42,0.05)]">
              <p className="text-muted-foreground">No saved accounts yet.</p>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                Open an analytics page and click <span className="font-semibold text-foreground">Save account</span>.
              </p>
              <Link
                href="/"
                className="mt-6 inline-block rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-opacity hover:opacity-90"
              >
                Go home
              </Link>
            </div>
          )}

          {hydrated && items.length > 0 && (
            <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((row) => (
                <article
                  key={row.id}
                  className="rounded-3xl border border-[#eceff5] bg-white p-5 shadow-[0_3px_14px_rgba(15,23,42,0.05)]"
                >
                  <div className="mb-4 flex items-center gap-3">
                    {accountImages[row.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element -- user-profile image URLs are external
                      <img
                        src={accountImages[row.id] ?? ""}
                        alt={`@${row.accountName} profile`}
                        className="h-12 w-12 rounded-full border border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground">
                        {row.accountName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-foreground">@{row.accountName}</h3>
                  </div>
                  <div className="text-xs text-muted-foreground">Saved {new Date(row.savedAt).toLocaleString()}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/analytics/${encodeURIComponent(row.accountName)}`}
                      className="inline-flex min-w-[8rem] flex-1 items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      Open Analytics
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(row.id)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <BookmarkX className="h-4 w-4" aria-hidden />
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
