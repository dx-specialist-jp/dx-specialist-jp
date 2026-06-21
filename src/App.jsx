import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import DayPage from './pages/DayPage.jsx';
import Archive from './pages/Archive.jsx';

export default function App() {
  return (
    <HashRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/day/:date" element={<DayPage />} />
        <Route path="/archive" element={<Archive />} />
      </Routes>
      <footer className="site-footer" role="contentinfo">
        <div className="footer-inner">
          <p className="footer-disclaimer">
            本サイトは公開情報をAIが要約したものです。正確性は出典元をご確認ください。<br />
            掲載情報はすべて公開情報に限定しており、機密情報・個人情報は一切含みません。
          </p>
          <nav className="footer-links" aria-label="フッターナビゲーション">
            <a href="#/archive">過去記事アーカイブ</a>
          </nav>
        </div>
      </footer>
    </HashRouter>
  );
}
