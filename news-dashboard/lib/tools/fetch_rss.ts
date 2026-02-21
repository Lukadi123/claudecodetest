import type { Article, Category } from '../types';
import { createHash } from 'crypto';

/** Generate a deterministic ID from the article URL so saved articles persist across fetches */
function generateArticleId(url: string): string {
  return createHash('sha256').update(url).digest('hex').slice(0, 16);
}

interface Rss2JsonItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
  categories: string[];
}

interface Rss2JsonResponse {
  status: string;
  feed: { url: string; title: string; link: string; description: string; image: string };
  items: Rss2JsonItem[];
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

export async function fetch_rss_feed(feedUrl: string, category: Category): Promise<Article[]> {
  try {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(apiUrl, {
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return [];

    const data: Rss2JsonResponse = await response.json();
    if (data.status !== 'ok' || !data.items) return [];

    // Extract source domain from feed URL
    const sourceDomain = new URL(feedUrl).hostname.replace(/^www\./, '');

    return data.items
      .filter(item => item.title && item.link)
      .map(item => {
        const summary = stripHtml(item.description || item.content || '').slice(0, 200);
        const imageUrl = item.thumbnail || extractFirstImage(item.content || '') || null;

        return {
          id: generateArticleId(item.link),
          source: sourceDomain,
          category,
          title: item.title.trim(),
          summary: summary || item.title.trim().slice(0, 200),
          url: item.link,
          image_url: imageUrl,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          scraped_at: new Date().toISOString(),
        };
      });
  } catch (error) {
    // Silent failure — skip broken feeds
    console.warn(`[fetch_rss] Failed to fetch ${feedUrl}:`, error instanceof Error ? error.message : error);
    return [];
  }
}
