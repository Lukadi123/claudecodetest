'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { RedditPost } from '@/app/api/reddit/route';

export function useRedditTrending() {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPosts = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/reddit', {
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('Failed to fetch Reddit trends');

      const data = await response.json();

      if (!controller.signal.aborted) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('[useRedditTrending] Error:', err);
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

  return { posts, loading, error };
}
