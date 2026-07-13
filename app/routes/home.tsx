import { Link } from "react-router";
import { LANE_LABELS, type Lane, loadQuizData } from "~/lib/data";
import { championPool, MIN_POOL_SIZE, QUESTION_COUNT } from "~/lib/questions";
import type { Route } from "./+types/home";

export async function clientLoader() {
  return loadQuizData();
}

const LANE_DESCRIPTIONS: Record<Lane, string> = {
  ALL: "チャンピオン・アイテム・ルーンから満遍なく出題",
  TOP: "トップレーナー向け",
  JUNGLE: "ジャングラー向け",
  MIDDLE: "ミッドレーナー向け",
  BOTTOM: "ADC（ボット）向け",
  UTILITY: "サポート向け",
};

export default function Home({ loaderData: data }: Route.ComponentProps) {
  const lanes = (Object.keys(LANE_LABELS) as Lane[]).filter(
    (lane) => championPool(data, lane).length >= MIN_POOL_SIZE,
  );
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 py-10">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-black tracking-wide text-gold">LoL検定</h1>
        <p className="mt-3 text-sm leading-relaxed text-gold-light/80">
          League of Legends の知識を試す全{QUESTION_COUNT}問の検定クイズ。
          <br />
          正解数に応じてあなたのランクを判定します。
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-gold/80">
          受験する検定を選んでください
        </h2>
        {lanes.map((lane) => (
          <Link
            key={lane}
            to={`/quiz?lane=${lane}`}
            className="group rounded-xl border border-gold-dark bg-hextech-black/60 px-5 py-4 transition-colors hover:border-gold hover:bg-deep-blue/60"
          >
            <span className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-gold-light group-hover:text-gold">
                {LANE_LABELS[lane]}検定
              </span>
              <span className="text-xs text-gold-light/60">
                {LANE_DESCRIPTIONS[lane]}
              </span>
            </span>
          </Link>
        ))}
      </section>

      <footer className="mt-auto pt-12 text-center text-xs leading-relaxed text-gold-light/40">
        <p>
          ゲームデータ: Riot Data Dragon v{data.version} / レーン情報: Meraki
          Analytics
        </p>
        <p className="mt-1">
          LoL検定は Riot Games 非公式のファンコンテンツです。League of Legends
          は Riot Games, Inc. の商標です。
        </p>
      </footer>
    </main>
  );
}
