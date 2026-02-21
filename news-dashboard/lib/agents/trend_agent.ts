// Agent: Scrape trending topics from Reddit and X.com
import axios from 'axios';
import * as cheerio from 'cheerio';
import { TrendingTopic, Platform } from '../types';
import { v4 as uuidv4 } from 'uuid';

export async function scrape_trending_topics(platform: Platform): Promise<TrendingTopic[]> {
    try {
        if (platform === 'reddit') {
            return await scrape_reddit_trending();
        } else {
            return await scrape_x_trending();
        }
    } catch (error) {
        console.error(`[trend_agent] Error scraping ${platform}:`, error);
        return [];
    }
}

async function scrape_reddit_trending(): Promise<TrendingTopic[]> {
    try {
        console.log('[trend_agent] Fetching Reddit trending topics');

        // Use Reddit's JSON API (no auth required for public data)
        const response = await axios.get('https://www.reddit.com/r/popular.json?limit=10', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            },
            timeout: 10000,
        });

        const topics: TrendingTopic[] = [];
        const posts = response.data?.data?.children || [];

        for (const post of posts.slice(0, 10)) {
            const data = post.data;
            topics.push({
                id: uuidv4(),
                platform: 'reddit',
                topic: data.title,
                url: `https://reddit.com${data.permalink}`,
                engagement_count: data.ups || 0,
                timestamp: new Date().toISOString(),
            });
        }

        console.log(`[trend_agent] Found ${topics.length} Reddit topics`);
        return topics;
    } catch (error) {
        console.error('[trend_agent] Reddit scraping failed:', error);
        return [];
    }
}

async function scrape_x_trending(): Promise<TrendingTopic[]> {
    try {
        console.log('[trend_agent] Attempting to fetch X.com trending topics');

        // Note: X.com trending requires authentication in most cases
        // This is a placeholder that attempts to scrape the explore page
        // It may not work reliably without API access

        const response = await axios.get('https://x.com/explore', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data);
        const topics: TrendingTopic[] = [];

        // This selector is likely to break - X.com uses dynamic React rendering
        // Consider this a best-effort attempt
        $('[data-testid="trend"]').slice(0, 10).each((_, element) => {
            const $el = $(element);
            const topic = $el.find('span').first().text().trim();
            const count = $el.find('[data-testid="tweetCount"]').text();

            if (topic) {
                topics.push({
                    id: uuidv4(),
                    platform: 'x',
                    topic,
                    url: `https://x.com/search?q=${encodeURIComponent(topic)}`,
                    engagement_count: parseInt(count.replace(/[^0-9]/g, '')) || 0,
                    timestamp: new Date().toISOString(),
                });
            }
        });

        console.log(`[trend_agent] Found ${topics.length} X.com topics`);
        return topics;
    } catch (error) {
        console.error('[trend_agent] X.com scraping failed (expected - requires auth):', error);
        // Return empty array - X.com scraping is optional
        return [];
    }
}
