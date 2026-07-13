import { LANE_LABELS, type Lane } from "./data";
import type { Rank } from "./rank";

export function buildShareText(
  lane: Lane,
  correct: number,
  total: number,
  rank: Rank,
): string {
  const laneLabel = lane === "ALL" ? "" : `${LANE_LABELS[lane]}レーン`;
  return `LoL検定${laneLabel ? `（${laneLabel}）` : ""}で${total}問中${correct}問正解、【${rank.label}】ランクでした！`;
}

export function buildShareUrl(text: string, pageUrl: string): string {
  const params = new URLSearchParams({
    text,
    url: pageUrl,
    hashtags: "LoL検定",
  });
  return `https://twitter.com/intent/tweet?${params}`;
}
