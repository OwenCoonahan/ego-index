"use client";

import Image from 'next/image';

interface ResultCardProps {
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
}

export default function ResultCard({
  username,
  displayName,
  profileImageUrl,
  overallScore,
  egoScore,
  valueScore,
  mainCharacterScore,
  humbleBragScore,
  selfPromotionScore,
  tier,
  tierEmoji,
}: ResultCardProps) {
  // Determine gradient based on score (higher score = higher ego = worse = red)
  // Heat map: green → lime → yellow → orange → red
  const getGradient = (score: number) => {
    if (score <= 20) return 'gradient-green'; // Low ego = good (green)
    if (score <= 40) return 'gradient-lime'; // Value contributor (lime/light green)
    if (score <= 60) return 'gradient-yellow'; // Balanced (yellow)
    if (score <= 80) return 'gradient-orange'; // Self-promoter (orange)
    return 'gradient-red'; // Ego maximalist (red)
  };

  const gradient = getGradient(overallScore);

  // Score explanation based on tier
  const getScoreExplanation = (score: number) => {
    if (score <= 20) return "Low ego, high value ✨";
    if (score <= 40) return "More value than ego 💎";
    if (score <= 60) return "Balanced mix ⚖️";
    if (score <= 80) return "More ego than value 📢";
    return "High ego, low value 🔥";
  };

  // Calculate normalized Signal-to-Noise percentages (must add up to 100)
  const total = egoScore + valueScore;
  const signalPercent = total > 0 ? Math.round((valueScore / total) * 100) : 50;
  const noisePercent = total > 0 ? Math.round((egoScore / total) * 100) : 50;

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Card container */}
      <div className={`relative bg-${gradient} rounded-2xl p-1`}>
        <div className="bg-background rounded-[14px] p-8">
          {/* Content */}
          <div>
            {/* Profile section */}
            <div className="flex items-center gap-3 mb-6">
              <Image
                src={profileImageUrl}
                alt={displayName}
                width={48}
                height={48}
                className="rounded-full border-2 border-white/20"
              />
              <div>
                <p className="font-bold text-foreground">{displayName}</p>
                <p className="text-sm text-secondary">@{username}</p>
              </div>
            </div>

            {/* Main score */}
            <div className="text-center mb-6">
              <div className={`text-8xl font-black mb-2 ${
                overallScore <= 20 ? 'text-emerald-400' :
                overallScore <= 40 ? 'text-lime-400' :
                overallScore <= 60 ? 'text-yellow-400' :
                overallScore <= 80 ? 'text-orange-400' :
                'text-red-400'
              }`}>
                {overallScore}
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-3 overflow-hidden">
                <div
                  className={`h-full bg-${gradient} transition-all duration-500`}
                  style={{ width: `${overallScore}%` }}
                ></div>
              </div>
              <p className="text-xl font-bold text-foreground mb-1">EGO INDEX</p>
              <p className="text-xs text-secondary italic">{getScoreExplanation(overallScore)}</p>
            </div>

            {/* Individual Scores */}
            <div className="space-y-2.5 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-secondary text-sm">🎭 Ego</span>
                <span className="font-bold text-foreground">{egoScore}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary text-sm">💎 Value</span>
                <span className="font-bold text-foreground">{valueScore}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary text-sm">🎬 Main Character</span>
                <span className="font-bold text-foreground">{mainCharacterScore}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary text-sm">😇 Humble Brag</span>
                <span className="font-bold text-foreground">{humbleBragScore}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary text-sm">📣 Self Promotion</span>
                <span className="font-bold text-foreground">{selfPromotionScore}/100</span>
              </div>
            </div>

            {/* Signal to Noise - Diverging Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2 text-xs text-secondary">
                <span>📡 Signal</span>
                <span className="font-medium">Signal to Noise</span>
                <span>📢 Noise</span>
              </div>

              {/* Diverging horizontal bar - normalized percentages */}
              <div className="flex items-center gap-0.5 h-8 rounded-lg overflow-hidden bg-white/10">
                {/* Signal side (left) - green */}
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-end pr-2 transition-all duration-500"
                  style={{ width: `${signalPercent}%` }}
                >
                  {signalPercent > 15 && (
                    <span className="text-xs font-bold text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">{signalPercent}%</span>
                  )}
                </div>

                {/* Noise side (right) - color based on noise percentage */}
                <div
                  className={`h-full flex items-center justify-start pl-2 transition-all duration-500 ${
                    noisePercent > 80 ? 'bg-gradient-to-l from-red-500 to-red-400' :
                    noisePercent > 60 ? 'bg-gradient-to-l from-orange-500 to-orange-400' :
                    noisePercent > 40 ? 'bg-gradient-to-l from-yellow-500 to-yellow-400' :
                    'bg-gradient-to-l from-lime-500 to-lime-400'
                  }`}
                  style={{ width: `${noisePercent}%` }}
                >
                  {noisePercent > 15 && (
                    <span className="text-xs font-bold text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">{noisePercent}%</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tier badge */}
            <div className={`bg-${gradient} bg-opacity-10 border border-white/20 rounded-2xl px-4 py-3 mb-6`}>
              <p className="text-center text-sm font-medium">
                <span className="mr-2 text-xl">{tierEmoji}</span>
                <span className="text-foreground">{tier}</span>
              </p>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-xs text-secondary">
                egoindex.app →
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
