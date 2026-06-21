/**
 * generate-content.js
 * 毎日の行政DX・AI関連X投稿を収集し、Gemini APIで要約して
 * public/data/ に JSON として保存する。
 *
 * 使用方法:
 *   GEMINI_API_KEY=xxx node scripts/generate-content.js
 *
 * 環境変数:
 *   GEMINI_API_KEY   - Google Gemini API キー（必須）
 *   RSSHUB_BASE_URL  - RSSHub のベース URL（省略時: https://rsshub.app）
 *   TARGET_DATE      - 対象日 YYYY-MM-DD（省略時: 今日 JST）
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT, 'public', 'data');

// ── 対象アカウント設定 ────────────────────────────────────────────────
const X_ACCOUNTS = [
  { username: 'digital_jpn',    displayName: 'デジタル庁' },
  { username: 'MIC_JAPAN',      displayName: '総務省' },
  { username: 'nisc_csirt',     displayName: 'NISC' },
  { username: 'IPAj_security',  displayName: 'IPA セキュリティセンター' },
  { username: 'cao_ad',         displayName: '内閣府' },
];

// ── 日付ユーティリティ ─────────────────────────────────────────────────
function getTodayJST() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateJa(dateStr) {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const d = new Date(dateStr + 'T00:00:00+09:00');
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
}

// ── RSSHub からフィード取得 ────────────────────────────────────────────
async function fetchRSSHub(username, baseUrl) {
  const url = `${baseUrl}/twitter/user/${username}`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'GovDX-Today/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return parseRSS(xml, username);
  } catch (err) {
    console.warn(`[WARN] RSSHub fetch failed for @${username}: ${err.message}`);
    return [];
  }
}

function parseRSS(xml, username) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = stripTags(extractTag(block, 'title')).trim();
    const link = extractTag(block, 'link').trim();
    const pubDate = extractTag(block, 'pubDate').trim();

    if (!link || !link.includes('twitter.com')) continue;

    const tweetId = link.match(/status\/(\d+)/)?.[1];
    if (!tweetId) continue;

    // 24時間以内の投稿のみ
    if (pubDate && Date.now() - new Date(pubDate).getTime() > 25 * 60 * 60 * 1000) continue;

    items.push({ tweetId, tweetUrl: link, text: title, username });
  }
  return items;
}

function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? (m[1] ?? m[2] ?? '') : '';
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// ── X embed HTML 生成 ─────────────────────────────────────────────────
function buildEmbedHtml(post) {
  return [
    `<blockquote class="twitter-tweet" data-lang="ja">`,
    `<p lang="ja" dir="ltr">${escapeHtml(post.text)}</p>`,
    `&mdash; ${escapeHtml(post.displayName || post.username)} (@${escapeHtml(post.username)})`,
    ` <a href="${escapeHtml(post.tweetUrl)}">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</a>`,
    `</blockquote>`,
  ].join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Gemini API で要約生成 ──────────────────────────────────────────────
async function generateSummaryWithGemini(posts, apiKey) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genai = new GoogleGenerativeAI(apiKey);
  const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const postsText = posts
    .map((p, i) => `[${i + 1}] @${p.username}（${p.displayName}）: ${p.text}`)
    .join('\n');

  const prompt = `あなたは中央省庁PMO/PJMO向け情報キュレーターです。
以下の行政DX・AI関連のX投稿を、PMO/PJMO職員向けに簡潔にまとめてください。

【投稿一覧】
${postsText}

【要約ルール】
- 全体を3〜5行（400字以内）で簡潔にまとめる
- 各投稿の要点を①②③…の番号付きで整理する
- 「PMO/PJMOにとって何が重要か」の観点を含める
- 事実のみを記載し、推測や私見を含めない
- 日本語で回答すること

要約のみを出力し、前置きや後書きは不要です。`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

function generateTemplateSummary(posts, date) {
  const accounts = [...new Set(posts.map((p) => p.displayName || p.username))];
  return `本日（${formatDateJa(date)}）の行政DX・AI関連X投稿まとめ。\n\n${accounts.join('・')}より計${posts.length}件の投稿がありました。\n\n各省庁の最新情報については、出典元のXアカウントをご確認ください。\n\n※ API制限のため詳細な要約は省略されています。`;
}

// ── index.json の更新 ─────────────────────────────────────────────────
function updateIndex(date, summaryShort, postCount) {
  const indexPath = resolve(DATA_DIR, 'index.json');
  let index = { dates: [] };
  try {
    index = JSON.parse(readFileSync(indexPath, 'utf-8'));
  } catch {
    // 存在しない場合は新規作成
  }

  index.dates = index.dates.filter((d) => d.date !== date);
  index.dates.unshift({ date, summary_short: summaryShort, post_count: postCount });
  // 最大 90 日分を保持
  index.dates = index.dates.slice(0, 90);

  writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
  console.log(`[INFO] index.json を更新しました（合計 ${index.dates.length} 日分）`);
}

// ── メイン処理 ────────────────────────────────────────────────────────
async function main() {
  const targetDate = process.env.TARGET_DATE || getTodayJST();
  const rsshubBase = process.env.RSSHUB_BASE_URL || 'https://rsshub.app';
  const geminiKey = process.env.GEMINI_API_KEY;

  console.log(`[INFO] 対象日: ${targetDate}`);
  console.log(`[INFO] RSSHub: ${rsshubBase}`);

  mkdirSync(DATA_DIR, { recursive: true });

  // ① 各アカウントから投稿を収集
  const allPosts = [];
  for (const account of X_ACCOUNTS) {
    console.log(`[INFO] @${account.username} の投稿を取得中...`);
    const posts = await fetchRSSHub(account.username, rsshubBase);
    for (const post of posts) {
      allPosts.push({
        ...post,
        displayName: account.displayName,
        embed_html: buildEmbedHtml({ ...post, displayName: account.displayName }),
      });
    }
    console.log(`[INFO]   → ${posts.length} 件取得`);
  }

  console.log(`[INFO] 合計 ${allPosts.length} 件の投稿を収集`);

  // ② AI 要約生成
  let aiSummary = '';
  let isTemplateSummary = false;

  if (allPosts.length === 0) {
    aiSummary = `本日（${formatDateJa(targetDate)}）は収集された投稿がありませんでした。`;
    isTemplateSummary = true;
  } else if (!geminiKey) {
    console.warn('[WARN] GEMINI_API_KEY が設定されていません。テンプレート要約を使用します。');
    aiSummary = generateTemplateSummary(allPosts, targetDate);
    isTemplateSummary = true;
  } else {
    try {
      console.log('[INFO] Gemini API で要約を生成中...');
      aiSummary = await generateSummaryWithGemini(allPosts, geminiKey);
      console.log('[INFO] 要約生成完了');
    } catch (err) {
      const is429 = err.message?.includes('429') || err.status === 429;
      console.warn(`[WARN] Gemini API エラー${is429 ? '（429: レート制限）' : ''}: ${err.message}`);
      aiSummary = generateTemplateSummary(allPosts, targetDate);
      isTemplateSummary = true;
    }
  }

  // ③ JSON 保存
  const dayData = {
    date: targetDate,
    date_ja: formatDateJa(targetDate),
    ai_summary: aiSummary,
    is_template_summary: isTemplateSummary,
    posts: allPosts.map((p) => ({
      tweet_id: p.tweetId,
      username: p.username,
      display_name: p.displayName,
      tweet_url: p.tweetUrl,
      text: p.text,
      embed_html: p.embed_html,
    })),
    generated_at: new Date().toISOString(),
  };

  const outPath = resolve(DATA_DIR, `${targetDate}.json`);
  writeFileSync(outPath, JSON.stringify(dayData, null, 2), 'utf-8');
  console.log(`[INFO] ${outPath} を保存しました`);

  // ④ index.json 更新
  const summaryShort = allPosts.length > 0
    ? `${[...new Set(allPosts.map((p) => p.displayName))].slice(0, 3).join('・')}など ${allPosts.length}件`
    : '投稿なし';
  updateIndex(targetDate, summaryShort, allPosts.length);

  console.log('[INFO] 完了');
}

main().catch((err) => {
  console.error('[ERROR]', err);
  process.exit(1);
});
