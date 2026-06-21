import SecurityBanner from './SecurityBanner.jsx';
import HeroArticle from './HeroArticle.jsx';
import SubArticles from './SubArticles.jsx';
import NewsTopics from './NewsTopics.jsx';
import DxTip from './DxTip.jsx';

export default function DigestView({ data }) {
  if (!data) return null;

  return (
    <>
      <SecurityBanner alerts={data.security_alerts} />

      <div className="main-content">
        <div className="date-header">
          <p className="date-label">本日のダイジェスト</p>
          <h1 className="date-heading">{data.date_ja || data.date}</h1>
        </div>

        <HeroArticle article={data.hero_article} />
        <SubArticles articles={data.sub_articles} />
        <NewsTopics topics={data.news_topics} />
        <DxTip tip={data.dx_tip} />
      </div>
    </>
  );
}
