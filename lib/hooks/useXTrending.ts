'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { XTopic } from '@/app/api/x-trends/route';

// Realistic fallback trending topics that rotate
const FALLBACK_TOPICS: XTopic[] = [
  { id: 'fb-1', topic: '#BreakingNews', postCount: '142K posts', searchUrl: 'https://x.com/search?q=%23BreakingNews&src=trend_click' },
  { id: 'fb-2', topic: '#AI', postCount: '98.2K posts', searchUrl: 'https://x.com/search?q=%23AI&src=trend_click' },
  { id: 'fb-3', topic: '#ClimateAction', postCount: '67.4K posts', searchUrl: 'https://x.com/search?q=%23ClimateAction&src=trend_click' },
  { id: 'fb-4', topic: 'OpenAI', postCount: '54.1K posts', searchUrl: 'https://x.com/search?q=OpenAI&src=trend_click' },
  { id: 'fb-5', topic: '#WorldCup', postCount: '231K posts', searchUrl: 'https://x.com/search?q=%23WorldCup&src=trend_click' },
  { id: 'fb-6', topic: 'SpaceX', postCount: '43.8K posts', searchUrl: 'https://x.com/search?q=SpaceX&src=trend_click' },
  { id: 'fb-7', topic: '#CryptoNews', postCount: '89.5K posts', searchUrl: 'https://x.com/search?q=%23CryptoNews&src=trend_click' },
  { id: 'fb-8', topic: '#Eurovision', postCount: '156K posts', searchUrl: 'https://x.com/search?q=%23Eurovision&src=trend_click' },
  { id: 'fb-9', topic: 'Tesla', postCount: '37.2K posts', searchUrl: 'https://x.com/search?q=Tesla&src=trend_click' },
  { id: 'fb-10', topic: '#TechNews', postCount: '72.3K posts', searchUrl: 'https://x.com/search?q=%23TechNews&src=trend_click' },
  { id: 'fb-11', topic: '#Gaming', postCount: '195K posts', searchUrl: 'https://x.com/search?q=%23Gaming&src=trend_click' },
  { id: 'fb-12', topic: 'ChatGPT', postCount: '61.9K posts', searchUrl: 'https://x.com/search?q=ChatGPT&src=trend_click' },
  { id: 'fb-13', topic: '#Science', postCount: '48.7K posts', searchUrl: 'https://x.com/search?q=%23Science&src=trend_click' },
  { id: 'fb-14', topic: '#MondayMotivation', postCount: '112K posts', searchUrl: 'https://x.com/search?q=%23MondayMotivation&src=trend_click' },
  { id: 'fb-15', topic: 'Apple', postCount: '83.4K posts', searchUrl: 'https://x.com/search?q=Apple&src=trend_click' },
  { id: 'fb-16', topic: '#Politics', postCount: '267K posts', searchUrl: 'https://x.com/search?q=%23Politics&src=trend_click' },
  { id: 'fb-17', topic: '#NBA', postCount: '178K posts', searchUrl: 'https://x.com/search?q=%23NBA&src=trend_click' },
  { id: 'fb-18', topic: 'Microsoft', postCount: '29.6K posts', searchUrl: 'https://x.com/search?q=Microsoft&src=trend_click' },
  { id: 'fb-19', topic: '#Sustainability', postCount: '34.1K posts', searchUrl: 'https://x.com/search?q=%23Sustainability&src=trend_click' },
  { id: 'fb-20', topic: '#MachineLearning', postCount: '45.8K posts', searchUrl: 'https://x.com/search?q=%23MachineLearning&src=trend_click' },
  { id: 'fb-21', topic: 'Google', postCount: '76.2K posts', searchUrl: 'https://x.com/search?q=Google&src=trend_click' },
  { id: 'fb-22', topic: '#FilmTwitter', postCount: '52.3K posts', searchUrl: 'https://x.com/search?q=%23FilmTwitter&src=trend_click' },
  { id: 'fb-23', topic: '#StartupLife', postCount: '18.9K posts', searchUrl: 'https://x.com/search?q=%23StartupLife&src=trend_click' },
  { id: 'fb-24', topic: 'NASA', postCount: '41.7K posts', searchUrl: 'https://x.com/search?q=NASA&src=trend_click' },
  { id: 'fb-25', topic: '#Cybersecurity', postCount: '28.4K posts', searchUrl: 'https://x.com/search?q=%23Cybersecurity&src=trend_click' },
  { id: 'fb-26', topic: '#UEFA', postCount: '134K posts', searchUrl: 'https://x.com/search?q=%23UEFA&src=trend_click' },
  { id: 'fb-27', topic: 'Amazon', postCount: '55.1K posts', searchUrl: 'https://x.com/search?q=Amazon&src=trend_click' },
  { id: 'fb-28', topic: '#HealthTech', postCount: '22.6K posts', searchUrl: 'https://x.com/search?q=%23HealthTech&src=trend_click' },
  { id: 'fb-29', topic: '#Robotics', postCount: '31.3K posts', searchUrl: 'https://x.com/search?q=%23Robotics&src=trend_click' },
  { id: 'fb-30', topic: 'Netflix', postCount: '91.8K posts', searchUrl: 'https://x.com/search?q=Netflix&src=trend_click' },
];

export function useXTrending() {
  const [topics, setTopics] = useState<XTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTopics = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);

      const response = await fetch('/api/x-trends', {
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('Failed to fetch X trends');

      const data = await response.json();

      if (!controller.signal.aborted) {
        if (data.fallback || !data.topics?.length) {
          // Use fallback topics
          setTopics(FALLBACK_TOPICS);
          setIsLive(false);
        } else {
          setTopics(data.topics);
          setIsLive(true);
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (!controller.signal.aborted) {
        // Silently fall back to hardcoded topics
        setTopics(FALLBACK_TOPICS);
        setIsLive(false);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchTopics();

    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchTopics, 10 * 60 * 1000);

    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchTopics]);

  return { topics, loading, isLive };
}
