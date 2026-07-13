import { describe, expect, it } from "vitest";
import { judgeRank } from "./rank";
import { buildShareText, buildShareUrl } from "./share";

describe("share", () => {
  it("builds share text with lane label", () => {
    expect(buildShareText("MIDDLE", 14, 20, judgeRank(14, 20))).toBe(
      "LoL検定（MIDレーン）で20問中14問正解、【エメラルド】ランクでした！",
    );
  });

  it("omits lane label for ALL", () => {
    expect(buildShareText("ALL", 20, 20, judgeRank(20, 20))).toBe(
      "LoL検定で20問中20問正解、【チャレンジャー】ランクでした！",
    );
  });

  it("builds a twitter intent URL with encoded params", () => {
    const url = buildShareUrl("テスト", "https://example.com/lol-ken/");
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe(
      "https://twitter.com/intent/tweet",
    );
    expect(parsed.searchParams.get("text")).toBe("テスト");
    expect(parsed.searchParams.get("url")).toBe("https://example.com/lol-ken/");
    expect(parsed.searchParams.get("hashtags")).toBe("LoL検定");
  });
});
