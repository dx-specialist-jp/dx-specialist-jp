import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home from './pages/Home.jsx';
import DayPage from './pages/DayPage.jsx';
import Archive from './pages/Archive.jsx';
import TagPage from './pages/TagPage.jsx';
import AboutPage from './pages/AboutPage.jsx';

const BASE = import.meta.env.BASE_URL;

function SiteFooter() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner">
        <p className="footer-brand">GovDX Today</p>
        <p className="footer-disclaimer">
          本サイトは公開情報をAIが要約したものです。正確性の保証はありません。必ず出典元をご確認ください。<br />
          掲載情報はすべて公開情報に限定し、機密性情報・個人情報は一切掲載しません。非営利・非商業目的のサイトです。
        </p>
        <nav className="footer-nav" aria-label="フッターナビゲーション">
          <a href="#/">今日のダイジェスト</a>
          <a href="#/archive">アーカイブ</a>
          <a href="#/about">サイトについて・免責事項</a>
        </nav>
      </div>
    </footer>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tagCounts, setTagCounts] = useState({});

  useEffect(() => {
    fetch(`${BASE}data/tags.json`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.tag_counts) setTagCounts(data.tag_counts);
      })
      .catch(() => {});
  }, []);

  return (
    <HashRouter>
      {/* スキップリンク — WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          const el = document.getElementById('main-content');
          if (el) { el.setAttribute('tabindex', '-1'); el.focus(); }
        }}
      >
        メインコンテンツへスキップ
      </a>

      <div className="app-wrapper">
        <Header
          onMenuToggle={() => setSidebarOpen((o) => !o)}
          sidebarOpen={sidebarOpen}
        />

        <div className="app-body">
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            tagCounts={tagCounts}
          />

          <div className="page-content">
            <main id="main-content" tabIndex={-1}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/day/:date" element={<DayPage />} />
                <Route path="/archive" element={<Archive />} />
                <Route path="/tag/:tagName" element={<TagPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </main>
            <SiteFooter />
          </div>
        </div>
      </div>
    </HashRouter>
  );
}
