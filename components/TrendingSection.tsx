'use client';

import { TrendingTopic } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TrendingSectionProps {
    topics: TrendingTopic[];
}

export function TrendingSection({ topics }: TrendingSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-rotate every 30 seconds
    useEffect(() => {
        if (topics.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % topics.length);
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [topics.length]);

    if (topics.length === 0) return null;

    const currentTopic = topics[currentIndex];

    return (
        <div className="w-full mb-8">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#BFF549]" />
                <h2 className="text-2xl font-bold">Trending Now</h2>
            </div>

            <AnimatePresence mode="wait">
                <motion.a
                    key={currentTopic.id}
                    href={currentTopic.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="glass-card p-4 flex items-center justify-between group cursor-pointer"
                >
                    <div className="flex-1">
                        {/* Platform Badge */}
                        <span className={`inline-block px-2 py-1 text-xs font-bold uppercase mb-2 ${currentTopic.platform === 'reddit'
                                ? 'bg-orange-500 text-white'
                                : 'bg-blue-500 text-white'
                            }`}>
                            {currentTopic.platform}
                        </span>

                        {/* Topic */}
                        <p className="text-sm font-semibold text-white mb-1 group-hover:text-[#BFF549] transition-colors line-clamp-2">
                            {currentTopic.topic}
                        </p>

                        {/* Engagement */}
                        <div className="flex items-center gap-2 text-xs text-[#99A1AF]">
                            <TrendingUp className="w-3 h-3" />
                            <span>{currentTopic.engagement_count.toLocaleString()} engagements</span>
                        </div>
                    </div>

                    <ArrowUpRight className="w-5 h-5 text-[#99A1AF] group-hover:text-[#BFF549] transition-colors ml-4 flex-shrink-0" />
                </motion.a>
            </AnimatePresence>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-3">
                {topics.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                ? 'bg-[#BFF549] w-6'
                                : 'bg-[#99A1AF]/30 hover:bg-[#99A1AF]/50'
                            }`}
                        aria-label={`Go to trending topic ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
