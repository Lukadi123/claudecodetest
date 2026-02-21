import { NextResponse } from 'next/server';
import { RSS_FEEDS } from '@/lib/config/rss-feeds';
import { fetch_rss_feed } from '@/lib/tools/fetch_rss';
import { deduplicate_articles } from '@/lib/tools/deduplicate_articles';
import type { Article } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch all 30 feeds in parallel
    const results = await Promise.allSettled(
      RSS_FEEDS.map(feed => fetch_rss_feed(feed.feedUrl, feed.category))
    );

    const allArticles = results
      .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);

    // Deduplicate by source + title
    const uniqueArticles = deduplicate_articles(allArticles);

    // Sort newest first
    uniqueArticles.sort((a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );

    return NextResponse.json({
      articles: uniqueArticles,
      trending: [],
      last_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API/rss] Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch RSS feeds',
      articles: [],
      trending: [],
      last_updated: new Date().toISOString(),
    }, { status: 500 });
  }
}
