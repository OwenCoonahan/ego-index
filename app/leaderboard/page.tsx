"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LeaderboardEntry {
  username: string;
  displayName: string;
  profileImageUrl: string;
  overallScore: number;
  egoScore: number;
  valueScore: number;
  mainCharacterScore: number;
  humbleBragScore: number;
  selfPromotionScore: number;
  tier: string;
  tierEmoji: string;
  industry: string | null;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'lowest' | 'highest'>('lowest');
  const industryFilter = 'all'; // TODO: Add industry filter UI

  // Get score color based on value (low ego = green, high ego = red)
  // Heat map: green → lime → yellow → orange → red
  const getScoreColor = (score: number) => {
    if (score <= 20) return 'text-emerald-400'; // Low ego (good) - green
    if (score <= 40) return 'text-lime-400'; // Value contributor - lime/light green
    if (score <= 60) return 'text-yellow-400'; // Balanced - yellow
    if (score <= 80) return 'text-orange-400'; // Self-promoter - orange
    return 'text-red-400'; // High ego (bad) - red
  };

  // Get medal for top 3
  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const response = await fetch(`/api/leaderboard?filter=${filter}&industry=${industryFilter}`);
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [filter, industryFilter]);

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-4 text-sm text-secondary hover:text-foreground transition">
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Leaderboard
          </h1>
          <p className="text-lg text-secondary">
            See who&apos;s the most (and least) egotistical
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('lowest')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'lowest'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-secondary hover:bg-white/10'
              }`}
            >
              Lowest Ego 😇
            </button>
            <button
              onClick={() => setFilter('highest')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'highest'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-secondary hover:bg-white/10'
              }`}
            >
              Highest Ego 🔥
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-secondary hover:bg-white/10'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/20 mb-4"></div>
            <p className="text-secondary">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-secondary">No profiles analyzed yet</p>
            <Link href="/" className="inline-block mt-4 px-6 py-3 bg-gradient-balanced rounded-xl font-semibold hover:opacity-90 transition">
              Be the First!
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;

              return (
                <Link
                  key={entry.username}
                  href={`/analyze/${entry.username}`}
                  className={`block bg-white/5 backdrop-blur-sm border rounded-xl p-6 transition-all group ${
                    isTopThree
                      ? 'border-white/20 hover:border-white/30'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank with medal */}
                    <div className={`text-2xl font-bold transition w-12 text-center ${
                      isTopThree ? 'text-foreground' : 'text-secondary group-hover:text-foreground'
                    }`}>
                      {getRankMedal(rank)}
                    </div>

                    {/* Profile pic */}
                    <div className="relative">
                      <Image
                        src={entry.profileImageUrl}
                        alt={entry.displayName}
                        width={56}
                        height={56}
                        className="rounded-full border-2 border-white/20"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className={`font-bold ${isTopThree ? 'text-lg' : 'text-base'} text-foreground`}>
                        {entry.displayName}
                      </p>
                      <p className="text-sm text-secondary">@{entry.username}</p>
                      {entry.industry && (
                        <p className="text-xs text-secondary mt-1">{entry.industry}</p>
                      )}
                    </div>


                    {/* Overall score - COLOR CODED */}
                    <div className="text-right">
                      <div className={`text-4xl font-black ${getScoreColor(entry.overallScore)}`}>
                        {entry.overallScore}
                      </div>
                      <p className="text-xs text-secondary mt-1 whitespace-nowrap">
                        {entry.tierEmoji} {entry.tier}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
