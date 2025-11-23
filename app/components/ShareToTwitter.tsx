"use client";

import { useState } from 'react';
import html2canvas from 'html2canvas';

interface ShareToTwitterProps {
  username: string;
  displayName: string;
  overallScore: number;
  tier: string;
  tierEmoji: string;
  percentile?: number;
  cardRef: React.RefObject<HTMLDivElement>;
}

export default function ShareToTwitter({
  username,
  displayName,
  overallScore,
  tier,
  tierEmoji,
  percentile,
  cardRef
}: ShareToTwitterProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const shareToTwitter = async () => {
    try {
      setIsGenerating(true);

      // Generate screenshot of the card
      if (cardRef.current) {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: '#0A0A0A',
          scale: 2, // Higher quality
          logging: false,
        });

        // Convert to blob
        canvas.toBlob(async (blob) => {
          if (!blob) return;

          // Create a file
          const file = new File([blob], 'ego-index-score.png', { type: 'image/png' });

          // Check if Web Share API is available (mobile)
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: 'My Ego Index Score',
                text: generateTweetText(),
              });
              setIsGenerating(false);
              return;
            } catch (err) {
              console.log('Share failed:', err);
            }
          }

          // Fallback: Open Twitter with text (desktop)
          const tweetText = generateTweetText();
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
          window.open(twitterUrl, '_blank', 'noopener,noreferrer');

          // Also download the image
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ego-index-${username}.png`;
          a.click();
          URL.revokeObjectURL(url);

          setIsGenerating(false);
        }, 'image/png');
      }
    } catch (error) {
      console.error('Failed to generate screenshot:', error);
      // Fallback to text-only tweet
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(generateTweetText())}`;
      window.open(twitterUrl, '_blank', 'noopener,noreferrer');
      setIsGenerating(false);
    }
  };

  const generateTweetText = () => {
    const percentileText = percentile ? ` (Top ${100 - percentile}%)` : '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://egoindex.com';

    return `Just got "${tier}" ${tierEmoji} on Ego Index: ${overallScore}/100${percentileText}

Check your ego score at ${baseUrl}`;
  };

  return (
    <button
      onClick={shareToTwitter}
      disabled={isGenerating}
      className="font-mono px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-white/95 hover:shadow-glow transition-smooth active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? 'Generating...' : 'Share to X →'}
    </button>
  );
}
