import { useState, useEffect } from 'react';
import DigestView from '../components/DigestView.jsx';
import { Link } from 'react-router-dom';

const BASE = import.meta.env.BASE_URL;

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${BASE}data/index.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`index.json の読み込みに失敗しました (HTTP ${r.status})`);
        return r.json();
      })
      .then((index) => {
        const latestDate = index.dates?.[0]?.date;
        if (!latestDate) throw new Error('データがまだありません');
        return fetch(`${BASE}data/${latestDate}.json`);
      })
      .then((r) => {
        if (!r.ok) throw new Error(`データの読み込みに失敗しました (HTTP ${r.status})`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="main-content">
        <div className="error-box">
          <strong>読み込みエラー:</strong> {error}
          <br />
          <Link to="/archive" style={{ marginTop: '8px', display: 'inline-block' }}>
            アーカイブを確認する →
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="loading">読み込み中...</div>;
  }

  return <DigestView data={data} />;
}
