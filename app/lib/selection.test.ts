import { describe, expect, it } from "vitest";
import { DEFAULT_CHECKED_TYPES, DEFAULT_SELECTION } from "./questions";
import { laneLabel, parseSelection, selectionToSearch } from "./selection";

describe("DEFAULT_CHECKED_TYPES", () => {
  it("starts with 称号 and アイテム価格 unchecked", () => {
    expect(DEFAULT_CHECKED_TYPES).not.toContain("title");
    expect(DEFAULT_CHECKED_TYPES).not.toContain("item-price");
    expect(DEFAULT_CHECKED_TYPES.length).toBe(
      DEFAULT_SELECTION.types.length - 2,
    );
  });
});

describe("parseSelection", () => {
  it("falls back to everything when params are missing", () => {
    expect(parseSelection(new URLSearchParams())).toEqual({
      ...DEFAULT_SELECTION,
      count: 20,
    });
  });

  it("parses lanes and types, dropping invalid entries", () => {
    const sel = parseSelection(
      new URLSearchParams("lanes=TOP,BOGUS,MIDDLE&types=title,nope,item-price"),
    );
    expect(sel.lanes).toEqual(["TOP", "MIDDLE"]);
    expect(sel.types).toEqual(["title", "item-price"]);
  });

  it("falls back to everything when params are entirely invalid", () => {
    const sel = parseSelection(new URLSearchParams("lanes=BOGUS&types=nope"));
    expect(sel).toEqual({ ...DEFAULT_SELECTION, count: 20 });
  });

  it("parses count, rejecting values outside the options", () => {
    expect(parseSelection(new URLSearchParams("count=10")).count).toBe(10);
    expect(parseSelection(new URLSearchParams("count=15")).count).toBe(20);
    expect(parseSelection(new URLSearchParams()).count).toBe(20);
  });
});

describe("selectionToSearch", () => {
  it("omits params when everything is selected", () => {
    expect(selectionToSearch(DEFAULT_SELECTION)).toBe("");
  });

  it("encodes subsets in canonical order", () => {
    const search = selectionToSearch({
      lanes: ["MIDDLE", "TOP"],
      types: ["item-price", "title"],
    });
    expect(search).toBe("?lanes=TOP%2CMIDDLE&types=title%2Citem-price");
  });

  it("encodes count only when it differs from the default", () => {
    const full = { lanes: [...DEFAULT_SELECTION.lanes] };
    expect(
      selectionToSearch({
        ...full,
        types: [...DEFAULT_SELECTION.types],
        count: 20,
      }),
    ).toBe("");
    expect(
      selectionToSearch({
        ...full,
        types: [...DEFAULT_SELECTION.types],
        count: 50,
      }),
    ).toBe("?count=50");
  });

  it("round-trips through parseSelection", () => {
    const selection = {
      lanes: ["TOP", "UTILITY"],
      types: ["skill", "rune-style"],
    } as const;
    const search = selectionToSearch({
      lanes: [...selection.lanes],
      types: [...selection.types],
    });
    const parsed = parseSelection(new URLSearchParams(search));
    expect(parsed.lanes).toEqual(["TOP", "UTILITY"]);
    expect(parsed.types).toEqual(["skill", "rune-style"]);
  });
});

describe("laneLabel", () => {
  it("joins subset labels in lane order", () => {
    expect(laneLabel(["MIDDLE", "TOP"])).toBe("TOP・MID");
  });

  it("is empty when all or no lanes are selected", () => {
    expect(laneLabel(["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"])).toBe(
      "",
    );
    expect(laneLabel([])).toBe("");
  });
});
