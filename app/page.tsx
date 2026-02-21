'use client';

import { useEffect, useState, useMemo } from 'react';
import { useArticles } from '@/lib/hooks/useArticles';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { NewsGrid } from '@/components/NewsGrid';
import { TrendingSection } from '@/components/TrendingSection';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { SearchBar } from '@/components/ui/search-bar';
import { Loader2 } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { SidebarReddit } from '@/components/SidebarReddit';
import { SidebarX } from '@/components/SidebarX';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { articles, trending, lastUpdated, loading, error, refetch } = useArticles();
  const [searchQuery, setSearchQuery] = useState('');

  const searchSuggestions = useMemo(() => {
    return articles.map(a => a.title).slice(0, 20);
  }, [articles]);

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(a =>
      a.title?.toLowerCase().includes(q) ||
      (a.summary ?? '').toLowerCase().includes(q) ||
      a.source?.toLowerCase().includes(q)
    );
  }, [articles, searchQuery]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-[#BFF549] animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#BFF549] animate-spin mx-auto mb-4" />
          <p className="text-2xl text-[#99A1AF]">Loading latest news...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-3xl font-bold mb-4">Unable to Load News</h2>
          <p className="text-lg text-[#99A1AF] mb-6">{error}</p>
          <InteractiveHoverButton
            onClick={refetch}
            text="Try Again"
            className="w-40 border-[#93b44a]/60 bg-black text-[#93b44a] mx-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ProfileAvatar />
      <SidebarReddit />
      <SidebarX />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header
          lastUpdated={lastUpdated}
          onRefresh={refetch}
          isRefreshing={loading}
        />

        <main>
          {/* Trending Topics Section */}
          <TrendingSection topics={trending} />

          {/* Search Bar */}
          <div className="flex justify-center my-8">
            <SearchBar
              placeholder="Search news..."
              suggestions={searchSuggestions}
              onSearch={setSearchQuery}
            />
          </div>

          {/* News Grid */}
          <NewsGrid articles={filteredArticles} />
        </main>

        {/* Footer */}
        <footer className="mt-20 py-8 border-t border-[#93b44a]/20 text-center">
          <p className="text-xs text-[#99A1AF] mt-2">
            ALL the news in one place provided to you by NewsPulse
          </p>
        </footer>
      </div>
    </div>
  );
}
