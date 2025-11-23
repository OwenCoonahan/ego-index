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
    <main className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 md:pt-0">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 p-4 md:p-6">
        <div className="max-w-6xl mx-auto flex justify-end">
          <Link
            href="/leaderboard"
            className="font-mono px-4 py-2.5 text-sm text-white font-medium border border-white/20 rounded-xl hover:border-white/40 hover:bg-white/[0.06] transition-smooth"
          >
            Leaderboard
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-2xl mx-auto text-center">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="font-mono text-5xl md:text-8xl font-black mb-6 tracking-tight text-white leading-[0.9]">
            Ego Index
          </h1>
          <p className="text-xl md:text-2xl text-secondary mb-3 font-medium">
            Everyone thinks they&apos;re humble.
          </p>
          <p className="text-base md:text-lg text-secondary/60">
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
              className="font-mono w-full px-5 py-4 text-base bg-white/5 border border-white/10 rounded-xl focus:border-white/30 focus:bg-white/[0.07] focus:outline-none transition-smooth placeholder:text-white/40 hover:border-white/20"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="font-mono w-full mt-3 px-6 py-4 text-base font-bold bg-white text-black rounded-xl hover:bg-white/95 hover:shadow-glow transition-smooth disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-[0.99]"
          >
            {loading ? "Analyzing..." : "Analyze Profile"}
          </button>
        </form>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
          <div className="group p-6 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.04] transition-smooth cursor-default">
            <div className="text-2xl mb-3 group-hover:scale-110 transition-smooth">🎭</div>
            <h3 className="font-mono font-semibold text-sm mb-2 text-foreground">Ego Analysis</h3>
            <p className="text-xs text-secondary/70 leading-relaxed">
              AI-powered analysis of tweets and engagement patterns
            </p>
          </div>
          <div className="group p-6 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.04] transition-smooth cursor-default">
            <div className="text-2xl mb-3 group-hover:scale-110 transition-smooth">💎</div>
            <h3 className="font-mono font-semibold text-sm mb-2 text-foreground">Value Score</h3>
            <p className="text-xs text-secondary/70 leading-relaxed">
              Measure how much value you provide vs. self-promotion
            </p>
          </div>
          <div className="group p-6 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.04] transition-smooth cursor-default">
            <div className="text-2xl mb-3 group-hover:scale-110 transition-smooth">🔥</div>
            <h3 className="font-mono font-semibold text-sm mb-2 text-foreground">Shareable Results</h3>
            <p className="text-xs text-secondary/70 leading-relaxed">
              Beautiful cards designed to share and compare
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
