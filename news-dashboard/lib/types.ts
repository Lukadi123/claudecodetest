// Type definitions matching gemini.md schemas

export type NewsSource = string;

export type Category = 'north_macedonia' | 'balkans' | 'ai';

export type Platform = 'reddit' | 'x';

export interface Article {
  id: string;
  source: NewsSource;
  category: Category;
  title: string;
  summary: string;
  url: string;
  image_url: string | null;
  published_at: string; // ISO 8601 timestamp
  scraped_at: string; // ISO 8601 timestamp
  is_saved?: boolean;
}

export interface TrendingTopic {
  id: string;
  platform: Platform;
  topic: string;
  url: string;
  engagement_count: number;
  timestamp: string; // ISO 8601 timestamp
}

export interface ScrapeJob {
  job_id: string;
  source: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at: string | null;
  articles_found: number;
  error_message: string | null;
}

export interface ScrapedData {
  articles: Article[];
  trending: TrendingTopic[];
  last_updated: string;
}
