/**
 * Twitter-style tweet embed component
 */
import Image from 'next/image';

interface TweetEmbedProps {
  profileImageUrl: string;
  displayName: string;
  username: string;
  text: string;
  variant: 'egotistical' | 'valuable';
}

export default function TweetEmbed({
  profileImageUrl,
  displayName,
  username,
  text,
  variant,
}: TweetEmbedProps) {
  const borderColor = variant === 'egotistical' ? 'border-red-500/30' : 'border-green-500/30';
  const accentColor = variant === 'egotistical' ? 'text-red-400' : 'text-green-400';
  const icon = variant === 'egotistical' ? '🔥' : '💎';
  const title = variant === 'egotistical' ? 'Most Egotistical Tweet' : 'Most Valuable Tweet';

  return (
    <div className={`bg-white/5 backdrop-blur-sm border-2 ${borderColor} rounded-2xl overflow-hidden`}>
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className={accentColor}>{title}</span>
        </h3>
      </div>

      {/* Tweet content - styled like Twitter/X */}
      <div className="p-4">
        {/* Profile row */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
            <Image
              src={profileImageUrl}
              alt={displayName}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-bold text-white truncate">{displayName}</span>
            </div>
            <div className="text-sm text-secondary">@{username}</div>
          </div>
        </div>

        {/* Tweet text */}
        <div className="text-white text-[15px] leading-relaxed break-words whitespace-pre-wrap">
          {text}
        </div>
      </div>
    </div>
  );
}
