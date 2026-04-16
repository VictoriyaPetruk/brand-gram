export interface MediaItem {
  id: string;
  like_count: number;
  media_type: string;
  media_url: string;
  comments_count: number,
  caption: string;
}

export interface MediaData {
  data: MediaItem[];
  paging: {
    cursors: {
      after: string;
    };
  };
}

export interface BusinessDiscovery {
  username: string;
  website: string;
  name: string;
  ig_id: string;
  id: string;
  profile_picture_url: string;
  biography: string;
  follows_count: number;
  followers_count: number;
  media_count: number;
  media: MediaData;
}

export interface GptAnalytics {
  BrandValue: number;
  Description: string;
  FunFact: string;
  MainAudience: string;
  AverageEngagementRate: number;
  AveragePostLikes: number;
  AveragePostComments: number;
  ContentStyle: string;
  Formats: string;
  Hashtag: string;
  Conclusion: string;
  PostsIdeas: string[];
  MarketingStrategy: string[];
}

export interface PromtResponseModel {
  Username: string;
  Name: string;
  Follows_count: number;
  Followers_count: number;
  Description: string;
  FunFact: string;
  MainAudience: string;
  AverageEngagementRate: number;
  AveragePostLikes: number;
  AveragePostComments: number;
  ContentStyle: string;
}

export interface WebSiteModelBlog
{ 
  name: string;
  biography: string;
  imgUrl: string;
  about: string;
  funFact: string;
  posts: MediaItem[];
  slides: SlideFlow[];
}
export interface WebSiteResponseGpt {
   slidesFlow: SlideFlow[],
   funFact: string;
   about: string;
}
export interface SlideFlow {
  mediaId: string;
  slideNumber: number;
  title: string;
  text: string;
}

/** Static slides payload — mock route `/api/use-gpt-content/use-gpt-slides` only. */
export const MOCK_WEBSITE_SLIDES_RESPONSE: WebSiteResponseGpt = {
  slidesFlow: [
    {
      mediaId: "preview-1",
      slideNumber: 1,
      title: "What drives us",
      text: "We build in public and share what we learn so others can move faster too.",
    },
    {
      mediaId: "preview-2",
      slideNumber: 2,
      title: "Behind the scenes",
      text: "Every launch is a mix of experiments, feedback, and small wins that compound.",
    },
    {
      mediaId: "preview-3",
      slideNumber: 3,
      title: "For our community",
      text: "We focus on clarity over hype — tools and ideas you can actually use this week.",
    },
    {
      mediaId: "preview-4",
      slideNumber: 4,
      title: "What’s next",
      text: "More stories, sharper product, and the same commitment to showing the real work.",
    },
  ],
  funFact: "We still get excited every time someone ships something they thought was “too hard” a month ago.",
  about: "Preview: a friendly team obsessed with growth, craft, and helping creators show up with confidence online.",
};

export interface MediaRequestItem {
  id: string;
  like_count: number;
  media_type: string;
  comments_count: number,
  caption: string;
}

export interface MediaRequestData {
  data: MediaRequestItem[];
}

export interface InstagramRequestGpt {
  username: string;
  name: string;
  biography: string;
  follows_count: number;
  followers_count: number;
  media_count: number;
  media: MediaRequestData;
}

export type LinkItem = {
  url: string;
  title: string;
};

export function mapBusinessDiscoveryToRequestGpt(business: BusinessDiscovery): InstagramRequestGpt {
    return {
      username: business.username,
      name: business.name,
      biography: business.biography,
      follows_count: business.follows_count,
      followers_count: business.followers_count,
      media_count: business.media_count,
      media: {
        data: business.media.data
        .filter(item => item.media_type === "CAROUSEL_ALBUM" || item.media_type === "IMAGE")
        .map((item): MediaRequestItem => ({
          id: item.id,
          like_count: item.like_count,
          media_type: item.media_type,
          comments_count: item.comments_count,
          caption: item.caption,
        })),
      },
    };
  }

export interface ContentLabIdea {
  type: string;
  color: string;
  title: string;
  hook: string;
}

export interface ContentLabResponse {
  ideas: ContentLabIdea[];
}

/** Five placeholder cards — no API; Content Lab flow only. */
export const MOCK_CONTENT_LAB_IDEAS: ContentLabIdea[] = [
  {
    type: "Educational",
    color: "#6366f1",
    title: "3 cloud architecture mistakes that quietly ruin your velocity",
    hook: "What costs you more than AWS — and how to fix it before it compounds.",
  },
  {
    type: "Entertainment",
    color: "#ec4899",
    title: "POV: You just opened your first AWS bill",
    hook: "A relatable moment every founder knows — with a twist.",
  },
  {
    type: "Sales",
    color: "#0ea5e9",
    title: "How one startup cut infra costs without hiring a DevOps team",
    hook: "Proof-led story: numbers, timeline, and what changed.",
  },
  {
    type: "Announcement",
    color: "#22c55e",
    title: "CloudBlocks now shows multi-cloud cost comparison",
    hook: "Ship the update your ICPs have been asking for.",
  },
  {
    type: "Case Study",
    color: "#f97316",
    title: "No cloud experience → live AWS production in 14 days",
    hook: "Before/after: team, stack, and the one decision that mattered.",
  },
];

/**
 * Payload for the Content Lab “generated post” template (flow page after
 * “Generate Content”, alongside “Generate image”).
 *
 * The rendered image URL is separate UI state (`generatedImageUrl`), not part
 * of this object — image APIs should use {@link ContentLabGeneratedPostTemplate.imagePrompt}.
 */
export interface ContentLabGeneratedPostTemplate {
  /** Instagram caption body; shown in the “AI Caption” card. */
  caption: string;
  /** Hashtag strings (with or without a leading `#`); shown as chips under “Optimized Hashtags”. */
  hashtags: string[];
  /** Prompt for the visual model; shown in “Image Generation Prompt” and sent to image generation. */
  imagePrompt: string;
  /** Short rationale; shown in “Why This Works”. */
  strategyNote: string;
}

/** Same shape as {@link ContentLabGeneratedPostTemplate} (API + mock data). */
export type GeneratedPostContent = ContentLabGeneratedPostTemplate;

/** Static UI preview — no backend; used by Content Lab template. */
export const MOCK_GENERATED_POST_CONTENT: ContentLabGeneratedPostTemplate = {
  imagePrompt:
    "Isometric 3D illustration of a glowing cloud architecture diagram on deep navy background, blue and purple neon accents, clean minimal tech aesthetic, professional B2B SaaS visual style, high contrast, 4K quality, no text",
  caption: `☁️ The real cost of bad cloud architecture isn't your AWS bill.

It's 3 engineers spending 40% of their time firefighting infrastructure instead of shipping features.

It's the 2am PagerDuty alert. It's the competitor who shipped twice as fast because they didn't have this problem.

CloudBlocks removes this entirely.

You describe what you need → we design the right architecture → it deploys on AWS/GCP in minutes — not weeks.

Drop "DEMO" in the comments or hit the link in bio. 👇`,
  hashtags: [
    "#CloudArchitecture",
    "#AWS",
    "#GCP",
    "#StartupLife",
    "#DevOps",
    "#FinOps",
    "#CloudBlocks",
    "#BuildInPublic",
    "#TechStartup",
    "#Infrastructure",
    "#Terraform",
    "#MultiCloud",
    "#CTOLife",
    "#EngineeringLeadership",
    "#AIStartup",
  ],
  strategyNote:
    "This caption leads with pain (not product), quantifies the cost, and ends with a clear CTA. The hook matches founders who feel infra drag — high save/share potential.",
};