import type { Champion, Lane, QuizData } from "../data";
import { pick, type Rng, shuffle } from "../random";
import { championGenerators } from "./champion";
import { itemGenerators } from "./item";
import { runeGenerators } from "./rune";

export type Category = "champion" | "item" | "rune";

export interface Question {
  text: string;
  imageUrl?: string;
  choices: string[];
  answerIndex: number;
  category: Category;
}

export interface GeneratorContext {
  data: QuizData;
  /** champion pool after lane filtering */
  champions: Champion[];
  rng: Rng;
}

/** Returns undefined when the pool cannot produce a valid question. */
export type QuestionGenerator = (ctx: GeneratorContext) => Question | undefined;

export const QUESTION_COUNT = 20;

/** Minimum champions a lane pool needs to build 4-choice questions safely. */
export const MIN_POOL_SIZE = 8;

/**
 * Build 3 distinct wrong choices and mix in the correct one.
 * Returns undefined when the distractor pool is too small.
 */
export function buildChoices(
  rng: Rng,
  correct: string,
  distractors: readonly string[],
): { choices: string[]; answerIndex: number } | undefined {
  const uniq = [...new Set(distractors)].filter((d) => d !== correct);
  if (uniq.length < 3) return undefined;
  const wrong = shuffle(rng, uniq).slice(0, 3);
  const choices = shuffle(rng, [correct, ...wrong]);
  return { choices, answerIndex: choices.indexOf(correct) };
}

export function championPool(data: QuizData, lane: Lane): Champion[] {
  if (lane === "ALL") return data.champions;
  return data.champions.filter((c) => c.positions.includes(lane));
}

/**
 * Build a quiz set. For lane quizzes only champion questions are used
 * (items and runes are not tied to a lane); "ALL" mixes every category.
 */
export function buildQuizSet(
  data: QuizData,
  lane: Lane,
  rng: Rng,
  count = QUESTION_COUNT,
): Question[] {
  const pool = championPool(data, lane);
  const generators: QuestionGenerator[] =
    lane === "ALL"
      ? [...championGenerators, ...itemGenerators, ...runeGenerators]
      : [...championGenerators];

  const ctx: GeneratorContext = { data, champions: pool, rng };
  const questions: Question[] = [];
  const seen = new Set<string>();
  const maxAttempts = count * 30;
  for (let i = 0; i < maxAttempts && questions.length < count; i++) {
    const generate = pick(rng, generators);
    const q = generate(ctx);
    if (!q || seen.has(q.text)) continue;
    seen.add(q.text);
    questions.push(q);
  }
  return questions;
}
