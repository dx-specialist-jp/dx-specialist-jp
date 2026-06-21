import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function formatDateJa(dateStr) {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const d = new Date(dateStr + 'T00:00:00+09:00');
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
}

function DateListItem({ item }) {
  const d = new Date(item.date + 'T00:00:00+09:00');
  const month = `${d.getMonth() + 1}月`;
  const day = d.getDate();

  return (
    <Link to={`/day/${item.date}`} className="date-list-item">
      <div className="date-badge" aria-hidden="true">
        <div className="date-badge-month">{month}</div>
        <div className="date-badge-day">{day}</div>
      </div>
      <div className="date-list-body">
        <div className="date-list-summary">{item.summary_short || formatDateJa(item.date)}</div>
        <div className="date-list-meta">
          {item.post_count > 0 && `${item.post_count}件の投稿`}
        </div>
      </div>
      <span className="date-list-arrow" aria-hidden="true">›</span>
    </Link>
  );
}

export default function Home() {
  const [index, setIndex] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/index.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setIndex)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div>
        <div className="error-box">データの読み込みに失敗しました: {error}</div>
      </div>
    );
  }

  if (!index) {
    return <div className="loading">読み込み中...</div>;
  }

  const dates = [...(index.dates || [])].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <p className="page-heading">過去のダイジェスト</p>

      {dates.length === 0 ? (
        <div className="empty-state">
          <strong>まだコンテンツがありません</strong>
          <p>夜間バッチが実行されると、ここに日付が表示されます。</p>
        </div>
      ) : (
        <nav className="date-list" aria-label="日付一覧">
          {dates.map((item) => (
            <DateListItem key={item.date} item={item} />
          ))}
        </nav>
      )}
    </div>
  );
}
