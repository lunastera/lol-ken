import { describe, expect, it } from "vitest";
import { judgeRank, RANKS } from "./rank";

describe("judgeRank", () => {
  it("maps 20-question scores to the documented thresholds", () => {
    const expected: [number, string][] = [
      [0, "IRON"],
      [2, "IRON"],
      [3, "BRONZE"],
      [4, "BRONZE"],
      [5, "SILVER"],
      [6, "SILVER"],
      [7, "GOLD"],
      [9, "GOLD"],
      [10, "PLATINUM"],
      [12, "PLATINUM"],
      [13, "EMERALD"],
      [14, "EMERALD"],
      [15, "DIAMOND"],
      [16, "DIAMOND"],
      [17, "MASTER"],
      [18, "MASTER"],
      [19, "GRANDMASTER"],
      [20, "CHALLENGER"],
    ];
    for (const [correct, id] of expected) {
      expect(judgeRank(correct, 20).id, `score ${correct}`).toBe(id);
    }
  });

  it("is monotonic for any total", () => {
    for (const total of [5, 10, 20, 30]) {
      let prevIndex = 0;
      for (let correct = 0; correct <= total; correct++) {
        const index = RANKS.indexOf(judgeRank(correct, total));
        expect(index).toBeGreaterThanOrEqual(prevIndex);
        prevIndex = index;
      }
      expect(judgeRank(total, total).id).toBe("CHALLENGER");
      expect(judgeRank(0, total).id).toBe("IRON");
    }
  });
});
