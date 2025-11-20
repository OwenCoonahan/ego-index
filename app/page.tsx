"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    const cleanUsername = username.replace("@", "").trim();
    router.push(`/analyze/${cleanUsername}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 p-6">
        <div className="max-w-6xl mx-auto flex justify-end">
          <Link
            href="/leaderboard"
            className="px-4 py-2 text-sm text-white font-medium border-2 border-white/40 rounded-lg hover:border-white/60 hover:bg-white/5 transition-all"
          >
            Leaderboard
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-2xl mx-auto text-center">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight text-white">
            Ego Index
          </h1>
          <p className="text-xl md:text-2xl text-secondary mb-3">
            Everyone thinks they&apos;re humble.
          </p>
          <p className="text-lg text-secondary/70">
            Let&apos;s check your ego-to-value ratio.
          </p>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-20">
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
              className="w-full px-5 py-3.5 text-base bg-white/5 border border-white/10 rounded-lg focus:border-white/30 focus:bg-white/[0.07] focus:outline-none transition-all placeholder:text-white/40"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full mt-3 px-6 py-3.5 text-base font-semibold bg-white text-black rounded-lg hover:bg-white/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing..." : "Analyze Profile"}
          </button>
        </form>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
          <div className="p-5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/[0.03] transition-all">
            <div className="text-2xl mb-2">🎭</div>
            <h3 className="font-semibold text-sm mb-1.5 text-foreground">Ego Analysis</h3>
            <p className="text-xs text-secondary/80 leading-relaxed">
              AI-powered analysis of tweets and engagement patterns
            </p>
          </div>
          <div className="p-5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/[0.03] transition-all">
            <div className="text-2xl mb-2">💎</div>
            <h3 className="font-semibold text-sm mb-1.5 text-foreground">Value Score</h3>
            <p className="text-xs text-secondary/80 leading-relaxed">
              Measure how much value you provide vs. self-promotion
            </p>
          </div>
          <div className="p-5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/[0.03] transition-all">
            <div className="text-2xl mb-2">🔥</div>
            <h3 className="font-semibold text-sm mb-1.5 text-foreground">Shareable Results</h3>
            <p className="text-xs text-secondary/80 leading-relaxed">
              Beautiful cards designed to share and compare
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
