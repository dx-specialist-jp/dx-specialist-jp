// 使い方: GEMINI_API_KEY=xxx node scripts/regenerate-brief.js [YYYY-MM-DD] ...
//         省略時は最新7日分を対象にする

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { callGemini, parseJsonFromText } from './gemini-utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '..', 'public', 'data');

async function generateBrief(newsTopics, model) {
  if (newsTopics.length === 0) return null;
  const inputJson = JSON.stringify(
    newsTopics.slice(0, 15).map((t) => ({
      title: t.title, summary: t.summary, relevance: t.relevance, category: t.category,
    })),
    null, 2
  );
  const prompt = `あなたは中央省庁のPMO（プロジェクト管理オフィス）・PJMO（プロジェクト管理支援）担当者向けのアドバイザーです。

以下は本日のニューストピック一覧です。
PMO/PJMO担当者が「今日のニュースを受けて、何をすべきか・何を確認すべきか」を即座に把握できる
アクション指向のブリーフィングを作成してください。

【作成ルール】
- 4〜6箇条で、各箇条は1文（50〜80字）
- 必ず「〜を確認する」「〜を検討する」「〜に注意する」「〜を共有する」等のアクション動詞で終わること
- 特定の記事に縛られず、今日のニュース全体を俯瞰してPMO/PJMOが取るべき行動を示す
- セキュリティ関連があれば必ず最初に入れる
- 省庁内での横展開・情報共有が必要なものは明示する
- 「重要」「画期的」等の主観的形容詞は使わない
- 事実ベースで具体的に（例: 「AI調達仕様書のセキュリティ要件を最新のIPA推奨に照合する」）

対象ニューストピック:
${inputJson}

以下のJSON形式のみで出力すること（説明文・コードブロック記号は不要）:
{
  "actions": ["アクション1", "アクション2", "アクション3"]
}`;
  try {
    const text = await callGemini(model, prompt);
    const result = parseJsonFromText(text);
    return Array.isArray(result.actions) ? result.actions.filter((a) => typeof a === 'string') : null;
  } catch (err) {
    console.warn(`[WARN] ブリーフ生成エラー: ${err.message}`);
    return null;
  }
}

async function generateSummary(data, model) {
  const allArticles = [
    ...(data.hero_article ? [{ title: data.hero_article.title, summary: data.hero_article.summary, source: data.hero_article.source_name }] : []),
    ...(data.sub_articles || []).map((a) => ({ title: a.title, summary: a.summary, source: a.source_name })),
    ...(data.news_topics || []).slice(0, 8).map((t) => ({ title: t.title, summary: t.summary, source: t.source })),
  ];
  if (allArticles.length === 0) return null;
  const inputJson = JSON.stringify(allArticles, null, 2);
  const prompt = `あなたは中央省庁のPMO・PJMO担当者向けの行政DX・AI活用の専門キュレーターです。

以下の記事一覧を読んで、PMO/PJMO担当者が「今日知っておくべき重要ポイント」を箇条書きで要約してください。

【要約ルール】
- 4〜6箇条で、各箇条は1行（40〜70字）
- 「何が起きたか・何が変わったか」を事実ベースで端的に
- セキュリティ速報・政府の重要決定・調達・AI活用を優先
- 行政用語は省略せず正式名で記載
- 「重要」「画期的」等の主観的形容詞は使わない

対象記事:
${inputJson}

以下のJSON形式のみで出力すること（説明文・コードブロック記号は不要）:
{
  "points": ["ポイント1", "ポイント2", "ポイント3"]
}`;
  try {
    const text = await callGemini(model, prompt);
    const result = parseJsonFromText(text);
    return Array.isArray(result.points) ? result.points.filter((p) => typeof p === 'string') : null;
  } catch (err) {
    console.warn(`[WARN] サマリー生成エラー: ${err.message}`);
    return null;
  }
}

async function main() {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  if (!process.env.GEMINI_API_KEY) {
    console.error('[ERROR] GEMINI_API_KEY が未設定です');
    process.exit(1);
  }

  let targets = process.argv.slice(2);
  if (targets.length === 0) {
    targets = readdirSync(DATA_DIR)
      .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .sort()
      .slice(-7)
      .map((f) => f.replace('.json', ''));
  }
  console.log(`[INFO] 対象日: ${targets.join(', ')}`);

  for (const date of targets) {
    const path = resolve(DATA_DIR, `${date}.json`);
    let data;
    try {
      data = JSON.parse(readFileSync(path, 'utf-8'));
    } catch {
      console.warn(`[WARN] ${date}.json が見つかりません`);
      continue;
    }

    const topics = data.news_topics || [];
    if (topics.length === 0) {
      console.log(`[INFO] ${date}: ニューストピックなし → スキップ`);
      continue;
    }

    const needsBrief = !data.news_topics_brief || data.news_topics_brief.length === 0;
    const needsSummary = !data.news_summary || data.news_summary.length === 0;
    if (!needsBrief && !needsSummary) {
      console.log(`[INFO] ${date}: brief・summary 既存 → スキップ`);
      continue;
    }

    console.log(`[INFO] ${date}: brief・summary を逐次生成中...`);
    const brief = needsBrief ? await generateBrief(topics, model) : null;
    // brief と summary の間に少し間を置いてレート制限を回避
    if (needsBrief && needsSummary) await new Promise((r) => setTimeout(r, 5000));
    const summary = needsSummary ? await generateSummary(data, model) : null;

    if (brief !== null) data.news_topics_brief = brief;
    if (summary !== null) data.news_summary = summary;

    writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[INFO] ${date}: 更新完了`);

    // 複数日処理時に連続 API 呼び出しでレート制限に当たらないよう日付間で休止
    await new Promise((r) => setTimeout(r, 8000));
  }

  console.log('[INFO] 完了');
}

main().catch((err) => {
  console.error('[ERROR]', err);
  process.exit(1);
});
