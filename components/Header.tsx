'use client';

import Image from 'next/image';
import { RefreshCw } from 'lucide-react';
import { format_timestamp } from '@/lib/tools/format_timestamp';

interface HeaderProps {
    lastUpdated?: string;
    onRefresh: () => void;
    isRefreshing: boolean;
}

export function Header({ lastUpdated, onRefresh, isRefreshing }: HeaderProps) {
    return (
        <header className="w-full py-8 mb-12 border-b border-[#93b44a]/20">
            <div className="flex items-center justify-between">
                {/* Logo and Title */}
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16">
                        <Image
                            src="/logo.png"
                            alt="News Pulse Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tight">
                            News<span className="text-[#BFF549]">Pulse</span>
                        </h1>
                        <p className="text-sm text-[#99A1AF] mt-1">
                            Your 24-hour news aggregator
                        </p>
                    </div>
                </div>

                {/* Refresh Button and Last Updated */}
                <div className="flex items-center gap-4">
                    {lastUpdated && (
                        <div className="text-right">
                            <p className="text-xs text-[#99A1AF] uppercase tracking-wider">Last Updated</p>
                            <p className="text-sm font-semibold text-white">
                                {format_timestamp(lastUpdated)}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        aria-label="Refresh news"
                        className={[
                            'flex items-center gap-2 px-6 py-3 font-semibold text-sm uppercase tracking-wider',
                            'rounded-full border border-[#93b44a]/60 text-[#93b44a] bg-black',
                            'transition-all duration-300',
                            'hover:bg-[#93b44a] hover:text-black hover:border-[#93b44a] hover:shadow-[0_0_16px_rgba(191,245,73,0.35)]',
                            isRefreshing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
                        ].join(' ')}
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden md:inline">
                            {isRefreshing ? 'Loading...' : 'Refresh'}
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
}
