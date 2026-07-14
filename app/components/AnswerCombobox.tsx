import { useState } from "react";
import type { Candidate } from "~/lib/questions";

/** For English queries: case-insensitive, ignoring spaces and punctuation. */
function normalizeEn(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function candidateLabel(candidate: Candidate): string {
  return candidate.nameEn && candidate.nameEn !== candidate.name
    ? `${candidate.name} (${candidate.nameEn})`
    : candidate.name;
}

const MAX_RESULTS = 8;

/**
 * Hard-mode answer input: a text box filtering the full candidate pool by
 * Japanese or English name.
 */
export function AnswerCombobox({
  candidates,
  onSelect,
}: {
  candidates: Candidate[];
  onSelect: (candidate: Candidate) => void;
}) {
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const trimmed = query.trim();
  const queryEn = normalizeEn(trimmed);
  const matches =
    trimmed === ""
      ? []
      : candidates
          .filter(
            (c) =>
              c.name.includes(trimmed) ||
              (queryEn !== "" &&
                c.nameEn !== undefined &&
                normalizeEn(c.nameEn).includes(queryEn)),
          )
          .slice(0, MAX_RESULTS);
  const highlighted = matches[Math.min(highlight, matches.length - 1)];

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlight(0);
        }}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, matches.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter" && highlighted) {
            e.preventDefault();
            onSelect(highlighted);
          }
        }}
        placeholder="名前で検索して回答（日本語 / English）"
        aria-label="回答を検索"
        className="w-full rounded-lg border border-gold-dark bg-hextech-black/60 px-4 py-3 text-gold-light placeholder:text-gold-light/40 focus:border-gold focus:outline-none"
      />
      {trimmed !== "" && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gold-dark bg-hextech-black shadow-lg">
          {matches.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gold-light/50">該当なし</p>
          ) : (
            matches.map((c, i) => (
              <button
                key={c.name}
                type="button"
                onClick={() => onSelect(c)}
                onMouseEnter={() => setHighlight(i)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  c === highlighted
                    ? "bg-deep-blue/70 text-gold"
                    : "text-gold-light hover:bg-deep-blue/40"
                }`}
              >
                {c.imageUrl && (
                  <img
                    src={c.imageUrl}
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 shrink-0 rounded border border-gold-dark/40"
                  />
                )}
                {candidateLabel(c)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
