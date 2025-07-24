export const response = {
  id: "chatcmpl-xyz123",
  object: "chat.completion",
  created: 1712345678,
  model: "gpt-4-turbo",
  choices: [
    {
      index: 0,
      message: {
        role: "assistant",
        content:
          '📊 **Детальный анализ метрик и конкуренции + контент-план на месяц**\n\n🔍 **Анализ метрик**\n📈 *Основные показатели страницы*\n- **Подписчики**: 531\n- **Подписки**: 103\n- **Всего публикаций**: 48\n- **Средний ER (Engagement Rate)**: ~2.8% (ниже среднего)\n  - Для нишевых IT-сообществ норма **5-8%**\n- **Среднее количество лайков на пост**: ~15\n- **Охваты**: неизвестны, но ориентировочно **10-15% от подписчиков** (53-80 просмотров)\n\n📌 **Вывод:**\n- Показатели вовлеченности **ниже средних**.\n- Маленькое количество постов (**48**) для активного комьюнити.\n- Нет динамики роста подписчиков.\n\n📊 **Анализ постов**\n(На основе последнего поста)\n- **Формат**: изображение\n- **Лайки**: 15\n- **Комментарии**: нет\n- **Хэштеги**: есть, но engagement низкий → аудитория не вовлекается\n\n📌 **Вывод:**\n- Подписчики **не активно комментируют и лайкают**.\n- Контент **недостаточно интерактивный**.\n\n🆚 **Анализ конкурентов**\n🔎 **Ключевые конкуренты**\n1️⃣ **@meetup_poland** – *1,5k подписчиков*, много фото с мероприятий.\n2️⃣ **@it.warsaw** – *3k подписчиков*, контент – анонсы ивентов, мемы.\n3️⃣ **@ukr_it_hub** – *2,8k подписчиков*, образовательный контент + новости.\n\n📌 **Что они делают лучше?**\n✅ Частые публикации (**3-5 постов в неделю**)\n✅ Используют **Reels и Stories**\n✅ Больше **интерактива** (опросы, обсуждения, комментарии)\n✅ Коллаборации с блогерами\n\n📌 **Вывод:**\nЧтобы догнать конкурентов, нужно:\n- Минимум **3 поста в неделю**\n- Добавить **Reels и Stories**\n- Публиковать контент, вызывающий **дискуссии**\n\n📅 **Контент-план на месяц (4 недели)**\n| День | Тип контента | Описание | Формат | CTA |\n|------|-------------|----------|--------|----|\n| Пн (1) | 🎟️ Анонс мероприятия | Детали события, ссылка на регистрацию | Пост (карусель) | "Записуйся зараз!" |\n| Вт (2) | 🎬 Backstage | Видео подготовки к мероприятию | Reels | "Що думаєте про таке?" |\n| Ср (3) | 🎤 Интервью | Короткое видео с экспертом | Reels | "Хто хоче більше таких відео?" |\n| Чт (4) | 📢 История участника | Рассказ человека, который нашел работу через комьюнити | Пост (изображение + текст) | "Було корисно? Лайкни!" |\n| Пт (5) | 🔥 Опрос | Какой следующий ивент хотите? | Stories | Голосование |\n| Сб (6) | 📊 Полезный факт | IT-тренды | Stories/пост | "Що думаєте про це?" |\n| Вс (7) | 🎉 Мем про IT | Юмор | Пост | "Лайк, якщо зрозумів жарт!" |\n\n🔁 **Повторять каждую неделю с вариациями тем!**\n\n🚀 **Заключение и следующие шаги**\n✅ Добавить **3-4 поста в неделю**\n✅ Использовать **Reels** (они дают больше охватов)\n✅ Добавить **опросы и интерактив** в Stories\n✅ Делать **коллаборации** с украинскими IT-сообществами\n✅ Привлекать новых подписчиков через **гивэвеи или конкурсы**\n\n💡 *Хотите дополнительно таргетированную рекламу для роста аудитории?*',
      },
      finish_reason: "stop",
    },
  ],
  usage: {
    prompt_tokens: 123,
    completion_tokens: 456,
    total_tokens: 579,
  },
};

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