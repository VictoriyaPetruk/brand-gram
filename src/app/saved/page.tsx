"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookmarkX } from "lucide-react";
import Header from "@/components/header";
import { listSavedIdeas, removeSavedIdea, type SavedPostIdea } from "@/lib/saved-content-lab-ideas";
import { subscribeStorageChange } from "@/lib/browser-db";

export default function SavedIdeasPage() {
  const [items, setItems] = useState<SavedPostIdea[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    setItems(await listSavedIdeas());
  }, []);

  useEffect(() => {
    void refresh();
    setHydrated(true);
  }, [refresh]);

  useEffect(() => {
    const handleFocus = () => void refresh();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };
    const unsubscribe = subscribeStorageChange((event) => {
      if (event === "saved-content-lab-ideas-changed") {
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
    await removeSavedIdea(id);
    await refresh();
  };

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-5rem)] bg-[#f5f6fb] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-[1280px]">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#111b38]">Saved ideas</h1>
          <p className="mt-2 text-base sm:text-lg text-[#6b7280]">
            Post ideas you bookmarked from Content Lab — stored only in this browser.
          </p>

          {!hydrated && (
            <div className="mt-10 animate-pulse space-y-4">
              <div className="h-44 rounded-3xl bg-muted" />
              <div className="h-44 rounded-3xl bg-muted" />
            </div>
          )}

          {hydrated && items.length === 0 && (
            <div className="mt-8 sm:mt-10 rounded-3xl border border-[#eceff5] bg-white p-6 sm:p-10 text-center shadow-[0_3px_14px_rgba(15,23,42,0.05)]">
              <p className="text-muted-foreground">No saved ideas yet.</p>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                Open an account&apos;s Content Lab and tap <span className="font-semibold text-foreground">Save</span> on a
                card.
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
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                      style={{ background: `${row.idea.color}22`, color: row.idea.color }}
                    >
                      {row.idea.type}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">@{row.accountName}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold leading-tight text-foreground">{row.idea.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{row.idea.hook}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Saved {new Date(row.savedAt).toLocaleString()}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/analytics/${encodeURIComponent(row.accountName)}/flow`}
                      className="inline-flex flex-1 min-w-[8rem] items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      Open Content Lab
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
