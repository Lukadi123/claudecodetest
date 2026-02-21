import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface XTopic {
  id: string;
  topic: string;
  postCount: string | null;
  searchUrl: string;
}

export async function GET() {
  // Attempt to fetch live trending data from free public sources
  const liveTopics = await fetchLiveTrends();

  if (liveTopics.length > 0) {
    return NextResponse.json({ topics: liveTopics, fallback: false });
  }

  // All live sources failed — signal fallback to client
  return NextResponse.json({ topics: [], fallback: true });
}

async function fetchLiveTrends(): Promise<XTopic[]> {
  try {
    // Try trends24 worldwide page
    const response = await fetch('https://trends24.in/worldwide/', {
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsPulse/1.0)',
      },
    });

    if (!response.ok) return [];

    const html = await response.text();

    // Extract trending topics from the HTML
    const topicMatches = html.match(/<a[^>]*class="[^"]*trend-card__list[^"]*"[^>]*>([^<]+)<\/a>/g);
    if (!topicMatches || topicMatches.length === 0) {
      // Try alternative pattern
      const altMatches = html.match(/<a[^>]*href="\/worldwide\/[^"]*"[^>]*>([^<]+)<\/a>/g);
      if (!altMatches || altMatches.length === 0) return [];

      return altMatches.slice(0, 30).map((match, i) => {
        const topicText = match.replace(/<[^>]*>/g, '').trim();
        return {
          id: `x-trend-${i}`,
          topic: topicText,
          postCount: null,
          searchUrl: `https://x.com/search?q=${encodeURIComponent(topicText)}&src=trend_click`,
        };
      });
    }

    return topicMatches.slice(0, 30).map((match, i) => {
      const topicText = match.replace(/<[^>]*>/g, '').trim();
      return {
        id: `x-trend-${i}`,
        topic: topicText,
        postCount: null,
        searchUrl: `https://x.com/search?q=${encodeURIComponent(topicText)}&src=trend_click`,
      };
    });
  } catch {
    // Silent failure
    return [];
  }
}
