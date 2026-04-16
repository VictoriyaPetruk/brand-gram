import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GptAnalytics, MediaItem } from "./data.mock";

interface AnalyticsCardProps {
  gptAnalitics: GptAnalytics | null;
  bestPost: MediaItem | null;
  mediaPosts: MediaItem[];
  followersCount: number;
}
export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  gptAnalitics,
  bestPost,
  mediaPosts,
  followersCount,
}) => {
  const fallbackText = "Not enough data yet";

  const safeText = (value?: string | null) => {
    if (!value) return fallbackText;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallbackText;
  };

  const splitAudience = (audience?: string | null) => {
    if (!audience) return [];
    return audience
      .split(/[,/|;\n]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  const splitHashtags = (hashtags?: string | null) => {
    if (!hashtags) return [];
    return hashtags
      .split(/[,\s]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
  };

  const extractKeywords = (description?: string | null) => {
    if (!description) return [];
    const words = description
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 4);

    const uniqueWords = Array.from(new Set(words));
    return uniqueWords.slice(0, 5).map((word) => `#${word}`);
  };

  const audienceChips = splitAudience(gptAnalitics?.MainAudience);
  const trendTopics = splitHashtags(gptAnalitics?.Hashtag);
  const fallbackTopics = extractKeywords(gptAnalitics?.Description);
  const topics = trendTopics.length > 0 ? trendTopics.slice(0, 8) : fallbackTopics;
  const strategy = (gptAnalitics?.MarketingStrategy ?? []).filter((item) => item?.trim().length > 0);
  const postsWindow = mediaPosts.slice(0, 6).reverse();
  const engagementSeries = postsWindow.map((post, index) => {
    const totalEngagement = (post.like_count ?? 0) + (post.comments_count ?? 0);
    const rate = followersCount > 0 ? (totalEngagement / followersCount) * 100 : 0;
    return {
      label: `P${index + 1}`,
      value: Number(rate.toFixed(1)),
    };
  });

  const chartWidth = 420;
  const chartHeight = 120;
  const chartPadding = 14;
  const chartValues = engagementSeries.map((point) => point.value);
  const minValue = chartValues.length > 0 ? Math.min(...chartValues) : 0;
  const maxValue = chartValues.length > 0 ? Math.max(...chartValues) : 0;
  const valueRange = maxValue - minValue;
  const usableWidth = chartWidth - chartPadding * 2;
  const usableHeight = chartHeight - chartPadding * 2;

  const chartPoints = engagementSeries.map((point, index) => {
    const x =
      engagementSeries.length === 1
        ? chartWidth / 2
        : chartPadding + (index / (engagementSeries.length - 1)) * usableWidth;
    const normalizedValue = valueRange === 0 ? 0.5 : (point.value - minValue) / valueRange;
    const y = chartPadding + (1 - normalizedValue) * usableHeight;
    return { ...point, x, y };
  });
  const chartPath = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");

  const metricCards = [
    {
      title: "Engagement Rate",
      value: `${gptAnalitics?.AverageEngagementRate ?? 0}%`,
    },
    {
      title: "Avg Likes",
      value: `${gptAnalitics?.AveragePostLikes ?? 0}`,
    },
    {
      title: "Average Comments",
      value: `${gptAnalitics?.AveragePostComments ?? 0}`,
    },
  ];
  const icpCardGradients = [
    "border-[#8FA0F3] bg-brand-gradient from-[#6eb5ff] to-[#a287f4]",
    "border-[#8FA0F3] bg-brand-gradient from-[#6eb5ff] to-[#a287f4]",
    "border-[#8FA0F3] bg-brand-gradient from-[#6eb5ff] to-[#a287f4]",
  ];

  return (
    <Card className="w-full max-w-5xl rounded-3xl border border-border/50 shadow-soft">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gradient shadow-soft">
            <span className="text-xl">📈</span>
          </span>
          <span className="bg-brand-gradient bg-clip-text text-transparent">AI-Powered Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
          <div className="rounded-2xl border border-brand-blue/20 bg-gradient-to-br from-brand-blue/10 via-background to-brand-purple/10 p-5 lg:col-span-2 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
              🎨 Visual DNA
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#60A5FA] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#5B8CFF] shadow-sm">
                {safeText(gptAnalitics?.ContentStyle)}
              </span>
              <span className="rounded-full border border-[#C084FC] bg-[#FAF5FF] px-3 py-1 text-xs font-semibold text-[#B06EE8] shadow-sm">
                Professional
              </span>
              <span className="rounded-full border border-[#FB923C] bg-[#FFF7ED] px-3 py-1 text-xs font-semibold text-[#F08A4B] shadow-sm">
                Minimal
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {safeText(gptAnalitics?.Description)}
            </p>
          </div>

          <div className="rounded-2xl border border-brand-purple/20 bg-gradient-to-br from-brand-purple/10 via-background to-brand-orange/10 p-5 lg:col-span-4 shadow-sm">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-purple">
                📈 Performance
              </p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {metricCards.map((metric) => (
                <div key={metric.title} className="rounded-xl border border-brand-purple/20 bg-card p-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="mt-1 text-lg font-semibold bg-brand-gradient bg-clip-text text-transparent">{metric.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-brand-purple/20 bg-card p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Avg. Engagement Rate Per Post
              </p>
              {chartPoints.length > 1 ? (
                <>
                  <div className="mt-3 overflow-hidden rounded-xl bg-muted/30 p-3">
                    <svg
                      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      className="h-[120px] w-full"
                      preserveAspectRatio="none"
                      role="img"
                      aria-label="Engagement rate trend over recent posts"
                    >
                      <defs>
                        <linearGradient id="engagementRateSparkline" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6eb5ff" />
                          <stop offset="33%" stopColor="#a287f4" />
                          <stop offset="66%" stopColor="#f472b6" />
                          <stop offset="100%" stopColor="#fb923c" />
                        </linearGradient>
                      </defs>
                      <polyline
                        fill="none"
                        stroke="url(#engagementRateSparkline)"
                        strokeWidth="3"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={chartPath}
                      />
                      {chartPoints.map((point) => (
                        <circle
                          key={point.label}
                          cx={point.x}
                          cy={point.y}
                          r="4.5"
                          fill="white"
                          stroke="url(#engagementRateSparkline)"
                          strokeWidth="2.5"
                        />
                      ))}
                    </svg>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {chartPoints.map((point) => (
                      <span key={`${point.label}-value`} className="rounded-full border border-brand-purple/20 px-2 py-0.5">
                        {point.label}: {point.value.toFixed(1)}%
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">{fallbackText}</p>
              )}
            </div>
            <div className="mt-5 rounded-2xl border border-brand-purple/20 bg-card p-4 shadow-sm">
              <h3 className="text-3 font-semibold flex items-center gap-2">
                💬 Best latest post
              </h3>
              {bestPost ? (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format</span>
                    <span className="font-semibold bg-brand-gradient bg-clip-text text-transparent">
                      {bestPost.media_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Likes</span>
                    <span className="font-semibold bg-brand-gradient bg-clip-text text-transparent">
                      {bestPost.like_count === 0 ? "hidden" : bestPost.like_count}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Comments</span>
                    <span className="font-semibold bg-brand-gradient bg-clip-text text-transparent">
                      {bestPost.comments_count}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Caption</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium line-clamp-3">{bestPost.caption || fallbackText}</span>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">{fallbackText}</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-brand-blue/20 bg-gradient-to-br from-brand-blue/10 via-background to-brand-blue/5 p-5 lg:col-span-2 shadow-sm">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
                ✨ Tone of Voice
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Educational", "Direct", "Actionable"].map((tone) => (
                <span key={tone} className="rounded-full border border-brand-blue/25 bg-card px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                  {tone}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{safeText(gptAnalitics?.FunFact)}</p>
          </div>

          <div className="rounded-2xl border border-brand-purple/20 bg-gradient-to-br from-brand-purple/10 via-background to-brand-purple/5 p-5 lg:col-span-4 shadow-sm">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-purple">
                👥 Ideal Customer Profiles
              </p>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(audienceChips.length > 0 ? audienceChips : [fallbackText]).slice(0, 3).map((segment, index) => (
                <div
                  key={`${segment}-${index}`}
                  className={`rounded-xl border p-3 shadow-sm ${icpCardGradients[index % icpCardGradients.length]}`}
                >
                  <p className="text-sm font-semibold text-white">{segment}</p>
                  <p className="mt-1 text-xs text-white/90">Primary segment</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-brand-orange/25 bg-gradient-to-r from-brand-blue/10 via-brand-purple/10 to-brand-orange/10 p-5 lg:col-span-6 shadow-sm">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
                🔥 Popular Topics
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(topics.length > 0 ? topics : [fallbackText]).map((topic) => (
                <span key={topic} className="rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-brand-orange/20 bg-gradient-to-br from-brand-orange/10 via-background to-brand-purple/10 p-5 lg:col-span-3 shadow-sm">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
                💡 Growth Strategy
              </p>
            </div>
            <ul className="mt-3 space-y-2">
              {(strategy.length > 0 ? strategy : [fallbackText]).slice(0, 4).map((item, index) => (
                <li key={`${item}-${index}`} className="rounded-xl border border-brand-orange/20 bg-card px-3 py-2 text-sm text-foreground shadow-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-brand-blue/20 bg-gradient-to-br from-brand-blue/10 via-background to-brand-purple/10 p-5 lg:col-span-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
              🧠 Final Insight
            </p>
            <p className="mt-3 text-sm text-foreground">{safeText(gptAnalitics?.Conclusion)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
