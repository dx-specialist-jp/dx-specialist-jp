import { useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';

const TAGS = [
  { label: 'AI活用',          icon: '🤖' },
  { label: 'セキュリティ',     icon: '🔒' },
  { label: '行政AI',          icon: '🏛️' },
  { label: '行政DX',          icon: '🗂️' },
  { label: 'クラウド/インフラ', icon: '☁️' },
  { label: '制度/ガイドライン', icon: '📋' },
  { label: '自治体DX事例',     icon: '🏙️' },
  { label: '働き方/業務改革',  icon: '💼' },
];

export default function Sidebar({ open, onClose, tagCounts = {} }) {
  const sidebarRef = useRef(null);
  const closeRef = useRef(null);

  // モバイルでサイドバー開いたとき閉じるボタンにフォーカス
  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
    }
  }, [open]);

  // Escキーでサイドバーを閉じる
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // モバイルでサイドバー開放中はbodyスクロール禁止
  useEffect(() => {
    if (window.innerWidth < 1024) {
      document.body.style.overflow = open ? 'hidden' : '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const linkClass = ({ isActive }) =>
    `sidebar-link${isActive ? ' active' : ''}`;

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`sidebar${open ? ' open' : ''}`}
        aria-label="サイドバーナビゲーション"
        role="navigation"
        aria-modal={open ? 'true' : undefined}
        id="site-sidebar"
      >
        <div className="sidebar-inner">
          {/* 閉じるボタン（モバイルのみ表示） */}
          <button
            ref={closeRef}
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="サイドバーを閉じる"
          >
            ✕
          </button>

          {/* メインナビゲーション */}
          <div className="sidebar-section">
            <p className="sidebar-section-label">ナビゲーション</p>
            <NavLink to="/" end className={linkClass} onClick={onClose}>
              <span className="sidebar-link-icon" aria-hidden="true">📰</span>
              今日のダイジェスト
            </NavLink>
            <NavLink to="/archive" className={linkClass} onClick={onClose}>
              <span className="sidebar-link-icon" aria-hidden="true">📅</span>
              アーカイブ
            </NavLink>
          </div>

          <hr className="sidebar-divider" />

          {/* タグナビゲーション */}
          <div className="sidebar-section">
            <p className="sidebar-section-label">タグで絞り込む</p>
            {TAGS.map(({ label, icon }) => (
              <NavLink
                key={label}
                to={`/tag/${encodeURIComponent(label)}`}
                className={linkClass}
                onClick={onClose}
              >
                <span className="sidebar-link-icon" aria-hidden="true">{icon}</span>
                {label}
                {tagCounts[label] > 0 && (
                  <span className="sidebar-link-badge" aria-label={`${tagCounts[label]}件`}>
                    {tagCounts[label]}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          <hr className="sidebar-divider" />

          {/* サイト情報 */}
          <div className="sidebar-section">
            <p className="sidebar-section-label">サイト情報</p>
            <NavLink to="/about" className={linkClass} onClick={onClose}>
              <span className="sidebar-link-icon" aria-hidden="true">ℹ️</span>
              サイトについて
            </NavLink>
          </div>
        </div>
      </aside>

      {/* オーバーレイ（モバイル） */}
      <div
        className={`sidebar-overlay${open ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
    </>
  );
}
