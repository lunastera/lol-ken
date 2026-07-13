import type { Rank } from "~/lib/rank";

export function RankBadge({ rank }: { rank: Rank }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex h-36 w-36 items-center justify-center rounded-full border-4 bg-hextech-black/80"
        style={{
          borderColor: rank.color,
          boxShadow: `0 0 32px ${rank.color}55`,
        }}
      >
        <span
          className="text-xl font-black tracking-wide"
          style={{ color: rank.color }}
        >
          {rank.label}
        </span>
      </div>
      <p className="text-sm text-gold-light/80">{rank.comment}</p>
    </div>
  );
}
