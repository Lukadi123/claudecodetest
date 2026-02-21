import type { Category } from '../types';

export interface RssFeedConfig {
  feedUrl: string;
  category: Category;
}

export const RSS_FEEDS: RssFeedConfig[] = [
  // ── North Macedonia (10 feeds) ──────────────────────────────────────
  { feedUrl: 'https://meta.mk/feed', category: 'north_macedonia' },
  { feedUrl: 'https://makfax.com.mk/feed', category: 'north_macedonia' },
  { feedUrl: 'https://balkaninsight.com/all-the-news-from-north-macedonia/feed', category: 'north_macedonia' },
  { feedUrl: 'https://mrt.com.mk/feed', category: 'north_macedonia' },
  { feedUrl: 'https://novamakedonija.com.mk/feed', category: 'north_macedonia' },
  { feedUrl: 'https://slobodenpecat.mk/feed', category: 'north_macedonia' },
  { feedUrl: 'https://kurir.mk/feed', category: 'north_macedonia' },
  { feedUrl: 'https://24vesti.mk/feed', category: 'north_macedonia' },
  { feedUrl: 'https://mia.mk/feed', category: 'north_macedonia' },
  { feedUrl: 'https://www.rferl.org/api/epiqq', category: 'north_macedonia' },

  // ── Balkan (10 feeds) ───────────────────────────────────────────────
  { feedUrl: 'https://balkaninsight.com/feed', category: 'balkans' },
  { feedUrl: 'https://europeanwesternbalkans.com/feed', category: 'balkans' },
  { feedUrl: 'https://emerging-europe.com/feed', category: 'balkans' },
  { feedUrl: 'https://seenews.com/rss', category: 'balkans' },
  { feedUrl: 'https://total-croatia-news.com/feed', category: 'balkans' },
  { feedUrl: 'https://total-serbia-news.com/feed', category: 'balkans' },
  { feedUrl: 'https://n1info.com/feed', category: 'balkans' },
  { feedUrl: 'https://www.euractiv.com/sections/europe-s-east/feed', category: 'balkans' },
  { feedUrl: 'https://intellinews.com/rss', category: 'balkans' },
  { feedUrl: 'https://tanjug.rs/rss', category: 'balkans' },

  // ── AI (10 feeds) ──────────────────────────────────────────────────
  { feedUrl: 'https://techcrunch.com/category/artificial-intelligence/feed', category: 'ai' },
  { feedUrl: 'https://www.theverge.com/rss/index.xml', category: 'ai' },
  { feedUrl: 'https://venturebeat.com/category/ai/feed', category: 'ai' },
  { feedUrl: 'https://www.technologyreview.com/feed', category: 'ai' },
  { feedUrl: 'https://www.wired.com/feed/category/artificial-intelligence/latest/rss', category: 'ai' },
  { feedUrl: 'https://arstechnica.com/tag/ai/feed', category: 'ai' },
  { feedUrl: 'https://openai.com/news/rss', category: 'ai' },
  { feedUrl: 'https://deepmind.google/blog/rss.xml', category: 'ai' },
  { feedUrl: 'https://blog.research.google/feeds/posts/default', category: 'ai' },
  { feedUrl: 'https://ainews.com/feed', category: 'ai' },
];
