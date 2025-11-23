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
  percentile: number;
  rank: number;
}

interface LeaderboardStats {
  avgScore: number;
  lowestScore: number;
  highestScore: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'lowest' | 'highest'>('lowest');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [stats, setStats] = useState<LeaderboardStats>({ avgScore: 0, lowestScore: 0, highestScore: 0 });
  const [totalProfiles, setTotalProfiles] = useState(0);

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
        setStats(data.stats || { avgScore: 0, lowestScore: 0, highestScore: 0 });
        setTotalProfiles(data.totalProfiles || 0);
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
          <Link href="/" className="font-mono inline-block mb-6 text-sm text-secondary hover:text-foreground transition-smooth">
            ← Back to Home
          </Link>
          <h1 className="font-mono text-5xl md:text-7xl font-black mb-4 text-white tracking-tight">
            Leaderboard
          </h1>
          <p className="text-lg text-secondary/80">
            See who&apos;s the most (and least) egotistical
          </p>
        </div>

        {/* Stats */}
        {totalProfiles > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="font-mono text-2xl font-black text-white">{totalProfiles}</div>
              <div className="text-xs text-secondary mt-1">Total Profiles</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="font-mono text-2xl font-black text-green-400">{stats.lowestScore}</div>
              <div className="text-xs text-secondary mt-1">Best Score</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="font-mono text-2xl font-black text-yellow-400">{stats.avgScore}</div>
              <div className="text-xs text-secondary mt-1">Average Score</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="font-mono text-2xl font-black text-red-400">{stats.highestScore}</div>
              <div className="text-xs text-secondary mt-1">Worst Score</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-4 mb-8">
          {/* Sort filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setFilter('lowest')}
              className={`font-mono px-5 py-2.5 rounded-xl text-sm font-bold transition-smooth ${
                filter === 'lowest'
                  ? 'bg-white text-black shadow-glow'
                  : 'bg-white/5 text-secondary hover:bg-white/10 hover:text-foreground border border-white/10 hover:border-white/20'
              }`}
            >
              Lowest Ego 😇
            </button>
            <button
              onClick={() => setFilter('highest')}
              className={`font-mono px-5 py-2.5 rounded-xl text-sm font-bold transition-smooth ${
                filter === 'highest'
                  ? 'bg-white text-black shadow-glow'
                  : 'bg-white/5 text-secondary hover:bg-white/10 hover:text-foreground border border-white/10 hover:border-white/20'
              }`}
            >
              Highest Ego 🔥
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`font-mono px-5 py-2.5 rounded-xl text-sm font-bold transition-smooth ${
                filter === 'all'
                  ? 'bg-white text-black shadow-glow'
                  : 'bg-white/5 text-secondary hover:bg-white/10 hover:text-foreground border border-white/10 hover:border-white/20'
              }`}
            >
              All
            </button>
          </div>

          {/* Industry filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            {['all', 'Tech/Startup Founder', 'Indie Hackers', 'Developer/Engineer', 'AI/ML Researchers', 'Investor/VC', 'Creator/Influencer', 'Journalists/Writers', 'Designers', 'Crypto/Web3'].map((ind) => (
              <button
                key={ind}
                onClick={() => setIndustryFilter(ind)}
                className={`font-mono px-4 py-2 rounded-xl text-xs font-semibold transition-smooth ${
                  industryFilter === ind
                    ? 'bg-white/10 text-white border border-white/30'
                    : 'bg-white/5 text-secondary hover:bg-white/10 hover:text-foreground border border-white/10 hover:border-white/20'
                }`}
              >
                {ind === 'all' ? 'All Industries' : ind}
              </button>
            ))}
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
            <Link href="/" className="font-mono inline-block mt-4 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-white/95 hover:shadow-glow transition-smooth">
              Be the First!
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;

              return (
                <Link
                  key={entry.username}
                  href={`/analyze/${entry.username}`}
                  className={`block bg-white/[0.04] backdrop-blur-sm border rounded-xl p-6 transition-smooth group hover:bg-white/[0.06] active:scale-[0.99] ${
                    isTopThree
                      ? 'border-white/20 hover:border-white/30 hover:shadow-glow'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank with medal */}
                    <div className={`font-mono text-2xl font-bold transition w-12 text-center ${
                      isTopThree ? 'text-foreground' : 'text-secondary group-hover:text-foreground'
                    }`}>
                      {getRankMedal(rank)}
                    </div>

                    {/* Profile pic */}
                    <div className="relative group-hover:scale-105 transition-smooth">
                      <Image
                        src={entry.profileImageUrl}
                        alt={entry.displayName}
                        width={56}
                        height={56}
                        className="rounded-full border-2 border-white/20 group-hover:border-white/30"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className={`font-bold ${isTopThree ? 'text-lg' : 'text-base'} text-foreground`}>
                        {entry.displayName}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm text-secondary">@{entry.username}</p>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(`https://x.com/${entry.username}`, '_blank', 'noopener,noreferrer');
                          }}
                          className="text-white/60 hover:text-white transition-colors"
                          title="View on X"
                        >
                          <span className="text-sm">𝕏</span>
                        </button>
                      </div>
                      {entry.industry && (
                        <p className="text-xs text-secondary mt-1">{entry.industry}</p>
                      )}
                    </div>


                    {/* Overall score - COLOR CODED */}
                    <div className="text-right">
                      <div className={`font-mono text-4xl font-black ${getScoreColor(entry.overallScore)}`}>
                        {entry.overallScore}
                      </div>
                      <p className="font-mono text-xs text-secondary mt-1 whitespace-nowrap">
                        {entry.tierEmoji} {entry.tier}
                      </p>
                      <p className="font-mono text-xs text-white/60 mt-1">
                        Top {100 - entry.percentile}%
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
