---
name: verify
description: lol-ken (React Router SPA) をローカルで起動し、ブラウザで検定フローを一通り駆動して検証する手順
---

# lol-ken の検証手順

## 起動

```sh
npm run dev   # http://localhost:5173
```

## ブラウザ駆動

Playwright ブラウザは未インストール。`playwright-core` + システム Chrome を使う:

```js
const browser = await chromium.launch({ channel: "chrome", headless: true });
```

## 検証すべきフロー

1. `/` — 6 つの検定リンク（総合/TOP/JG/MID/ADC/SUP）が表示される
2. `/quiz?lane=MIDDLE` — 20 問回答。選択肢ボタンは `main button` の先頭 4 つ。
   回答後に `正解！`/`不正解…` が出て、`次の問題へ`（最終問は `結果を見る`）が現れる
3. `/result` — スコア・ランクバッジ・X シェアリンク（`twitter.com/intent`、レーン名入り）
4. プローブ: `?lane=BOGUS` → 総合にフォールバック / `?seed=N` 固定で同一出題 /
   レーン指定時は全問カテゴリ「チャンピオン」

## 注意

- クイズ完了直後の同一タブで `/result` を reload すると history.state に結果が
  残っているため結果が再表示される（仕様）。直接アクセスの検証は新規タブ/コンテキストで。
- GitHub Pages 相当のビルド確認: `GITHUB_REPOSITORY=lunastera/lol-ken npm run build`
  → `build/client/index.html` のアセットパスが `/lol-ken/` 始まり、`404.html` が存在すること。
