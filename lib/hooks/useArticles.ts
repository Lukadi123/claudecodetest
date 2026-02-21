// React Hook: Fetch and manage articles from API
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ScrapedData, Article, TrendingTopic } from '../types';

export function useArticles() {
    const [data, setData] = useState<ScrapedData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchArticles = useCallback(async () => {
        // Cancel any in-flight request before starting a new one
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/rss', {
                cache: 'no-store',
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error('Failed to fetch articles');
            }

            const result: ScrapedData = await response.json();

            // Only update state if this request was not aborted
            if (!controller.signal.aborted) {
                setData(result);
            }
        } catch (err) {
            // Ignore abort errors — they are intentional
            if (err instanceof DOMException && err.name === 'AbortError') return;
            if (!controller.signal.aborted) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                console.error('Error fetching articles:', err);
            }
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchArticles();

        // Auto-refresh every 15 minutes
        const interval = setInterval(fetchArticles, 15 * 60 * 1000);

        return () => {
            clearInterval(interval);
            // Abort any in-flight request on unmount
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchArticles]);

    return {
        articles: data?.articles || [],
        trending: data?.trending || [],
        lastUpdated: data?.last_updated,
        loading,
        error,
        refetch: fetchArticles,
    };
}
