'use client';

import { useEffect, useState } from 'react';
import { Article } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Loader2, Heart } from 'lucide-react';
import { format_timestamp } from '@/lib/tools/format_timestamp';
import Image from 'next/image';

interface ContentBlock {
    type: 'heading' | 'paragraph' | 'image';
    content: string;
}

interface ArticleModalProps {
    article: Article | null;
    isSaved: boolean;
    onToggleSave: () => void;
    onClose: () => void;
}

export function ArticleModal({ article, isSaved, onToggleSave, onClose }: ArticleModalProps) {
    const [blocks, setBlocks] = useState<ContentBlock[]>([]);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!article) return;

        const controller = new AbortController();

        setBlocks([]);
        setFailed(false);
        setLoading(true);

        fetch(`/api/article?url=${encodeURIComponent(article.url)}`, {
            signal: controller.signal,
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (controller.signal.aborted) return;
                if (data.error || !data.blocks?.length) {
                    setFailed(true);
                } else {
                    setBlocks(data.blocks);
                }
            })
            .catch(err => {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                if (!controller.signal.aborted) setFailed(true);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [article]);

    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    // Prevent background scroll
    useEffect(() => {
        document.body.style.overflow = article ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [article]);

    return (
        <AnimatePresence>
            {article && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-4 md:inset-10 lg:inset-16 z-50 bg-[#0a0a0a] border border-[#93b44a]/30 overflow-hidden flex flex-col"
                    >
                        {/* Modal Header */}
                        <div className="flex items-start justify-between p-6 border-b border-[#93b44a]/20 flex-shrink-0">
                            <div className="flex-1 pr-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 text-xs font-bold uppercase bg-[#93b44a] text-black">
                                        {article.category.replaceAll('_', ' ')}
                                    </span>
                                    <span className="text-xs text-[#99A1AF]">{article.source}</span>
                                    <span className="text-xs text-[#99A1AF]">·</span>
                                    <span className="text-xs text-[#99A1AF]">{format_timestamp(article.published_at)}</span>
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
                                    {article.title}
                                </h2>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                {/* Save button */}
                                <button
                                    onClick={onToggleSave}
                                    className="p-2 hover:bg-white/10 transition-colors"
                                    aria-label={isSaved ? 'Unsave article' : 'Save article'}
                                >
                                    <Heart className={`w-5 h-5 transition-all ${isSaved ? 'fill-[#BFF549] text-[#BFF549]' : 'text-white'}`} />
                                </button>

                                {/* Open original */}
                                <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-white/10 transition-colors"
                                    aria-label="Open original article"
                                >
                                    <ExternalLink className="w-5 h-5 text-[#99A1AF] hover:text-[#BFF549] transition-colors" />
                                </a>

                                {/* Close */}
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-10">
                            {/* Hero image from article card */}
                            {article.image_url && blocks.length > 0 && (
                                <div className="relative w-full h-64 mb-8 overflow-hidden">
                                    <Image
                                        src={article.image_url}
                                        alt={article.title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            )}

                            {/* Loading */}
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-10 h-10 text-[#BFF549] animate-spin mb-4" />
                                    <p className="text-[#99A1AF]">Loading article...</p>
                                </div>
                            )}

                            {/* Failed to fetch */}
                            {!loading && failed && (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <p className="text-[#99A1AF] mb-2">This article could not be loaded here.</p>
                                    <p className="text-sm text-[#99A1AF]/60 mb-6">The source may require authentication or block external access.</p>
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Open on {article.source}
                                    </a>
                                </div>
                            )}

                            {/* Article content */}
                            {!loading && !failed && (
                                <div className="max-w-2xl mx-auto">
                                    {blocks.map((block, i) => {
                                        if (block.type === 'heading') {
                                            return (
                                                <h3 key={i} className="text-lg font-bold text-white mt-8 mb-3 first:mt-0">
                                                    {block.content}
                                                </h3>
                                            );
                                        }
                                        if (block.type === 'image') {
                                            return (
                                                <div key={i} className="relative w-full h-56 my-6 overflow-hidden">
                                                    <Image
                                                        src={block.content}
                                                        alt=""
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                            );
                                        }
                                        return (
                                            <p key={i} className="text-base text-[#d1d5db] leading-relaxed mb-4">
                                                {block.content}
                                            </p>
                                        );
                                    })}

                                    {/* Footer link */}
                                    <div className="mt-10 pt-6 border-t border-[#93b44a]/20">
                                        <a
                                            href={article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-[#99A1AF] hover:text-[#BFF549] transition-colors flex items-center gap-1"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            Read original on {article.source}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
