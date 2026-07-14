import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AnswerCombobox, candidateLabel } from "~/components/AnswerCombobox";
import { ChoiceButton } from "~/components/ChoiceButton";
import { ProgressBar } from "~/components/ProgressBar";
import { QuestionCard } from "~/components/QuestionCard";
import { loadQuizData } from "~/lib/data";
import { buildQuizSet, type Candidate } from "~/lib/questions";
import { createRng, randomSeed } from "~/lib/random";
import { laneLabel, parseSelection } from "~/lib/selection";
import type { Route } from "./+types/quiz";
import type { AnswerRecord } from "./result";

export async function clientLoader() {
  return loadQuizData();
}

/** What the user answered on the current question. */
interface Answered {
  /** index into choices (4-choice mode), null in hard mode */
  choiceIndex: number | null;
  label: string;
  correct: boolean;
  /** skipped without answering (counts as incorrect) */
  skipped?: boolean;
}

export default function Quiz({ loaderData: data }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selection = useMemo(() => parseSelection(searchParams), [searchParams]);
  // Keep the seed stable across re-renders so the question set never shifts
  // mid-quiz; a fresh visit gets a fresh seed.
  const [seed] = useState(() => {
    const fromUrl = Number(searchParams.get("seed"));
    return Number.isSafeInteger(fromUrl) && fromUrl > 0
      ? fromUrl
      : randomSeed();
  });
  const questions = useMemo(
    () => buildQuizSet(data, selection, createRng(seed)),
    [data, selection, seed],
  );

  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<Answered | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [records, setRecords] = useState<AnswerRecord[]>([]);

  // Warm the browser cache for every image in the set so later questions
  // render without a visible load.
  useEffect(() => {
    for (const q of questions) {
      for (const url of [q.imageUrl, ...(q.choiceImageUrls ?? [])]) {
        if (url) new Image().src = url;
      }
    }
  }, [questions]);

  if (questions.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-4 py-10 text-center">
        <p>この条件では問題を生成できませんでした。</p>
        <Link to="/" className="mt-4 inline-block text-gold underline">
          トップへ戻る
        </Link>
      </main>
    );
  }

  const question = questions[index];
  const answer = question.choices[question.answerIndex];
  const revealed = answered !== null;
  const isLast = index + 1 >= questions.length;
  const label = [laneLabel(selection.lanes), selection.hard ? "ハード" : ""]
    .filter(Boolean)
    .join(" / ");
  const title = label ? `LoLもん（${label}）` : "LoLもん";
  const hardMode = question.candidates !== undefined;
  const answerCandidate = question.candidates?.find((c) => c.name === answer);

  const answerWith = (partial: Answered) => {
    if (revealed) return;
    setAnswered(partial);
    if (partial.correct) setCorrectCount((c) => c + 1);
    setRecords((prev) => [
      ...prev,
      {
        text: question.text,
        detail: question.detail,
        imageUrl: question.imageUrl,
        answer: answerCandidate ? candidateLabel(answerCandidate) : answer,
        answerImageUrl:
          answerCandidate?.imageUrl ??
          question.choiceImageUrls?.[question.answerIndex],
        given: partial.label,
        correct: partial.correct,
        skipped: partial.skipped,
      },
    ]);
  };

  const chooseButton = (choiceIndex: number) => {
    answerWith({
      choiceIndex,
      label: question.choices[choiceIndex],
      correct: choiceIndex === question.answerIndex,
    });
  };

  const chooseCandidate = (candidate: Candidate) => {
    answerWith({
      choiceIndex: null,
      label: candidateLabel(candidate),
      correct: candidate.name === answer,
    });
  };

  const skip = () => {
    answerWith({
      choiceIndex: null,
      label: "スキップ",
      correct: false,
      skipped: true,
    });
  };

  const next = () => {
    if (isLast) {
      navigate("/result", {
        state: {
          lanes: selection.lanes,
          types: selection.types,
          count: selection.count,
          hard: selection.hard,
          correct: correctCount,
          total: questions.length,
          records,
        },
        replace: true,
      });
      return;
    }
    setIndex(index + 1);
    setAnswered(null);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-5 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-black text-gold">{title}</h1>
        <Link to="/" className="text-xs text-gold-light/60 hover:text-gold">
          中断してトップへ
        </Link>
      </header>

      <ProgressBar current={index + 1} total={questions.length} />

      <QuestionCard question={question} />

      {hardMode ? (
        !revealed && (
          <AnswerCombobox
            // Reset the input between questions.
            key={index}
            candidates={question.candidates ?? []}
            onSelect={chooseCandidate}
          />
        )
      ) : (
        <div className="flex flex-col gap-2">
          {question.choices.map((choice, i) => (
            <ChoiceButton
              key={choice}
              label={choice}
              iconUrl={question.choiceImageUrls?.[i]}
              tooltip={question.choiceTooltips?.[i]}
              revealed={revealed}
              isAnswer={i === question.answerIndex}
              isSelected={i === answered?.choiceIndex}
              onClick={() => chooseButton(i)}
            />
          ))}
        </div>
      )}

      {!revealed && (
        <button
          type="button"
          onClick={skip}
          className="self-center text-xs text-gold-light/50 underline underline-offset-4 transition-colors hover:text-gold cursor-pointer"
        >
          答えずにスキップ（不正解扱い）
        </button>
      )}

      {answered && (
        <div className="flex flex-col items-center gap-3">
          <p
            className={`text-lg font-bold ${
              answered.skipped
                ? "text-gold-light/60"
                : answered.correct
                  ? "text-hextech-blue"
                  : "text-red-400"
            }`}
          >
            {answered.skipped
              ? "スキップしました"
              : answered.correct
                ? "正解！"
                : "不正解…"}
          </p>
          {hardMode && (
            <div className="flex flex-col items-center gap-1 text-sm">
              <p className="flex items-center gap-2 text-blue-light">
                {answerCandidate?.imageUrl && (
                  <img
                    src={answerCandidate.imageUrl}
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded border border-gold-dark/40"
                  />
                )}
                正解:{" "}
                {answerCandidate ? candidateLabel(answerCandidate) : answer}
              </p>
              {!answered.correct && !answered.skipped && (
                <p className="text-red-300/80">
                  あなたの回答: {answered.label}
                </p>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={next}
            className="w-full rounded-lg border border-gold bg-gold/10 px-4 py-3 font-bold text-gold transition-colors hover:bg-gold/20 cursor-pointer"
          >
            {isLast ? "結果を見る" : "次の問題へ"}
          </button>
        </div>
      )}
    </main>
  );
}
