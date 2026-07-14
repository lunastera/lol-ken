import type { Position } from "./data";
import type { Rank } from "./rank";
import { laneLabel } from "./selection";

export function buildShareText(
  lanes: readonly Position[],
  correct: number,
  total: number,
  rank: Rank,
  hard = false,
): string {
  const label = [laneLabel(lanes), hard ? "ハード" : ""]
    .filter(Boolean)
    .join(" / ");
  return `LoLもん${label ? `（${label}）` : ""}で${total}問中${correct}問正解、【${rank.label}】ランクでした！`;
}

export function buildShareUrl(text: string, pageUrl: string): string {
  const params = new URLSearchParams({
    text,
    url: pageUrl,
    hashtags: "LoLもん",
  });
  return `https://twitter.com/intent/tweet?${params}`;
}
