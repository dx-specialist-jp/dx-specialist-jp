import { useState } from 'react';

export default function SecurityBanner({ alerts }) {
  const [expanded, setExpanded] = useState(false);

  if (!alerts || alerts.length === 0) return null;

  const visible = expanded ? alerts : alerts.slice(0, 1);
  const hasMore = alerts.length > 1;

  return (
    <div className="security-banner" role="alert" aria-label="セキュリティ速報">
      {visible.map((alert, i) => (
        <div key={i} className="security-banner-inner">
          <span className="security-banner-label">セキュリティ速報</span>
          <div>
            <span className="security-banner-title">{alert.title}</span>
            {alert.url && (
              <a
                href={alert.url}
                className="security-banner-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                詳細を確認 →
              </a>
            )}
          </div>
        </div>
      ))}
      {hasMore && (
        <div className="security-banner-toggle">
          <button
            className="security-banner-more-btn"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
          >
            {expanded
              ? '閉じる ▲'
              : `他 ${alerts.length - 1} 件の速報を見る ▼`}
          </button>
        </div>
      )}
    </div>
  );
}
