// React Hook: Manage saved articles in localStorage
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Article } from '../types';

const STORAGE_KEY = 'news_dashboard_saved_articles';

export function useSavedArticles() {
    const [savedArticles, setSavedArticles] = useState<Article[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    // Track whether the user has actually modified saved articles since mount
    const hasUserModified = useRef(false);

    // Load saved articles from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setSavedArticles(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading saved articles:', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Persist to localStorage only when the user has made a change
    useEffect(() => {
        if (isLoaded && hasUserModified.current) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(savedArticles));
            } catch (error) {
                console.error('Error saving articles:', error);
            }
        }
    }, [savedArticles, isLoaded]);

    const isSaved = useCallback((id: string) => savedArticles.some(a => a.id === id), [savedArticles]);

    const toggleSave = useCallback((article: Article) => {
        hasUserModified.current = true;
        setSavedArticles(prev => {
            const exists = prev.some(a => a.id === article.id);
            if (exists) {
                return prev.filter(a => a.id !== article.id);
            }
            return [...prev, article];
        });
    }, []);

    return {
        savedArticles,
        isSaved,
        toggleSave,
        isLoaded,
    };
}
