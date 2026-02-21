'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Hash } from 'lucide-react';
import { useXTrending } from '@/lib/hooks/useXTrending';

const ROTATION_INTERVAL = 60_000; // 60 seconds
const TICK = 100;

export function SidebarX() {
  const { topics, loading, isLive } = useXTrending();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const elapsedRef = useRef(0);

  // Reset index when topics change
  useEffect(() => {
    setCurrentIndex(0);
    setProgress(0);
    elapsedRef.current = 0;
  }, [topics.length]);

  // Auto-rotation timer
  useEffect(() => {
    if (topics.length === 0 || isPaused) return;

    const timer = setInterval(() => {
      elapsedRef.current += TICK;
      setProgress((elapsedRef.current / ROTATION_INTERVAL) * 100);

      if (elapsedRef.current >= ROTATION_INTERVAL) {
        setCurrentIndex((prev) => (prev + 1) % topics.length);
        elapsedRef.current = 0;
        setProgress(0);
      }
    }, TICK);

    return () => clearInterval(timer);
  }, [topics.length, isPaused]);

  const currentTopic = topics[currentIndex];

  return (
    <div
      className="fixed right-4 top-1/2 -translate-y-1/2 w-64 z-30 hidden xl:flex flex-col"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="glass-card p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          {/* X logo */}
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current flex-shrink-0" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Trending on X
          </h3>
        </div>

        {/* Progress bar */}
        {topics.length > 0 && (
          <div className="w-full h-0.5 bg-[#93b44a]/20">
            <div
              className="h-full bg-[#BFF549] transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="min-h-[120px] flex items-center justify-center">
          {loading ? (
            // Loading skeleton
            <div className="w-full space-y-3 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-2/3" />
              <div className="h-3 bg-white/10 rounded w-1/3" />
              <div className="h-2 bg-white/10 rounded w-1/4 mt-4" />
            </div>
          ) : topics.length === 0 ? (
            <p className="text-xs text-[#99A1AF] text-center">
              Unable to load trends
            </p>
          ) : currentTopic ? (
            <AnimatePresence mode="wait">
              <motion.a
                key={currentTopic.id}
                href={currentTopic.searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="block w-full group cursor-pointer"
              >
                {/* Topic category label */}
                <span className="inline-flex items-center gap-1 text-[10px] text-[#99A1AF] uppercase tracking-wider mb-2">
                  <Hash className="w-3 h-3" />
                  Trending
                </span>

                {/* Topic name */}
                <p className="text-base font-bold text-white leading-snug mb-2 line-clamp-2 group-hover:text-[#BFF549] transition-colors duration-300">
                  {currentTopic.topic}
                </p>

                {/* Post count + arrow */}
                <div className="flex items-center justify-between text-[11px] text-[#99A1AF]">
                  {currentTopic.postCount ? (
                    <span>{currentTopic.postCount}</span>
                  ) : (
                    <span>Trending now</span>
                  )}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#BFF549] transition-opacity duration-300" />
                </div>
              </motion.a>
            </AnimatePresence>
          ) : null}
        </div>

        {/* Footer */}
        {topics.length > 0 && (
          <div className="flex items-center justify-between text-[10px] text-[#99A1AF]/50">
            <span>{currentIndex + 1} / {topics.length}</span>
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
