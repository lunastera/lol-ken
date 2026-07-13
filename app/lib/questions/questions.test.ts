import { describe, expect, it } from "vitest";
import quizDataJson from "../../../public/data/quiz-data.json";
import type { QuizData } from "../data";
import { createRng } from "../random";
import { buildChoices, buildQuizSet, championPool } from "./index";

const data = quizDataJson as unknown as QuizData;

describe("buildChoices", () => {
  it("places the correct answer at answerIndex with 4 unique choices", () => {
    const rng = createRng(1);
    const built = buildChoices(rng, "A", ["B", "C", "D", "E", "A"]);
    expect(built).toBeDefined();
    expect(built?.choices).toHaveLength(4);
    expect(new Set(built?.choices).size).toBe(4);
    expect(built?.choices[built.answerIndex]).toBe("A");
  });

  it("returns undefined when there are fewer than 3 distractors", () => {
    const rng = createRng(1);
    expect(buildChoices(rng, "A", ["B", "B", "A"])).toBeUndefined();
  });
});

describe("buildQuizSet", () => {
  it("builds 20 well-formed unique questions for ALL", () => {
    const questions = buildQuizSet(data, "ALL", createRng(42));
    expect(questions).toHaveLength(20);
    const texts = new Set(questions.map((q) => q.text));
    expect(texts.size).toBe(20);
    for (const q of questions) {
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices).size).toBe(4);
      expect(q.answerIndex).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex).toBeLessThan(4);
    }
  });

  it("is deterministic for a given seed", () => {
    const a = buildQuizSet(data, "ALL", createRng(7));
    const b = buildQuizSet(data, "ALL", createRng(7));
    expect(a).toEqual(b);
  });

  it("mixes categories for ALL", () => {
    const questions = buildQuizSet(data, "ALL", createRng(42));
    const categories = new Set(questions.map((q) => q.category));
    expect(categories.size).toBeGreaterThan(1);
  });

  for (const lane of [
    "TOP",
    "MIDDLE",
    "JUNGLE",
    "BOTTOM",
    "UTILITY",
  ] as const) {
    it(`restricts ${lane} quizzes to champions of that lane`, () => {
      const questions = buildQuizSet(data, lane, createRng(42));
      expect(questions).toHaveLength(20);

      const poolNames = new Set(championPool(data, lane).map((c) => c.name));
      const allNames = new Set(data.champions.map((c) => c.name));
      for (const q of questions) {
        expect(q.category).toBe("champion");
        // Any choice that is a champion name must come from the lane pool.
        for (const choice of q.choices) {
          if (allNames.has(choice)) {
            expect(poolNames, `${q.text} -> ${choice}`).toContain(choice);
          }
        }
      }
    });
  }
});
