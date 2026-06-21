import { useEffect, useRef } from 'react';

export default function XEmbed({ embedHtml, tweetUrl, displayName }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    // Twitter widget.js を初回のみ読み込む
    if (!document.getElementById('twitter-widget-script')) {
      const script = document.createElement('script');
      script.id = 'twitter-widget-script';
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.charset = 'utf-8';
      document.body.appendChild(script);
    }

    // 既に読み込み済みの場合は再パース
    if (window.twttr?.widgets) {
      window.twttr.widgets.load(ref.current);
    }
  }, [embedHtml]);

  if (embedHtml) {
    return (
      <div
        ref={ref}
        dangerouslySetInnerHTML={{ __html: embedHtml }}
        style={{ minHeight: '100px' }}
      />
    );
  }

  // embedHtml がない場合のフォールバック
  return (
    <div ref={ref}>
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: '14px', color: 'var(--secondary)' }}
      >
        {displayName ? `@${displayName} の投稿を見る →` : '投稿を見る →'}
      </a>
    </div>
  );
}
