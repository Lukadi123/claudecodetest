// API Route: Orchestrate all scraping agents
import { NextResponse } from 'next/server';
import { scrape_news_source, delay } from '@/lib/agents/scraper_agent';
import { scrape_trending_topics } from '@/lib/agents/trend_agent';
import { deduplicate_articles } from '@/lib/tools/deduplicate_articles';
import { NewsSource } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NEWS_SOURCES: NewsSource[] = [
    // North Macedonia
    'time.mk',
    'kanal5.com.mk',
    'infomax.mk',
    // Balkans
    'balkaninsight.com',
    'newsmaxbalkans.com',
    'n1info.rs',
    // AI & Tech
    'artificialintelligence-news.com',
    'techcrunch.com',
    'wsj.com',
    'therundown.ai',
];

export async function GET() {
    try {
        console.log('[API] Starting scrape job for all sources');

        // Scrape all news sources in parallel
        const scrapePromises = NEWS_SOURCES.map(async (source) => {
            await delay(Math.random() * 2000); // Random delay 0-2s to avoid rate limiting
            return scrape_news_source(source);
        });

        const results = await Promise.allSettled(scrapePromises);

        // Collect all successful articles
        const allArticles = results
            .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
            .flatMap(result => result.value);

        // Deduplicate articles
        const uniqueArticles = deduplicate_articles(allArticles);

        console.log(`[API] Total articles scraped: ${uniqueArticles.length}`);

        // Scrape trending topics from Reddit
        const trending = await scrape_trending_topics('reddit');

        console.log(`[API] Total trending topics: ${trending.length}`);

        return NextResponse.json({
            articles: uniqueArticles,
            trending,
            last_updated: new Date().toISOString(),
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200', // 24h cache
            },
        });
    } catch (error) {
        console.error('[API] Error in scrape route:', error);
        return NextResponse.json(
            {
                error: 'Failed to scrape news',
                articles: [],
                trending: [],
                last_updated: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
