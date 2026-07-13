export function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const percent = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gold/80 mb-1">
        <span>
          第 {current} 問 / {total} 問
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-deep-blue overflow-hidden">
        <div
          className="h-full rounded-full bg-gold transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
