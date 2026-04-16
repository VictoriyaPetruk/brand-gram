'use client';

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";
import requestGptContentLab, {
  getCachedContentLabIdeas,
  isValidContentLabResponse,
} from "../useGptContentLab";
import {
  BusinessDiscovery,
  ContentLabIdea,
  GeneratedPostContent,
  GptAnalytics,
  MOCK_CONTENT_LAB_IDEAS,
} from "../data.mock";
import Header from "@/components/header";
import {
  getCachedGeneratedImageForIdea,
  getCachedGeneratedPostForIdea,
  setCachedGeneratedImageForIdea,
  setCachedGeneratedPostForIdea,
} from "@/lib/content-lab-generated-post-cache";
import { addSavedIdea, getSavedFingerprintSet, ideaFingerprint } from "@/lib/saved-content-lab-ideas";
import {
  findSavedContentPlanPostByContext,
  listSavedContentPlanPosts,
  upsertSavedContentPlanPost,
} from "@/lib/saved-content-plan-posts";
import { getCachedGptAnalytics, resolveCachedAccountData } from "@/lib/instagram-cache";

type PageProps = {
  params: Promise<{ accountName: string }>;
};

function formatHashtag(tag: string) {
  const t = tag.trim();
  return t.startsWith("#") ? t : `#${t}`;
}

function arePostsEqual(a: GeneratedPostContent, b: GeneratedPostContent): boolean {
  if (a.caption !== b.caption) return false;
  if (a.imagePrompt !== b.imagePrompt) return false;
  if (a.strategyNote !== b.strategyNote) return false;
  if (a.hashtags.length !== b.hashtags.length) return false;
  return a.hashtags.every((tag, idx) => tag === b.hashtags[idx]);
}

export default function ContentLabPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const genViewRef = useRef<HTMLDivElement>(null);
  const contentPlanSaveTimerRef = useRef<number | null>(null);
  const [igData, setIgData] = useState<BusinessDiscovery | null>(null);
  const [analyticsData, setAnalyticsData] = useState<GptAnalytics | null>(null);
  const [ideas, setIdeas] = useState<ContentLabIdea[]>([]);
  const [selectedIdeaIndex, setSelectedIdeaIndex] = useState<number | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedPostContent | null>(null);
  const [editableImagePrompt, setEditableImagePrompt] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isGeneratingPostContent, setIsGeneratingPostContent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [usingMockIdeas, setUsingMockIdeas] = useState(false);
  const [savedFingerprints, setSavedFingerprints] = useState<Set<string>>(() => new Set());
  const [contentPlanJustSaved, setContentPlanJustSaved] = useState(false);

  const generateIdeas = async (contextIgData?: BusinessDiscovery, contextAnalyticsData?: GptAnalytics) => {
    const sourceIgData = contextIgData ?? igData;
    const sourceAnalyticsData = contextAnalyticsData ?? analyticsData;
    if (!sourceIgData || !sourceAnalyticsData) return;

    setIsGeneratingIdeas(true);
    setErrorMessage("");
    setGeneratedContent(null);
    setGeneratedImageUrl(null);
    setSelectedIdeaIndex(null);
    setUsingMockIdeas(false);

    const routeAccount = resolvedParams.accountName;
    const igUsername = sourceIgData.username?.trim() || null;
    const response = await requestGptContentLab({
      instagramJson: JSON.stringify(sourceIgData),
      analyticsJson: JSON.stringify(sourceAnalyticsData),
      accountKey: routeAccount,
      legacyCacheKey: igUsername && igUsername !== routeAccount ? igUsername : null,
    });

    setIsGeneratingIdeas(false);

    if (!response || !isValidContentLabResponse(response)) {
      setIdeas(MOCK_CONTENT_LAB_IDEAS);
      setUsingMockIdeas(true);
      setErrorMessage("Could not load AI ideas. Showing preview cards - try again after checking your API key.");
      return;
    }

    setIdeas(response.ideas);
  };

  useEffect(() => {
    const loadContext = async () => {
      setIsLoadingContext(true);
      setErrorMessage("");

      const cachedAccount = resolveCachedAccountData(resolvedParams.accountName);
      const parsedIgData = cachedAccount?.igData ?? null;
      const parsedAnalyticsData = cachedAccount ? getCachedGptAnalytics(cachedAccount.accountKey) : null;

      if (!parsedIgData || !parsedAnalyticsData) {
        setIdeas(MOCK_CONTENT_LAB_IDEAS);
        setUsingMockIdeas(true);
        setErrorMessage("No saved analytics for this account. Open Analytics first, or use preview ideas below.");
        setIsLoadingContext(false);
        return;
      }

      try {
        setIgData(parsedIgData);
        setAnalyticsData(parsedAnalyticsData);

        const routeAccount = cachedAccount?.accountKey ?? resolvedParams.accountName;
        const igUsername = parsedIgData.username?.trim() || null;
        const cachedIdeas = getCachedContentLabIdeas(
          routeAccount,
          igUsername && igUsername !== routeAccount ? igUsername : null
        );
        if (cachedIdeas) {
          setIdeas(cachedIdeas.ideas);
          setIsLoadingContext(false);
          return;
        }

        await generateIdeas(parsedIgData, parsedAnalyticsData);
      } catch (error) {
        console.error("Failed to parse analytics context:", error);
        setIdeas(MOCK_CONTENT_LAB_IDEAS);
        setUsingMockIdeas(true);
        setErrorMessage("Saved analytics data is invalid. Showing preview ideas.");
      } finally {
        setIsLoadingContext(false);
      }
    };

    loadContext();
  }, [resolvedParams.accountName]);

  useEffect(() => {
    setSavedFingerprints(getSavedFingerprintSet());
  }, [resolvedParams.accountName, ideas]);

  useEffect(() => {
    return () => {
      if (contentPlanSaveTimerRef.current !== null) {
        window.clearTimeout(contentPlanSaveTimerRef.current);
      }
    };
  }, []);

  const generateContent = async (ideaIndex: number, options?: { bypassCache?: boolean }) => {
    const idea = ideas[ideaIndex];
    if (!idea) return;
    if (!igData || !analyticsData) {
      setErrorMessage("No analytics context loaded. Open Analytics for this account first.");
      return;
    }

    setSelectedIdeaIndex(ideaIndex);
    setErrorMessage("");
    setGeneratedImageUrl(null);
    setGeneratedContent(null);

    if (!options?.bypassCache) {
      const cached = getCachedGeneratedPostForIdea(resolvedParams.accountName, idea);
      if (cached) {
        setGeneratedContent(cached);
        let cachedImage = getCachedGeneratedImageForIdea(resolvedParams.accountName, idea);
        if (!cachedImage) {
          const normalizedAccount = resolvedParams.accountName.trim().toLowerCase();
          const rows = listSavedContentPlanPosts().filter(
            (row) => row.imageUrl && row.accountName.trim().toLowerCase() === normalizedAccount
          );
          const savedMatch =
            rows.find((row) => {
              if (!row.ideaContext) return false;
              return (
                row.ideaContext.type === idea.type &&
                row.ideaContext.title === idea.title &&
                row.ideaContext.hook === idea.hook
              );
            }) ??
            rows.find(
              (row) =>
                row.post.imagePrompt === cached.imagePrompt &&
                row.post.caption === cached.caption &&
                row.post.strategyNote === cached.strategyNote
            ) ??
            rows.find((row) => row.post.imagePrompt === cached.imagePrompt);
          if (savedMatch?.imageUrl) {
            cachedImage = savedMatch.imageUrl;
            setCachedGeneratedImageForIdea(resolvedParams.accountName, idea, savedMatch.imageUrl);
          }
        }
        setGeneratedImageUrl(cachedImage);
        return;
      }
    }

    setIsGeneratingPostContent(true);

    const contextPromptJson = JSON.stringify({
      instagram: igData,
      analytics: analyticsData,
    });
    const postText = [`Type: ${idea.type}`, `Title: ${idea.title}`, `Hook: ${idea.hook}`].join("\n");

    try {
      const res = await fetch("/api/use-gpt-post-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contextPromptJson, postText }),
      });
      const data = (await res.json()) as GeneratedPostContent | { error?: string; details?: string };

      if (!res.ok || !data || typeof data !== "object" || "error" in data) {
        const msg =
          typeof data === "object" && data && "error" in data && typeof data.error === "string"
            ? data.error
            : "Could not generate content. Try again.";
        setErrorMessage(msg);
        setGeneratedContent(null);
        setSelectedIdeaIndex(null);
        return;
      }

      const post = data as GeneratedPostContent;
      setCachedGeneratedPostForIdea(resolvedParams.accountName, idea, post);
      setGeneratedContent(post);
    } catch (e) {
      console.error(e);
      setErrorMessage("Could not generate content. Check your connection and API key.");
      setGeneratedContent(null);
      setSelectedIdeaIndex(null);
    } finally {
      setIsGeneratingPostContent(false);
    }
  };

  const generateImage = async () => {
    if (!generatedContent || selectedIdeaIndex === null) return;
    const imagePrompt = editableImagePrompt.trim();
    if (!imagePrompt) {
      setErrorMessage("Image prompt cannot be empty.");
      return;
    }
    setIsGeneratingImage(true);
    setGeneratedImageUrl(null);
    setErrorMessage("");

    try {
      const res = await fetch("/api/use-gpt-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePrompt }),
      });
      const data = (await res.json()) as {
        imageDataUrl?: string;
        imageUrl?: string;
        error?: string;
      };

      if (!res.ok) {
        setErrorMessage(data?.error || "Could not generate image. Try again.");
        return;
      }

      const nextImageUrl = data?.imageDataUrl || data?.imageUrl || "";
      if (!nextImageUrl) {
        setErrorMessage("Could not generate image. Try again.");
        return;
      }

      setGeneratedImageUrl(nextImageUrl);
      const selectedIdea = ideas[selectedIdeaIndex];
      if (selectedIdea) {
        setCachedGeneratedImageForIdea(resolvedParams.accountName, selectedIdea, nextImageUrl);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not generate image. Check your connection and API key.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const downloadGeneratedImage = () => {
    if (!generatedImageUrl) return;

    const link = document.createElement("a");
    link.href = generatedImageUrl;
    link.download = `content-lab-${resolvedParams.accountName}-${Date.now()}.png`;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const showGenPanel =
    selectedIdeaIndex !== null && (generatedContent !== null || isGeneratingPostContent);
  const showContentSkeleton = isGeneratingPostContent && generatedContent === null;
  const selectedIdea = selectedIdeaIndex !== null ? ideas[selectedIdeaIndex] ?? null : null;
  const matchingSavedContentPlanPost = useMemo(() => {
    if (!selectedIdea) return null;
    return findSavedContentPlanPostByContext(resolvedParams.accountName, {
      type: selectedIdea.type,
      title: selectedIdea.title,
      hook: selectedIdea.hook,
      color: selectedIdea.color,
    });
  }, [resolvedParams.accountName, selectedIdea]);
  const isCurrentVersionSaved = Boolean(
    generatedContent &&
      matchingSavedContentPlanPost &&
      arePostsEqual(matchingSavedContentPlanPost.post, generatedContent) &&
      (matchingSavedContentPlanPost.imageUrl ?? null) === (generatedImageUrl ?? null)
  );
  const contentPlanButtonLabel = contentPlanJustSaved
    ? "✓ Saved"
    : isCurrentVersionSaved
      ? "Saved to Content Plan"
      : matchingSavedContentPlanPost
        ? "Update in Content Plan"
        : "📋 Save to Content Plan";

  useEffect(() => {
    if (selectedIdeaIndex === null) return;
    if (!isGeneratingPostContent && !generatedContent) return;
    let cancelled = false;
    const scrollToPreview = () => {
      if (cancelled) return;
      genViewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const t = window.setTimeout(() => {
      window.requestAnimationFrame(scrollToPreview);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [generatedContent, selectedIdeaIndex, isGeneratingPostContent]);

  useEffect(() => {
    setEditableImagePrompt(generatedContent?.imagePrompt ?? "");
  }, [generatedContent?.imagePrompt]);

  if (isLoadingContext) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-5rem)] bg-background px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-7xl animate-pulse space-y-4">
            <div className="h-10 w-56 rounded-xl bg-muted" />
            <div className="h-64 rounded-3xl bg-muted" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="h-44 rounded-3xl bg-muted" />
              <div className="h-44 rounded-3xl bg-muted" />
              <div className="h-44 rounded-3xl bg-muted" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-5rem)] bg-[#f5f6fb] px-4 py-6 sm:px-6 sm:py-8">
        {isGeneratingIdeas && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="rounded-2xl border border-border bg-card px-6 py-4 shadow-soft">
              <p className="text-sm font-semibold text-foreground">Generating post ideas...</p>
            </div>
          </div>
        )}
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={generatedContent || isGeneratingPostContent ? "#" : `/analytics/${resolvedParams.accountName}`}
              onClick={(event) => {
                if (generatedContent || isGeneratingPostContent) {
                  event.preventDefault();
                  setGeneratedContent(null);
                  setGeneratedImageUrl(null);
                  setSelectedIdeaIndex(null);
                }
              }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {"\u2190"}{" "}
              {generatedContent || isGeneratingPostContent ? "Back to Ideas" : "Back to Analysis"}
            </Link>
          </div>

          {errorMessage && ideas.length === 0 && (
            <div className="mt-8 rounded-2xl border border-[#eceff5] bg-white p-4 text-sm text-slate-600 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
              {errorMessage}
            </div>
          )}

          {ideas.length > 0 && (
            <div className="mt-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#111b38]">
                {"\u2728"} Content Lab
              </h1>
              <p className="mt-2 text-xl sm:text-2xl md:text-[32px] text-[#6b7280]">
                5 AI-crafted post ideas based on your real audience data
                {usingMockIdeas && (
                  <span className="ml-2 text-lg font-semibold text-amber-700">(preview)</span>
                )}
              </p>
              {errorMessage && (
                <div className="mt-5 rounded-2xl border border-[#eceff5] bg-white p-4 text-sm text-slate-600 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                  {errorMessage}
                </div>
              )}

              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                {ideas.map((idea, index) => {
                  const ideaFp = ideaFingerprint(resolvedParams.accountName, idea);
                  const isIdeaSaved = savedFingerprints.has(ideaFp);
                  const hasGeneratedContent = Boolean(
                    getCachedGeneratedPostForIdea(resolvedParams.accountName, idea)
                  );
                  return (
                  <article
                    key={`${idea.title}-${index}`}
                    className={`rounded-3xl border bg-white p-5 shadow-[0_3px_14px_rgba(15,23,42,0.05)] transition-shadow ${
                      selectedIdeaIndex === index
                        ? "border-transparent shadow-[0_0_0_4px_rgba(181,121,207,0.18),0_4px_32px_rgba(15,23,42,0.09)]"
                        : "border-[#eceff5]"
                    }`}
                  >
                    <span
                      className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                      style={{ background: `${idea.color}22`, color: idea.color }}
                    >
                      {idea.type}
                    </span>
                    <h3 className="mt-4 text-xl font-semibold leading-tight text-foreground">{idea.title}</h3>
                    <p className="mt-3 min-h-16 text-sm text-muted-foreground">{idea.hook}</p>
                    <div className="mt-6 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const result = addSavedIdea(resolvedParams.accountName, idea);
                          if (result.ok) {
                            setSavedFingerprints((prev) => new Set(prev).add(ideaFp));
                          }
                        }}
                        disabled={isIdeaSaved}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isIdeaSaved ? (
                          <>
                            <BookmarkCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                            Saved
                          </>
                        ) : (
                          <>
                            <Bookmark className="h-4 w-4 shrink-0" aria-hidden />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => void generateContent(index)}
                        disabled={isGeneratingPostContent}
                        className="w-full rounded-full bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {"\uD83C\uDFA8"} {hasGeneratedContent ? "Open Content" : "Generate Content"}
                      </button>
                    </div>
                  </article>
                  );
                })}
              </div>

              {showGenPanel && (
                <div ref={genViewRef} className="gen-view on" id="genView">
                  <div className="gen-left">
                    <div className="gen-left-h">
                      {"\uD83D\uDDBC\uFE0F"} AI Visual
                    </div>
                    {showContentSkeleton ? (
                      <>
                        <div className="img-ph relative overflow-hidden" aria-busy="true">
                          <div className="img-shimmer" />
                          <div className="relative z-[1] flex h-full min-h-[260px] w-full flex-col items-center justify-center gap-3 px-8">
                            <div className="h-[38%] min-h-[120px] w-[55%] max-w-[220px] rounded-xl bg-white/10 animate-pulse" />
                            <div className="h-2.5 w-48 max-w-[85%] rounded-md bg-white/15 animate-pulse" />
                            <div className="h-2 w-32 max-w-[60%] rounded-md bg-white/10 animate-pulse" />
                          </div>
                        </div>
                        <button type="button" className="btn-regen" disabled>
                          {"\uD83D\uDDBC\uFE0F"} Generate image
                        </button>
                        <div className="gr-card">
                          <div className="gr-label">
                            {"\uD83E\uDD16"} Image Generation Prompt
                          </div>
                          <div className="space-y-2.5 pt-0.5" aria-hidden>
                            {[100, 92, 78, 65, 52].map((pct, i) => (
                              <div
                                key={i}
                                className="h-2.5 rounded-md bg-muted animate-pulse"
                                style={{ width: `${pct}%` }}
                              />
                            ))}
                          </div>
                        </div>
                        <button type="button" className="btn-regen" disabled>
                          {"\uD83D\uDD04"} Regenerate
                        </button>
                      </>
                    ) : generatedContent ? (
                      <>
                        <div
                          className={`img-ph${generatedImageUrl ? " has-image" : ""}`}
                          aria-busy={isGeneratingImage}
                        >
                          <div className="img-shimmer" />
                          <div className="img-inner">
                            <span className="img-em">
                              {isGeneratingImage ? "\u2728" : "\uD83C\uDFA8"}
                            </span>
                            <div className="img-lbl">
                              {isGeneratingImage
                                ? "Generating your visual…"
                                : "AI-Generated Visual Concept"}
                              <br />
                              <small>1080×1350px · Instagram Portrait</small>
                            </div>
                          </div>
                          {generatedImageUrl && (
                            <img
                              src={generatedImageUrl}
                              alt=""
                              className="gen-visual-img"
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          className="btn-regen"
                          onClick={() => void generateImage()}
                          disabled={isGeneratingImage}
                        >
                          {generatedImageUrl
                            ? "\uD83D\uDD04 Regenerate image"
                            : "\uD83D\uDDBC\uFE0F Generate image"}
                        </button>
                        <div className="gr-card">
                          <div className="gr-label">
                            {"\uD83E\uDD16"} Image Generation Prompt
                          </div>
                          <p className="mb-2 text-xs text-muted-foreground">
                            Edit this prompt before generating the image.
                          </p>
                          <textarea
                            id="genImgPrompt"
                            value={editableImagePrompt}
                            onChange={(event) => setEditableImagePrompt(event.target.value)}
                            onInput={(event) =>
                              setEditableImagePrompt((event.target as HTMLTextAreaElement).value)
                            }
                            onClick={(event) => event.stopPropagation()}
                            readOnly={false}
                            disabled={false}
                            tabIndex={0}
                            aria-label="Image generation prompt"
                            className=""
                            style={{
                              display: "block",
                              width: "100%",
                              minHeight: "180px",
                              resize: "vertical",
                              borderRadius: "12px",
                              border: "1px solid #dbe0ea",
                              background: "#ffffff",
                              padding: "12px 14px",
                              fontSize: "14px",
                              lineHeight: 1.6,
                              color: "#4a5568",
                              fontStyle: "normal",
                              cursor: "text",
                              pointerEvents: "auto",
                            }}
                            placeholder="Edit the image generation prompt before creating the visual..."
                          />
                        </div>
                        <button
                          type="button"
                          className="btn-regen disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => void generateContent(selectedIdeaIndex!, { bypassCache: true })}
                          disabled={isGeneratingPostContent}
                        >
                          {"\uD83D\uDD04"} Regenerate
                        </button>
                      </>
                    ) : null}
                  </div>
                  <div className="gen-right">
                    {showContentSkeleton ? (
                      <>
                        <div className="gr-card" style={{ flex: 2 }}>
                          <div className="gr-label">
                            {"\u270D\uFE0F"} AI Caption
                          </div>
                          <div className="space-y-2.5 pt-1" aria-hidden>
                            {[100, 100, 96, 88, 72, 100, 84, 40].map((pct, i) => (
                              <div
                                key={i}
                                className="h-2.5 rounded-md bg-muted animate-pulse"
                                style={{ width: `${pct}%` }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="gr-card" style={{ flex: 1.4 }}>
                          <div className="gr-label"># Optimized Hashtags</div>
                          <div className="ht-wrap gap-2">
                            {["w-20", "w-24", "w-16", "w-[4.5rem]", "w-24", "w-[5.5rem]", "w-20", "w-14"].map(
                              (w, i) => (
                                <div
                                  key={i}
                                  className={`h-6 ${w} rounded-md bg-muted animate-pulse`}
                                />
                              )
                            )}
                          </div>
                        </div>
                        <div className="gr-card" style={{ flex: 1.4 }}>
                          <div className="gr-label">
                            {"\uD83C\uDFAF"} Why This Works
                          </div>
                          <div className="space-y-2.5 pt-1" aria-hidden>
                            {[100, 95, 88, 70].map((pct, i) => (
                              <div
                                key={i}
                                className="h-2.5 rounded-md bg-muted animate-pulse"
                                style={{ width: `${pct}%` }}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    ) : generatedContent ? (
                      <>
                        <div className="gr-card" style={{ flex: 2 }}>
                          <div className="gr-label">
                            {"\u270D\uFE0F"} AI Caption
                          </div>
                          <div className="caption-t" id="genCaption">
                            {generatedContent.caption}
                          </div>
                        </div>
                        <div className="gr-card" style={{ flex: 1.4 }}>
                          <div className="gr-label"># Optimized Hashtags</div>
                          <div className="ht-wrap" id="genHashtags">
                            {generatedContent.hashtags.map((tag) => (
                              <div key={tag} className="ht">
                                {formatHashtag(tag)}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="gr-card" style={{ flex: 1.4 }}>
                          <div className="gr-label">
                            {"\uD83C\uDFAF"} Why This Works
                          </div>
                          <div className="strat-t" id="genStrategy">
                            {generatedContent.strategyNote}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                  <div className="export-row">
                    <button
                      type="button"
                      className="btn-exp pri disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={showContentSkeleton || !generatedImageUrl}
                      onClick={downloadGeneratedImage}
                    >
                      {"\u2B07"} Download 4K Assets
                    </button>
                    <button
                      type="button"
                      className="btn-exp sec disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={showContentSkeleton || !generatedContent || isCurrentVersionSaved}
                      onClick={() => {
                        if (!generatedContent || selectedIdeaIndex === null) return;
                        const idea = ideas[selectedIdeaIndex];
                        upsertSavedContentPlanPost({
                          accountName: resolvedParams.accountName,
                          post: generatedContent,
                          imageUrl: generatedImageUrl,
                          ideaContext: idea
                            ? {
                                type: idea.type,
                                title: idea.title,
                                hook: idea.hook,
                                color: idea.color,
                              }
                            : null,
                        });
                        setContentPlanJustSaved(true);
                        if (contentPlanSaveTimerRef.current !== null) {
                          window.clearTimeout(contentPlanSaveTimerRef.current);
                        }
                        contentPlanSaveTimerRef.current = window.setTimeout(() => {
                          contentPlanSaveTimerRef.current = null;
                          setContentPlanJustSaved(false);
                        }, 2000);
                      }}
                    >
                      {contentPlanButtonLabel}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
