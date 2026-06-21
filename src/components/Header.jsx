import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="site-header" role="banner">
      <div className="header-inner">
        <Link to="/" className="site-title" aria-label="GovDX Today トップページ">
          GovDX Today
        </Link>
        <span className="site-tagline">行政DX・AI活用 X投稿ダイジェスト</span>
      </div>
    </header>
  );
}
