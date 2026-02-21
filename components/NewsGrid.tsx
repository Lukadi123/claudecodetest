'use client';

import { Article, Category } from '@/lib/types';
import { NewsCard } from './NewsCard';
import { ArticleModal } from './ArticleModal';
import { useSavedArticles } from '@/lib/hooks/useSavedArticles';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Category Tab with arrow-slide hover ─────────────────────────────── */
interface CategoryTabProps {
    label: string;
    active: boolean;
    badge?: number;
    onClick: () => void;
}

function CategoryTab({ label, active, badge, onClick }: CategoryTabProps) {
    return (
        <button
            onClick={onClick}
            className={[
                'group relative overflow-hidden px-6 py-3 font-semibold text-sm uppercase tracking-wider',
                'rounded-full whitespace-nowrap transition-all duration-300 flex items-center gap-0',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFF549]',
                active
                    ? 'bg-[#93b44a] text-black shadow-[0_0_16px_rgba(191,245,73,0.4)] scale-[1.04]'
                    : 'bg-transparent text-[#99A1AF] border border-[#99A1AF]/30 hover:border-[#BFF549]/60 hover:shadow-[0_0_10px_rgba(191,245,73,0.15)] hover:scale-[1.02]',
            ].join(' ')}
        >
            <span className="transition-all duration-300 group-hover:-translate-x-1">
                {label}
            </span>

            {badge !== undefined && badge > 0 && (
                <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full transition-all duration-300 group-hover:-translate-x-1 ${active ? 'bg-black text-[#93b44a]' : 'bg-[#93b44a] text-black'}`}>
                    {badge}
                </span>
            )}

            <ArrowRight
                className={[
                    'w-4 h-4 ml-0 opacity-0 -translate-x-2',
                    'transition-all duration-300',
                    'group-hover:opacity-100 group-hover:translate-x-1 group-hover:ml-2',
                    active ? 'text-black' : 'text-[#BFF549]',
                ].join(' ')}
            />
        </button>
    );
}

interface NewsGridProps {
    articles: Article[];
}

const CATEGORIES: { value: Category | 'all' | 'saved'; label: string }[] = [
    { value: 'all', label: 'ALL' },
    { value: 'north_macedonia', label: 'North Macedonia' },
    { value: 'balkans', label: 'Balkan' },
    { value: 'ai', label: 'AI' },
    { value: 'saved', label: 'Saved' },
];

const ROTATION_DURATION = 30000;

export function NewsGrid({ articles }: NewsGridProps) {
    const { savedArticles, isSaved, toggleSave } = useSavedArticles();
    const [activeCategory, setActiveCategory] = useState<Category | 'all' | 'saved'>('all');
    const [rotationIndex, setRotationIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const elapsedRef = useRef(0);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const handleCloseModal = useCallback(() => setSelectedArticle(null), []);

    // Reset rotation on category change
    useEffect(() => {
        setRotationIndex(0);
        setProgress(0);
        elapsedRef.current = 0;
    }, [activeCategory]);

    // Auto-rotation timer with progress and pause support
    useEffect(() => {
        if (activeCategory !== 'all' || isPaused) return;

        const TICK = 100;
        const timer = setInterval(() => {
            elapsedRef.current += TICK;
            const newProgress = (elapsedRef.current / ROTATION_DURATION) * 100;
            setProgress(newProgress);

            if (elapsedRef.current >= ROTATION_DURATION) {
                setRotationIndex(prev => prev + 1);
                elapsedRef.current = 0;
                setProgress(0);
            }
        }, TICK);

        return () => clearInterval(timer);
    }, [activeCategory, isPaused]);

    const handlePrev = () => {
        setRotationIndex(prev => Math.max(0, prev - 1));
        elapsedRef.current = 0;
        setProgress(0);
    };

    const handleNext = () => {
        setRotationIndex(prev => prev + 1);
        elapsedRef.current = 0;
        setProgress(0);
    };

    // Build the articles list based on active category
    const filteredArticles = (() => {
        if (activeCategory === 'saved') return savedArticles;

        if (activeCategory === 'all') {
            const categories: Category[] = ['north_macedonia', 'balkans', 'ai'];
            const result: Article[] = [];

            categories.forEach(cat => {
                const categoryArticles = articles
                    .filter(a => a.category === cat)
                    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

                const total = categoryArticles.length;
                if (total === 0) return;

                // Pick 3 articles per category, offset by rotationIndex * 3
                const startIdx = (rotationIndex * 3) % total;
                for (let i = 0; i < 3; i++) {
                    const idx = (startIdx + i) % total;
                    result.push(categoryArticles[idx]);
                }
            });

            return result;
        }

        // Single category — sorted newest first
        return articles
            .filter(a => a.category === activeCategory)
            .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    })();

    return (
        <>
        <div className="w-full">
            {/* Category Tabs */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                {CATEGORIES.map(cat => (
                    <CategoryTab
                        key={cat.value}
                        label={cat.label}
                        active={activeCategory === cat.value}
                        badge={cat.value === 'saved' ? savedArticles.length : undefined}
                        onClick={() => setActiveCategory(cat.value)}
                    />
                ))}
            </div>

            {/* ALL Tab — 3x3 grid with rotation controls */}
            {activeCategory === 'all' && (
                <div
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-[#93b44a]/20 mb-4">
                        <div
                            className="h-full bg-[#BFF549] transition-all duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={handlePrev}
                            disabled={rotationIndex === 0}
                            className="p-2 border border-[#93b44a]/30 text-[#99A1AF] hover:border-[#BFF549]/60 hover:text-[#BFF549] hover:shadow-[0_0_10px_rgba(191,245,73,0.15)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm text-[#99A1AF]">
                            Page {rotationIndex + 1} {isPaused && '· Paused'}
                        </span>
                        <button
                            onClick={handleNext}
                            className="p-2 border border-[#93b44a]/30 text-[#99A1AF] hover:border-[#BFF549]/60 hover:text-[#BFF549] hover:shadow-[0_0_10px_rgba(191,245,73,0.15)] transition-all duration-300 cursor-pointer"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* 3x3 Grid with crossfade */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={rotationIndex}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredArticles.length === 0 ? (
                                <div className="col-span-full text-center py-20">
                                    <p className="text-2xl text-[#99A1AF]">No articles found</p>
                                </div>
                            ) : (
                                filteredArticles.map(article => (
                                    <NewsCard
                                        key={article.id}
                                        article={article}
                                        isSaved={isSaved(article.id)}
                                        onToggleSave={() => toggleSave(article)}
                                        onOpen={() => setSelectedArticle(article)}
                                    />
                                ))
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}

            {/* Category / Saved Tabs — scrollable list */}
            {activeCategory !== 'all' && (
                <>
                    {filteredArticles.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-2xl text-[#99A1AF]">
                                {activeCategory === 'saved' ? 'No saved articles yet' : 'No articles found for this category'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredArticles.map(article => (
                                <NewsCard
                                    key={article.id}
                                    article={article}
                                    isSaved={isSaved(article.id)}
                                    onToggleSave={() => toggleSave(article)}
                                    onOpen={() => setSelectedArticle(article)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>

        {/* Article Modal */}
        <ArticleModal
            article={selectedArticle}
            isSaved={selectedArticle ? isSaved(selectedArticle.id) : false}
            onToggleSave={() => selectedArticle && toggleSave(selectedArticle)}
            onClose={handleCloseModal}
        />
        </>
    );
}
