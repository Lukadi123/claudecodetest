import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        const response = await axios.get(url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
        });

        const $ = cheerio.load(response.data);

        // Remove noise
        $('script, style, nav, header, footer, aside, .ad, .ads, .advertisement, .social-share, .comments, [class*="sidebar"], [class*="related"], [class*="newsletter"], [class*="subscribe"], [id*="sidebar"], [id*="comments"]').remove();

        // Try to find the main article content using common selectors, in priority order
        const contentSelectors = [
            'article',
            '[class*="article-body"]',
            '[class*="article-content"]',
            '[class*="post-content"]',
            '[class*="entry-content"]',
            '[class*="story-body"]',
            '[class*="content-body"]',
            'main',
            '.content',
            '#content',
        ];

        let contentEl = null as ReturnType<typeof $> | null;
        for (const selector of contentSelectors) {
            const el = $(selector).first();
            if (el.length) {
                contentEl = el;
                break;
            }
        }

        // Extract structured content blocks
        const blocks: { type: 'heading' | 'paragraph' | 'image'; content: string }[] = [];

        const source = contentEl ?? $('body');

        source.find('h1, h2, h3, h4, p, img').each((_, el) => {
            if (!('tagName' in el)) return;
            const tag = (el as { tagName: string }).tagName.toLowerCase();
            if (tag === 'p') {
                const text = $(el).text().trim();
                if (text.length > 30) {
                    blocks.push({ type: 'paragraph', content: text });
                }
            } else if (['h1', 'h2', 'h3', 'h4'].includes(tag)) {
                const text = $(el).text().trim();
                if (text.length > 0) {
                    blocks.push({ type: 'heading', content: text });
                }
            } else if (tag === 'img') {
                const src = $(el).attr('src') || $(el).attr('data-src');
                if (src && src.startsWith('http') && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar')) {
                    blocks.push({ type: 'image', content: src });
                }
            }
        });

        // Get page title as fallback
        const title = $('h1').first().text().trim() || $('title').text().trim();

        if (blocks.length === 0) {
            return NextResponse.json({ error: 'Could not extract article content' }, { status: 422 });
        }

        return NextResponse.json({ title, blocks });
    } catch (error) {
        const message = axios.isAxiosError(error) ? error.message : 'Failed to fetch article';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
