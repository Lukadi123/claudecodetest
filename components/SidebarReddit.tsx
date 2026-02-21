'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, MessageSquare, ArrowUp } from 'lucide-react';
import { useRedditTrending } from '@/lib/hooks/useRedditTrending';

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

const ITEMS_PER_PAGE = 3;
const ROTATION_INTERVAL = 60_000; // 60 seconds
const TICK = 100;

export function SidebarReddit() {
  const { posts, loading, isLive } = useRedditTrending();
  const [pageIndex, setPageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const elapsedRef = useRef(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(posts.length / ITEMS_PER_PAGE)),
    [posts.length]
  );

  // Reset page when posts change
  useEffect(() => {
    setPageIndex(0);
    setProgress(0);
    elapsedRef.current = 0;
  }, [posts.length]);

  // Auto-rotation timer
  useEffect(() => {
    if (posts.length === 0 || isPaused) return;

    const timer = setInterval(() => {
      elapsedRef.current += TICK;
      setProgress((elapsedRef.current / ROTATION_INTERVAL) * 100);

      if (elapsedRef.current >= ROTATION_INTERVAL) {
        setPageIndex((prev) => (prev + 1) % totalPages);
        elapsedRef.current = 0;
        setProgress(0);
      }
    }, TICK);

    return () => clearInterval(timer);
  }, [posts.length, isPaused, totalPages]);

  const currentPosts = useMemo(() => {
    const start = pageIndex * ITEMS_PER_PAGE;
    return posts.slice(start, start + ITEMS_PER_PAGE);
  }, [posts, pageIndex]);

  return (
    <div
      className="fixed left-4 top-1/2 -translate-y-1/2 w-64 z-30 hidden xl:flex flex-col"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="glass-card p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          {/* Reddit icon */}
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-orange-500 fill-current flex-shrink-0" aria-hidden="true">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
          </svg>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Trending on Reddit
          </h3>
        </div>

        {/* Progress bar */}
        {posts.length > 0 && (
          <div className="w-full h-0.5 bg-[#93b44a]/20">
            <div
              className="h-full bg-orange-500 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="min-h-[340px] flex items-start justify-center">
          {loading ? (
            // Loading skeleton — 3 items
            <div className="w-full space-y-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-3 animate-pulse">
                  <div className="h-3 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/10 rounded w-full" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                  <div className="flex gap-3 mt-2">
                    <div className="h-2 bg-white/10 rounded w-16" />
                    <div className="h-2 bg-white/10 rounded w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="text-xs text-[#99A1AF] text-center">
              Unable to load Reddit trends
            </p>
          ) : currentPosts.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={pageIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="w-full flex flex-col gap-4"
              >
                {currentPosts.map((post) => (
                  <a
                    key={post.id}
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full group cursor-pointer"
                  >
                    {/* Subreddit badge */}
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase bg-orange-500 text-white mb-2">
                      {post.subreddit}
                    </span>

                    {/* Title */}
                    <p className="text-sm font-medium text-white leading-snug mb-3 line-clamp-2 group-hover:text-[#BFF549] transition-colors duration-300">
                      {post.title}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-[11px] text-[#99A1AF]">
                      <span className="flex items-center gap-1">
                        <ArrowUp className="w-3 h-3 text-orange-500" />
                        {formatCount(post.upvotes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {formatCount(post.commentCount)}
                      </span>
                      <ArrowUpRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 text-[#BFF549] transition-opacity duration-300" />
                    </div>
                  </a>
                ))}
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>

        {/* Page indicator */}
        {posts.length > 0 && (
          <div className="flex items-center justify-between text-[10px] text-[#99A1AF]/50">
            <span>{pageIndex + 1} / {totalPages}</span>
            <div className="flex items-center gap-1">
              {isPaused && <span className="uppercase tracking-wider">Paused</span>}
              {!isLive && !isPaused && <span className="uppercase tracking-wider">Simulated</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
