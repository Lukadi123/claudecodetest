// Tool: Parse article from HTML
import * as cheerio from 'cheerio';
import { Article, NewsSource, Category } from '../types';
import { v4 as uuidv4 } from 'uuid';

const SOURCE_CATEGORY_MAP: Record<NewsSource, Category> = {
    // North Macedonia
    'time.mk': 'north_macedonia',
    'kanal5.com.mk': 'north_macedonia',
    'infomax.mk': 'north_macedonia',
    // Balkans
    'balkaninsight.com': 'balkans',
    'newsmaxbalkans.com': 'balkans',
    'n1info.rs': 'balkans',
    // AI & Tech
    'artificialintelligence-news.com': 'ai',
    'techcrunch.com': 'ai',
    'wsj.com': 'ai',
    'therundown.ai': 'ai',
};

export function parse_article(html: string, source: NewsSource, baseUrl: string): Article[] {
    const $ = cheerio.load(html);
    const articles: Article[] = [];

    try {
        switch (source) {
            // North Macedonia sources
            case 'time.mk':
                return parse_time_mk($, source, baseUrl);
            case 'kanal5.com.mk':
                return parse_kanal5($, source, baseUrl);
            case 'infomax.mk':
                return parse_infomax($, source, baseUrl);

            // Balkans sources
            case 'balkaninsight.com':
                return parse_balkan_insight($, source, baseUrl);
            case 'newsmaxbalkans.com':
                return parse_newsmax_balkans($, source, baseUrl);
            case 'n1info.rs':
                return parse_n1info($, source, baseUrl);

            // AI & Tech sources
            case 'artificialintelligence-news.com':
                return parse_ai_news($, source, baseUrl);
            case 'techcrunch.com':
                return parse_techcrunch($, source, baseUrl);
            case 'wsj.com':
                return parse_wsj($, source, baseUrl);
            case 'therundown.ai':
                return parse_therundown($, source, baseUrl);

            default:
                return [];
        }
    } catch (error) {
        console.error(`Error parsing ${source}:`, error);
        return [];
    }
}

// Generic parser for sites with common HTML patterns
function parseGeneric($: ReturnType<typeof cheerio.load>, source: NewsSource, baseUrl: string, selectors: string[]): Article[] {
    const articles: Article[] = [];

    for (const selector of selectors) {
        $(selector).slice(0, 10).each((_, element) => {
            const $el = $(element);
            const title = $el.find('h2, h3, h4, .title, .headline, a[href]').first().text().trim();
            const link = $el.find('a').first().attr('href');
            const image = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');
            const summary = $el.find('p, .excerpt, .summary, .description').first().text().trim().slice(0, 200);

            if (title && link && title.length > 10) {
                const url = link.startsWith('http') ? link : new URL(link, baseUrl).href;
                const image_url = image ? (image.startsWith('http') ? image : new URL(image, baseUrl).href) : null;

                articles.push({
                    id: uuidv4(),
                    source,
                    category: SOURCE_CATEGORY_MAP[source],
                    title,
                    summary: summary || title.slice(0, 200),
                    url,
                    image_url,
                    published_at: new Date().toISOString(),
                    scraped_at: new Date().toISOString(),
                });
            }
        });

        if (articles.length > 0) break; // Stop if we found articles
    }

    return articles.slice(0, 10);
}

// North Macedonia parsers
function parse_time_mk($: ReturnType<typeof cheerio.load>, source: NewsSource, baseUrl: string): Article[] {
    return parseGeneric($, source, baseUrl, [
        'article',
        '.article',
        '.post',
        '.news-item',
        '.story',
        '[class*="article"]',
        '[class*="post"]'
    ]);
}

function parse_kanal5($: ReturnType<typeof cheerio.load>, source: NewsSource, baseUrl: string): Article[] {
    return parseGeneric($, source, baseUrl, [
        'article',
        '.article',
        '.post',
        '.news-item',
        '.story-item',
        '[class*="article"]'
    ]);
}

function parse_infomax($: ReturnType<typeof cheerio.load>, source: NewsSource, baseUrl: string): Article[] {
    return parseGeneric($, source, baseUrl, [
        'article',
        '.article',
        '.post',
        '.news-item',
        '[class*="article"]',
        '[class*="news"]'
    ]);
}

// Balkans parsers
function parse_balkan_insight($: ReturnType<typeof cheerio.load>, source: NewsSource, baseUrl: string): Article[] {
    return parseGeneric($, source, baseUrl, [
        'article',
        '.article',
        '.post',
        '.story',
        '[class*="article"]',
        '[class*="post"]'
    ]);
}

function parse_newsmax_balkans($: ReturnType<typeof cheerio.load>, source: NewsSource, baseUrl: string): Article[] {
    return parseGeneric($, source, baseUrl, [
        'article',
        '.article',
        '.post',
        '.news-item',
        '[class*="article"]'
    ]);
}

function parse_n1info($: ReturnType<typeof cheerio.load>, source: NewsSource, baseUrl: string): Article[] {
    return parseGeneric($, source, baseUrl, [
        'article',
        '.article',
        '.post',
        '.news-item',
        '[class*="article"]',
        '[class*="news"]'
    ]);
}

// AI & Tech parsers
function parse_ai_news($: ReturnType<typeof cheerio.load>, source: NewsSource, baseUrl: string): Article[] {
    return parseGeneric($, source, baseUrl, [
        'article',
        '.article',
        '.post',
        '.news-item',
        '[class*="article"]'
    ]);
}

function parse_techcrunch($: ReturnType<typeof cheerio.load>, source: NewsSource, baseUrl: string): Article[] {
    return parseGeneric($, source, baseUrl, [
        'article',
        '.post-block',
        '.river-block',
        '[class*="post"]',
        '[class*="article"]'
    ]);
}

function parse_wsj($: ReturnType<typeof cheerio.load>, source: NewsSource, baseUrl: string): Article[] {
    return parseGeneric($, source, baseUrl, [
        'article',
        '.WSJTheme--story',
        '[class*="article"]',
        '[class*="story"]',
        '.article-item'
    ]);
}

function parse_therundown($: ReturnType<typeof cheerio.load>, source: NewsSource, baseUrl: string): Article[] {
    return parseGeneric($, source, baseUrl, [
        'article',
        '.article',
        '.post',
        '[class*="article"]',
        '[class*="post"]',
        '.news-item'
    ]);
}
