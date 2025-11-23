"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ResultCard from '@/app/components/ResultCard';
import TweetEmbed from '@/app/components/TweetEmbed';
import ShareToTwitter from '@/app/components/ShareToTwitter';
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
    noiseScore?: number;
    engagementQualityScore?: number;
    authenticityScore?: number;
    signalToEgoRatio?: number;
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
    mostValuableTweet?: {
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
  const cardRef = useRef<HTMLDivElement>(null);

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
          <p className="font-mono text-xl text-secondary">Analyzing @{username}...</p>
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
          <p className="font-mono text-xl font-bold mb-2">Analysis Failed</p>
          <p className="text-secondary mb-6">{error || 'Could not analyze this profile'}</p>
          <button
            onClick={() => router.push('/')}
            className="font-mono px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-white/95 hover:shadow-glow transition-smooth"
          >
            Try Another Profile
          </button>
        </div>
      </div>
    );
  }

  const radarData = [
    { metric: 'Value', value: result.analysis.valueScore || 0 },
    { metric: 'Ego', value: result.analysis.egoScore || 0 },
    { metric: 'Noise', value: result.analysis.noiseScore || 0 },
    { metric: 'Engagement', value: result.analysis.engagementQualityScore || 0 },
    { metric: 'Authenticity', value: result.analysis.authenticityScore || 0 },
  ];

  // Get SER tier color
  const getSERColor = (ser: number | null | undefined) => {
    if (!ser && ser !== 0) return 'text-yellow-400';
    if (ser >= 0.80) return 'text-emerald-400';
    if (ser >= 0.60) return 'text-lime-400';
    if (ser >= 0.40) return 'text-yellow-400';
    if (ser >= 0.20) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSERGradient = (ser: number | null | undefined) => {
    if (!ser && ser !== 0) return 'from-yellow-500 to-yellow-400';
    if (ser >= 0.80) return 'from-emerald-500 to-emerald-400';
    if (ser >= 0.60) return 'from-lime-500 to-lime-400';
    if (ser >= 0.40) return 'from-yellow-500 to-yellow-400';
    if (ser >= 0.20) return 'from-orange-500 to-orange-400';
    return 'from-red-500 to-red-400';
  };

  // Calculate normalized Signal-to-Noise percentages (must add up to 100)
  const total = result.analysis.egoScore + result.analysis.valueScore;
  const signalPercent = total > 0 ? Math.round((result.analysis.valueScore / total) * 100) : 50;
  const noisePercent = total > 0 ? Math.round((result.analysis.egoScore / total) * 100) : 50;

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-mono text-4xl md:text-6xl font-black mb-4 text-white tracking-tight">
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
            <div ref={cardRef}>
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
          </div>

          {/* Right: Breakdown */}
          <div className="space-y-6">
            {/* Signal-to-Ego Ratio (SER) - Prominent Display */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="font-mono text-xl font-bold mb-4">Signal-to-Ego Ratio (SER)</h2>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className={`font-mono text-7xl font-black mb-2 ${getSERColor(result.analysis.signalToEgoRatio)}`}>
                    {(result.analysis.signalToEgoRatio ?? 0).toFixed(2)}
                  </div>
                  <div className={`font-mono inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getSERGradient(result.analysis.signalToEgoRatio)} text-black font-bold text-sm`}>
                    {result.analysis.tier}
                  </div>
                  <div className="mt-4 text-xs text-secondary max-w-sm">
                    SER measures value provided vs ego + noise. Higher is better.
                    <br />
                    {(result.analysis.signalToEgoRatio ?? 0) >= 0.80 && "🏆 Elite - Top 5%"}
                    {(result.analysis.signalToEgoRatio ?? 0) >= 0.60 && (result.analysis.signalToEgoRatio ?? 0) < 0.80 && "💎 High Value - Top 20%"}
                    {(result.analysis.signalToEgoRatio ?? 0) >= 0.40 && (result.analysis.signalToEgoRatio ?? 0) < 0.60 && "⚖️ Balanced"}
                    {(result.analysis.signalToEgoRatio ?? 0) >= 0.20 && (result.analysis.signalToEgoRatio ?? 0) < 0.40 && "📢 Low Signal"}
                    {(result.analysis.signalToEgoRatio ?? 0) < 0.20 && "🔥 High Noise"}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="font-mono text-xl font-bold mb-3">Summary</h2>
              <p className="text-secondary leading-relaxed">{result.analysis.summary}</p>
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="text-sm text-secondary">Industry: </span>
                <span className="font-mono text-sm font-semibold">{result.analysis.industry}</span>
              </div>
            </div>

            {/* Multi-Dimensional Scores */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="font-mono text-xl font-bold mb-4">Multi-Dimensional Scores</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="font-mono text-2xl font-bold text-emerald-400">{result.analysis.valueScore}</div>
                  <div className="text-xs text-secondary mt-1">💎 Value</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="font-mono text-2xl font-bold text-red-400">{result.analysis.egoScore}</div>
                  <div className="text-xs text-secondary mt-1">🎭 Ego</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="font-mono text-2xl font-bold text-orange-400">{result.analysis.noiseScore}</div>
                  <div className="text-xs text-secondary mt-1">📢 Noise</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="font-mono text-2xl font-bold text-blue-400">{result.analysis.engagementQualityScore}</div>
                  <div className="text-xs text-secondary mt-1">💬 Engagement</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 col-span-2">
                  <div className="font-mono text-2xl font-bold text-purple-400">{result.analysis.authenticityScore}</div>
                  <div className="text-xs text-secondary mt-1">✨ Authenticity</div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="font-mono text-xl font-bold mb-4">Score Breakdown</h2>
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
              <h2 className="font-mono text-xl font-bold mb-4">Signal to Noise</h2>

              <div className="space-y-6">
                {/* Normalized percentages */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="font-mono text-3xl font-black text-foreground mb-1">{noisePercent}%</div>
                    <div className="text-xs text-secondary">📢 Noise</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="font-mono text-3xl font-black text-foreground mb-1">{signalPercent}%</div>
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
                        <span className="font-mono text-sm font-bold text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">{signalPercent}%</span>
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
                        <span className="font-mono text-sm font-bold text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">{noisePercent}%</span>
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
          <ShareToTwitter
            username={result.profile.username}
            displayName={result.profile.displayName}
            overallScore={result.analysis.overallScore}
            tier={result.analysis.tier}
            tierEmoji={result.analysis.tierEmoji}
            cardRef={cardRef}
          />
          <button
            onClick={() => router.push('/')}
            className="font-mono px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-semibold hover:bg-white/10 hover:border-white/20 transition-smooth"
          >
            Analyze Another Profile
          </button>
        </div>
      </div>
    </main>
  );
}
