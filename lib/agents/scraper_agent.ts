// Agent: Scrape news from a single source
import { scrape_url } from '../tools/scrape_url';
import { parse_article } from '../tools/parse_article';
import { validate_article } from '../tools/validate_article';
import { Article, NewsSource } from '../types';

const SOURCE_URLS: Record<NewsSource, string> = {
    // North Macedonia
    'time.mk': 'https://time.mk',
    'kanal5.com.mk': 'https://kanal5.com.mk',
    'infomax.mk': 'https://infomax.mk',
    // Balkans
    'balkaninsight.com': 'https://balkaninsight.com',
    'newsmaxbalkans.com': 'https://newsmaxbalkans.com',
    'n1info.rs': 'https://n1info.rs',
    // AI & Tech
    'artificialintelligence-news.com': 'https://www.artificialintelligence-news.com',
    'techcrunch.com': 'https://techcrunch.com/category/artificial-intelligence/',
    'wsj.com': 'https://www.wsj.com/tech/ai',
    'therundown.ai': 'https://www.therundown.ai',
};

export async function scrape_news_source(source: NewsSource): Promise<Article[]> {
    try {
        console.log(`[scraper_agent] Starting scrape for ${source}`);

        const url = SOURCE_URLS[source];

        // Step 1: Fetch HTML
        const html = await scrape_url(url);

        // Step 2: Parse articles
        const articles = parse_article(html, source, url);

        // Step 3: Validate articles
        const validArticles = articles.filter(validate_article);

        console.log(`[scraper_agent] Found ${validArticles.length} valid articles from ${source}`);

        return validArticles;
    } catch (error) {
        console.error(`[scraper_agent] Error scraping ${source}:`, error);
        return []; // Return empty array on error (graceful degradation)
    }
}

// Helper function to add delay between requests
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
