"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ResultCard from '@/app/components/ResultCard';
import TweetEmbed from '@/app/components/TweetEmbed';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

interface AnalysisResult {
  profile: {
    username: string;
    displayName: string;
    profileImageUrl: string;
    bio: string;
    followersCount: number;
  };
  analysis: {
    overallScore: number;
    egoScore: number;
    valueScore: number;
    mainCharacterScore: number;
    humbleBragScore: number;
    selfPromotionScore: number;
    tier: string;
    tierEmoji: string;
    industry: string;
    summary: string;
    mostEgotisticalTweet?: {
      text: string;
      score: number;
    };
    leastEgotisticalTweet?: {
      text: string;
      score: number;
    };
  };
}

export default function AnalyzePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (!username) return;

    async function analyze() {
      try {
        setLoading(true);
        const response = await fetch(`/api/analyze?username=${username}`);

        if (!response.ok) {
          throw new Error('Failed to analyze profile');
        }

        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    analyze();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/20 mb-4"></div>
          <p className="text-xl text-secondary">Analyzing @{username}...</p>
          <p className="text-sm text-secondary mt-2">Scraping tweets and calculating ego...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-2xl mb-4">❌</p>
          <p className="text-xl font-bold mb-2">Analysis Failed</p>
          <p className="text-secondary mb-6">{error || 'Could not analyze this profile'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-balanced rounded-xl font-semibold hover:opacity-90 transition"
          >
            Try Another Profile
          </button>
        </div>
      </div>
    );
  }

  const radarData = [
    { metric: 'Ego', value: result.analysis.egoScore },
    { metric: 'Value', value: result.analysis.valueScore },
    { metric: 'Main Character', value: result.analysis.mainCharacterScore },
    { metric: 'Humble Brag', value: result.analysis.humbleBragScore },
    { metric: 'Self Promo', value: result.analysis.selfPromotionScore },
  ];

  // Calculate normalized Signal-to-Noise percentages (must add up to 100)
  const total = result.analysis.egoScore + result.analysis.valueScore;
  const signalPercent = total > 0 ? Math.round((result.analysis.valueScore / total) * 100) : 50;
  const noisePercent = total > 0 ? Math.round((result.analysis.egoScore / total) * 100) : 50;

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Your Ego Index
          </h1>
          <p className="text-lg text-secondary">
            Based on analysis of recent tweets
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Card */}
          <div className="flex items-start justify-center">
            <ResultCard
              username={result.profile.username}
              displayName={result.profile.displayName}
              profileImageUrl={result.profile.profileImageUrl}
              overallScore={result.analysis.overallScore}
              egoScore={result.analysis.egoScore}
              valueScore={result.analysis.valueScore}
              mainCharacterScore={result.analysis.mainCharacterScore}
              humbleBragScore={result.analysis.humbleBragScore}
              selfPromotionScore={result.analysis.selfPromotionScore}
              tier={result.analysis.tier}
              tierEmoji={result.analysis.tierEmoji}
            />
          </div>

          {/* Right: Breakdown */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-bold mb-3">Summary</h2>
              <p className="text-secondary leading-relaxed">{result.analysis.summary}</p>
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="text-sm text-secondary">Industry: </span>
                <span className="text-sm font-semibold">{result.analysis.industry}</span>
              </div>
            </div>

            {/* Charts */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-bold mb-4">Score Breakdown</h2>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#ffffff40" strokeWidth={1.5} />
                  <PolarAngleAxis dataKey="metric" stroke="#E0E0E0" tick={{ fill: '#E0E0E0', fontSize: 13, fontWeight: 500 }} />
                  <Radar name="Scores" dataKey="value" stroke="#FA8BFF" strokeWidth={2} fill="#FA8BFF" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Signal to Noise */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-bold mb-4">Signal to Noise</h2>

              <div className="space-y-6">
                {/* Normalized percentages */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-3xl font-black text-foreground mb-1">{noisePercent}%</div>
                    <div className="text-xs text-secondary">📢 Noise</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-3xl font-black text-foreground mb-1">{signalPercent}%</div>
                    <div className="text-xs text-secondary">📡 Signal</div>
                  </div>
                </div>

                {/* Diverging bar */}
                <div>
                  <div className="flex justify-between items-center mb-3 text-sm text-secondary">
                    <span className="font-medium">📡 Signal</span>
                    <span className="font-medium">📢 Noise</span>
                  </div>

                  <div className="flex items-center gap-1 h-12 rounded-xl overflow-hidden bg-white/5">
                    {/* Signal side (left) - green */}
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-end pr-3"
                      style={{ width: `${signalPercent}%` }}
                    >
                      {signalPercent > 20 && (
                        <span className="text-sm font-bold text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">{signalPercent}%</span>
                      )}
                    </div>

                    {/* Noise side (right) - color based on noise percentage */}
                    <div
                      className={`h-full flex items-center justify-start pl-3 ${
                        noisePercent > 80 ? 'bg-gradient-to-l from-red-500 to-red-400' :
                        noisePercent > 60 ? 'bg-gradient-to-l from-orange-500 to-orange-400' :
                        noisePercent > 40 ? 'bg-gradient-to-l from-yellow-500 to-yellow-400' :
                        'bg-gradient-to-l from-lime-500 to-lime-400'
                      }`}
                      style={{ width: `${noisePercent}%` }}
                    >
                      {noisePercent > 20 && (
                        <span className="text-sm font-bold text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">{noisePercent}%</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interpretation */}
                <div className="text-center pt-2 border-t border-white/10">
                  <p className="text-sm text-secondary">
                    {signalPercent > noisePercent ? (
                      <span className="text-emerald-400 font-semibold">More signal than noise ✨</span>
                    ) : noisePercent > signalPercent ? (
                      <span className="text-red-400 font-semibold">More noise than signal 📢</span>
                    ) : (
                      <span className="text-yellow-400 font-semibold">Equal signal and noise ⚖️</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tweet highlights - Twitter-style embeds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Most egotistical */}
          {result.analysis.mostEgotisticalTweet && (
            <TweetEmbed
              profileImageUrl={result.profile.profileImageUrl}
              displayName={result.profile.displayName}
              username={result.profile.username}
              text={result.analysis.mostEgotisticalTweet.text}
              variant="egotistical"
            />
          )}

          {/* Least egotistical / Most value */}
          {result.analysis.leastEgotisticalTweet && (
            <TweetEmbed
              profileImageUrl={result.profile.profileImageUrl}
              displayName={result.profile.displayName}
              username={result.profile.username}
              text={result.analysis.leastEgotisticalTweet.text}
              variant="valuable"
            />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              // TODO: Implement share functionality
              alert('Share functionality coming soon!');
            }}
            className="px-8 py-4 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition"
          >
            Share to X →
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-semibold hover:bg-white/10 transition"
          >
            Analyze Another Profile
          </button>
        </div>
      </div>
    </main>
  );
}
