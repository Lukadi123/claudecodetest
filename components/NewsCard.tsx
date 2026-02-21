'use client';

import { Article } from '@/lib/types';
import { format_timestamp } from '@/lib/tools/format_timestamp';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart } from 'lucide-react';

interface NewsCardProps {
    article: Article;
    isSaved: boolean;
    onToggleSave: () => void;
    onOpen: () => void;
}

export function NewsCard({ article, isSaved, onToggleSave, onOpen }: NewsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6 cursor-pointer group relative overflow-hidden"
            onClick={onOpen}
        >
            {/* Save Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave();
                }}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all"
                aria-label={isSaved ? 'Unsave article' : 'Save article'}
            >
                <Heart
                    className={`w-5 h-5 transition-all ${isSaved ? 'fill-[#BFF549] text-[#BFF549]' : 'text-white'}`}
                />
            </button>

            {/* Image */}
            {article.image_url && (
                <div className="relative w-full h-48 mb-4 overflow-hidden">
                    <Image
                        src={article.image_url}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                    />
                </div>
            )}

            {/* Category Badge */}
            <div className="inline-block px-3 py-1 mb-3 text-xs font-semibold uppercase tracking-wider bg-[#93b44a] text-black">
                {article.category.replaceAll('_', ' ')}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold mb-2 text-white group-hover:text-[#BFF549] transition-colors line-clamp-2">
                {article.title}
            </h3>

            {/* Summary */}
            {article.summary && (
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                    {article.summary}
                </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-[#99A1AF]">
                <span className="font-medium">{article.source}</span>
                <span>{format_timestamp(article.published_at)}</span>
            </div>
        </motion.div>
    );
}
