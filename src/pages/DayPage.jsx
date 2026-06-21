import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import XEmbed from '../components/XEmbed.jsx';

function formatDateJa(dateStr) {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const d = new Date(dateStr + 'T00:00:00+09:00');
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
}

function formatGeneratedAt(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return `更新: ${d.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', hour12: false })} JST`;
  } catch {
    return '';
  }
}

export default function DayPage() {
  const { date } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!date) return;
    fetch(`${import.meta.env.BASE_URL}data/${date}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [date]);

  if (error) {
    return (
      <div>
        <Link to="/" className="back-link">← 一覧に戻る</Link>
        <div className="error-box">
          データが見つかりません（{date}）: {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div>
      <Link to="/" className="back-link">← 一覧に戻る</Link>

      <h1 className="day-date-heading">
        {data.date_ja || formatDateJa(data.date)}
      </h1>
      <p className="day-generated">{formatGeneratedAt(data.generated_at)}</p>

      {/* AI 要約 */}
      {data.ai_summary && (
        <section aria-labelledby="summary-label">
          <p className="section-label" id="summary-label">🤖 今日のAI要約</p>
          <div className="summary-card">
            <p className="summary-text">{data.ai_summary}</p>
            {data.is_template_summary && (
              <p className="summary-template-note">
                ※ API制限のためテンプレート要約を表示しています
              </p>
            )}
          </div>
        </section>
      )}

      {/* X 投稿一覧 */}
      {data.posts && data.posts.length > 0 && (
        <section aria-labelledby="posts-label">
          <p className="section-label" id="posts-label">
            🐦 X 投稿 ({data.posts.length}件)
          </p>
          <div className="posts-section">
            {data.posts.map((post, i) => (
              <article key={post.tweet_id || i} className="post-card">
                <div className="post-source">{post.display_name || post.username}</div>
                <XEmbed
                  embedHtml={post.embed_html}
                  tweetUrl={post.tweet_url}
                  displayName={post.username}
                />
              </article>
            ))}
          </div>
        </section>
      )}

      {(!data.posts || data.posts.length === 0) && (
        <div className="empty-state">
          <strong>この日の投稿はありません</strong>
          <p>収集された投稿がない日は非表示になります。</p>
        </div>
      )}
    </div>
  );
}
