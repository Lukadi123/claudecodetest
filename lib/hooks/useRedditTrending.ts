'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { RedditPost } from '@/app/api/reddit/route';

// Hardcoded fallback posts shown when all live fetches fail
const FALLBACK_POSTS: RedditPost[] = [
  { id: 'hc-1', title: 'Scientists discover high-energy cosmic ray beyond known physics', subreddit: 'r/science', url: '#', permalink: 'https://www.reddit.com/r/science/', upvotes: 48200, commentCount: 1893 },
  { id: 'hc-2', title: 'EU passes sweeping AI regulation bill with bipartisan support', subreddit: 'r/worldnews', url: '#', permalink: 'https://www.reddit.com/r/worldnews/', upvotes: 42100, commentCount: 3241 },
  { id: 'hc-3', title: 'New battery technology charges EVs to 80% in under 5 minutes', subreddit: 'r/technology', url: '#', permalink: 'https://www.reddit.com/r/technology/', upvotes: 39800, commentCount: 2156 },
  { id: 'hc-4', title: 'James Webb telescope captures earliest galaxy ever observed', subreddit: 'r/space', url: '#', permalink: 'https://www.reddit.com/r/space/', upvotes: 37500, commentCount: 987 },
  { id: 'hc-5', title: 'Global ocean temperatures hit record highs for third consecutive month', subreddit: 'r/worldnews', url: '#', permalink: 'https://www.reddit.com/r/worldnews/', upvotes: 35200, commentCount: 2890 },
  { id: 'hc-6', title: 'Researchers achieve breakthrough in room-temperature superconductor material', subreddit: 'r/science', url: '#', permalink: 'https://www.reddit.com/r/science/', upvotes: 33100, commentCount: 1567 },
  { id: 'hc-7', title: 'Open-source AI model matches proprietary performance on major benchmarks', subreddit: 'r/technology', url: '#', permalink: 'https://www.reddit.com/r/technology/', upvotes: 31400, commentCount: 2034 },
  { id: 'hc-8', title: 'Mars rover finds organic compounds in ancient river delta sediment', subreddit: 'r/space', url: '#', permalink: 'https://www.reddit.com/r/space/', upvotes: 29800, commentCount: 843 },
  { id: 'hc-9', title: 'Major tech companies commit to industry-wide AI safety standards', subreddit: 'r/technology', url: '#', permalink: 'https://www.reddit.com/r/technology/', upvotes: 27600, commentCount: 1876 },
  { id: 'hc-10', title: 'New gene therapy treatment shows 95% efficacy in clinical trials', subreddit: 'r/science', url: '#', permalink: 'https://www.reddit.com/r/science/', upvotes: 26300, commentCount: 756 },
  { id: 'hc-11', title: 'Largest solar farm in history begins producing power in Australia', subreddit: 'r/worldnews', url: '#', permalink: 'https://www.reddit.com/r/worldnews/', upvotes: 24900, commentCount: 1432 },
  { id: 'hc-12', title: 'Quantum computing milestone: 1000+ logical qubits achieved', subreddit: 'r/technology', url: '#', permalink: 'https://www.reddit.com/r/technology/', upvotes: 23500, commentCount: 1109 },
  { id: 'hc-13', title: 'Antarctic ice core reveals 2 million years of climate history', subreddit: 'r/science', url: '#', permalink: 'https://www.reddit.com/r/science/', upvotes: 22100, commentCount: 654 },
  { id: 'hc-14', title: 'International Space Station successor station design unveiled', subreddit: 'r/space', url: '#', permalink: 'https://www.reddit.com/r/space/', upvotes: 20800, commentCount: 923 },
  { id: 'hc-15', title: 'Renewable energy surpasses fossil fuels in global electricity generation', subreddit: 'r/worldnews', url: '#', permalink: 'https://www.reddit.com/r/worldnews/', upvotes: 19500, commentCount: 2345 },
  { id: 'hc-16', title: 'DeepMind AI solves 50-year-old mathematics conjecture', subreddit: 'r/technology', url: '#', permalink: 'https://www.reddit.com/r/technology/', upvotes: 18200, commentCount: 876 },
  { id: 'hc-17', title: 'New material absorbs CO2 from the atmosphere 100x faster than trees', subreddit: 'r/science', url: '#', permalink: 'https://www.reddit.com/r/science/', upvotes: 17400, commentCount: 543 },
  { id: 'hc-18', title: 'Global internet users surpass 6 billion milestone', subreddit: 'r/technology', url: '#', permalink: 'https://www.reddit.com/r/technology/', upvotes: 16100, commentCount: 1234 },
  { id: 'hc-19', title: 'Record-breaking fusion reaction sustains plasma for 8 minutes', subreddit: 'r/science', url: '#', permalink: 'https://www.reddit.com/r/science/', upvotes: 15300, commentCount: 789 },
  { id: 'hc-20', title: 'UN report: global poverty rate drops to historic low of 6.2%', subreddit: 'r/worldnews', url: '#', permalink: 'https://www.reddit.com/r/worldnews/', upvotes: 14800, commentCount: 1567 },
  { id: 'hc-21', title: 'SpaceX completes first fully reusable orbital flight', subreddit: 'r/space', url: '#', permalink: 'https://www.reddit.com/r/space/', upvotes: 14200, commentCount: 2109 },
  { id: 'hc-22', title: 'CRISPR therapy receives FDA approval for sickle cell disease', subreddit: 'r/science', url: '#', permalink: 'https://www.reddit.com/r/science/', upvotes: 13600, commentCount: 432 },
  { id: 'hc-23', title: 'Self-driving trucks begin cross-country deliveries in the US', subreddit: 'r/technology', url: '#', permalink: 'https://www.reddit.com/r/technology/', upvotes: 12900, commentCount: 1876 },
  { id: 'hc-24', title: 'World Health Organization declares end to mpox global emergency', subreddit: 'r/worldnews', url: '#', permalink: 'https://www.reddit.com/r/worldnews/', upvotes: 12300, commentCount: 654 },
  { id: 'hc-25', title: 'New study reveals high-protein diet may slow cognitive decline', subreddit: 'r/science', url: '#', permalink: 'https://www.reddit.com/r/science/', upvotes: 11700, commentCount: 321 },
  { id: 'hc-26', title: 'Linux desktop market share hits all-time high of 5%', subreddit: 'r/technology', url: '#', permalink: 'https://www.reddit.com/r/technology/', upvotes: 11200, commentCount: 2456 },
  { id: 'hc-27', title: 'Deep sea expedition discovers new species in the Mariana Trench', subreddit: 'r/science', url: '#', permalink: 'https://www.reddit.com/r/science/', upvotes: 10800, commentCount: 287 },
  { id: 'hc-28', title: 'Major earthquake early warning system prevents thousands of casualties', subreddit: 'r/worldnews', url: '#', permalink: 'https://www.reddit.com/r/worldnews/', upvotes: 10300, commentCount: 543 },
  { id: 'hc-29', title: 'Apple unveils new chip architecture with 40% better efficiency', subreddit: 'r/technology', url: '#', permalink: 'https://www.reddit.com/r/technology/', upvotes: 9800, commentCount: 1678 },
  { id: 'hc-30', title: 'Brain-computer interface helps paralyzed patient type at 90 words per minute', subreddit: 'r/science', url: '#', permalink: 'https://www.reddit.com/r/science/', upvotes: 9400, commentCount: 456 },
];

export function useRedditTrending() {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPosts = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);

      const response = await fetch('/api/reddit', {
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('Failed to fetch Reddit trends');

      const data = await response.json();

      if (!controller.signal.aborted) {
        if (data.fallback || !data.posts?.length) {
          setPosts(FALLBACK_POSTS);
          setIsLive(false);
        } else {
          setPosts(data.posts);
          setIsLive(true);
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (!controller.signal.aborted) {
        // Silently fall back to hardcoded posts
        setPosts(FALLBACK_POSTS);
        setIsLive(false);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchPosts();

    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchPosts, 10 * 60 * 1000);

    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPosts]);

  return { posts, loading, isLive };
}
