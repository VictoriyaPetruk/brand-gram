"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import Header from "@/components/header";
import {
  listSavedContentPlanPosts,
  markSavedContentPlanPostPosted,
  removeSavedContentPlanPost,
  type SavedContentPlanPost,
} from "@/lib/saved-content-plan-posts";

function formatHashtag(tag: string) {
  const t = tag.trim();
  return t.startsWith("#") ? t : `#${t}`;
}

export default function SavedPostsPage() {
  const [items, setItems] = useState<SavedContentPlanPost[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setItems(listSavedContentPlanPosts());
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);
  }, [refresh]);

  const handleRemove = (id: string) => {
    removeSavedContentPlanPost(id);
    refresh();
  };

  const handleMarkAsPosted = (id: string, isPosted: boolean) => {
    markSavedContentPlanPostPosted(id, !isPosted);
    refresh();
  };

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-5rem)] bg-[#f5f6fb] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-[1280px]">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#111b38]">Saved posts</h1>
          <p className="mt-2 text-base sm:text-lg text-[#6b7280]">
            Full posts you saved from Content Lab — stored only in this browser.
          </p>

          {!hydrated && (
            <div className="mt-10 animate-pulse space-y-4">
              <div className="h-64 rounded-3xl bg-muted" />
              <div className="h-64 rounded-3xl bg-muted" />
            </div>
          )}

          {hydrated && items.length === 0 && (
            <div className="mt-8 sm:mt-10 rounded-3xl border border-[#eceff5] bg-white p-6 sm:p-10 text-center shadow-[0_3px_14px_rgba(15,23,42,0.05)]">
              <p className="text-muted-foreground">No saved posts yet.</p>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                In Content Lab, generate a post and tap{" "}
                <span className="font-semibold text-foreground">Save to Content Plan</span>.
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
            <div className="mt-6 sm:mt-8 flex flex-col gap-8">
              {items.map((row) => (
                <article
                  key={row.id}
                  className="overflow-hidden rounded-3xl border border-[#eceff5] bg-white shadow-[0_3px_14px_rgba(15,23,42,0.05)]"
                >
                  <div className="grid gap-0 lg:grid-cols-[minmax(0,320px)_1fr]">
                    <div className="relative aspect-[1080/1350] max-h-[420px] bg-[#111b38] lg:max-h-none">
                      <button
                        type="button"
                        onClick={() => handleRemove(row.id)}
                        aria-label="Delete this saved post"
                        className="absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-destructive hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                      {row.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- arbitrary saved URLs
                        <img src={row.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 p-6 text-center text-sm text-white/70">
                          <span className="text-3xl" aria-hidden>
                            🖼️
                          </span>
                          <p>No image was saved for this post.</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-4 p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          {row.ideaContext && (
                            <span
                              className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                              style={{
                                background: `${row.ideaContext.color}22`,
                                color: row.ideaContext.color,
                              }}
                            >
                              {row.ideaContext.type}
                            </span>
                          )}
                          {row.ideaContext && (
                            <>
                              <h2 className="mt-3 text-xl font-semibold text-foreground">{row.ideaContext.title}</h2>
                              <p className="mt-2 text-sm text-muted-foreground">{row.ideaContext.hook}</p>
                            </>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            @{row.accountName} · saved {new Date(row.savedAt).toLocaleString()}
                          </p>
                          {row.postedAt && (
                            <p className="mt-1 text-xs font-medium text-emerald-700">
                              Posted {new Date(row.postedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleMarkAsPosted(row.id, Boolean(row.postedAt))}
                          className={`inline-flex shrink-0 items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                            row.postedAt
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "border-border bg-background text-foreground hover:bg-muted"
                          }`}
                        >
                          {row.postedAt ? "Posted ✓" : "Mark as posted"}
                        </button>
                      </div>

                      <div className="rounded-2xl border border-[#eceff5] bg-[#f9fafb] p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          AI caption
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{row.post.caption}</p>
                      </div>

                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Hashtags
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {row.post.hashtags.map((tag) => (
                            <span
                              key={`${row.id}-${tag}`}
                              className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                            >
                              {formatHashtag(tag)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#eceff5] p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Why this works
                        </div>
                        <p className="mt-2 text-sm text-foreground">{row.post.strategyNote}</p>
                      </div>

                      <div className="rounded-2xl border border-[#eceff5] p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Image generation prompt
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{row.post.imagePrompt}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/analytics/${encodeURIComponent(row.accountName)}/flow`}
                          className="inline-flex min-w-[8rem] flex-1 items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                          Open Content Lab
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleRemove(row.id)}
                          aria-label="Delete this saved post"
                          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                          Delete
                        </button>
                      </div>
                    </div>
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
