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