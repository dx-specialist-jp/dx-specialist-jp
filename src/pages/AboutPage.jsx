export default function AboutPage() {
  return (
    <>
      <div className="page-dark-header">
        <div className="page-dark-header-inner">
          <p className="page-dark-eyebrow">About</p>
          <h1 className="page-dark-title">サイトについて</h1>
        </div>
      </div>

      <div className="main-content">
        <div className="about-body">

          {/* 非営利・公益宣言 */}
          <div className="declaration-box" role="note" aria-label="重要な宣言">
            <p>
              本サイトは非営利・非商業目的の個人運営サイトです。公開情報のみを取り扱い、
              機密性情報・特定の個人情報は一切掲載しません。収益化・広告掲載は行っていません。
            </p>
          </div>

          {/* 目的 */}
          <section className="about-section" aria-labelledby="purpose-heading">
            <h2 className="about-section-title" id="purpose-heading">🎯 サイトの目的</h2>
            <p>
              GovDX Today は、中央省庁・地方公共団体のPMO（プロジェクト管理オフィス）・
              PJMO（プロジェクト管理支援）担当者を主な対象として、行政DX・AI活用に関する
              情報を毎日自動集約・要約するダイジェストサイトです。
            </p>
            <p>
              情報収集にかかる時間を削減し、担当者が政策立案・プロジェクト管理に集中できる
              環境づくりに貢献することを目指しています。
            </p>
          </section>

          {/* 掲載方針 */}
          <section className="about-section" aria-labelledby="policy-heading">
            <h2 className="about-section-title" id="policy-heading">📋 掲載方針</h2>
            <ul>
              <li>掲載情報は<strong>すべて公開情報</strong>（政府・省庁の公式発表、無料で閲覧可能なニュース記事等）に限定しています</li>
              <li>ペイウォール（有料会員限定）記事は収集対象外としています</li>
              <li><strong>機密性情報</strong>（機密性2以上の情報）は一切掲載しません</li>
              <li><strong>特定の個人情報</strong>（氏名・住所・連絡先等の個人を識別できる情報）は掲載しません</li>
              <li>政府・行政機関のDX・AI活用に関連する情報を優先的に掲載します</li>
            </ul>
          </section>

          {/* AI要約について */}
          <section className="about-section" aria-labelledby="ai-heading">
            <h2 className="about-section-title" id="ai-heading">🤖 AIによる要約について</h2>
            <p>
              記事の要約・分類にはGoogle Gemini API（<code>gemini-1.5-flash</code>）を使用しています。
              AIが生成した要約は、原文の趣旨を伝えることを目的としていますが、
              <strong>正確性・完全性・最新性を保証するものではありません</strong>。
            </p>
            <p>
              業務上の判断や意思決定を行う際は、必ず出典元の原文をご確認ください。
              AIによる要約には誤り（ハルシネーション）が含まれる場合があります。
            </p>
          </section>

          {/* 免責事項 */}
          <section className="about-section" aria-labelledby="disclaimer-heading">
            <h2 className="about-section-title" id="disclaimer-heading">⚖️ 免責事項</h2>
            <p>
              本サイトの情報を利用することにより生じたいかなる損害についても、
              運営者は一切の責任を負いません。
            </p>
            <ul>
              <li>掲載情報の正確性・完全性・最新性について、いかなる保証もしません</li>
              <li>リンク先（出典元）のサイト内容および利用に関して責任を負いません</li>
              <li>本サイトの内容は予告なく変更・削除される場合があります</li>
              <li>システム障害・メンテナンス等により、予定された更新が行われない場合があります</li>
            </ul>
          </section>

          {/* 著作権・引用 */}
          <section className="about-section" aria-labelledby="copyright-heading">
            <h2 className="about-section-title" id="copyright-heading">©️ 著作権・引用について</h2>
            <p>
              掲載されている各記事・情報の著作権は、それぞれの出典元（政府機関・報道機関等）に帰属します。
              本サイトは報道・批評・研究目的での引用（著作権法第32条）の範囲内での情報提供を行っています。
            </p>
            <p>
              著作権上の問題がある場合は、下記の連絡先までお知らせください。速やかに対応いたします。
            </p>
          </section>

          {/* 非営利・非商業宣言 */}
          <section className="about-section" aria-labelledby="nonprofit-heading">
            <h2 className="about-section-title" id="nonprofit-heading">🏳️ 非営利・非商業宣言</h2>
            <ul>
              <li>本サイトは<strong>一切の商業目的を持たない</strong>個人運営のサイトです</li>
              <li>広告掲載、アフィリエイト、スポンサーシップ等による収益化は行っていません</li>
              <li>有料会員制度・課金機能は設けていません</li>
              <li>掲載情報の販売・2次利用による収益化は行っていません</li>
              <li>情報収集・要約に使用するAI APIは個人が費用を負担しています</li>
            </ul>
          </section>

          {/* プライバシー */}
          <section className="about-section" aria-labelledby="privacy-heading">
            <h2 className="about-section-title" id="privacy-heading">🔒 プライバシーについて</h2>
            <p>
              本サイトはGitHub Pagesによる静的サイトです。閲覧者の個人情報・アクセスログの
              独自収集は行っていません。ただし、GitHub・Google Fonts等の外部サービスによる
              技術的なアクセス記録が行われる場合があります。
            </p>
            <p>
              Cookieや追跡技術（トラッキング）は使用していません。
            </p>
          </section>

          {/* 更新ポリシー */}
          <section className="about-section" aria-labelledby="update-heading">
            <h2 className="about-section-title" id="update-heading">🔄 更新ポリシー</h2>
            <ul>
              <li>毎日<strong>日本時間 0:00</strong>にGitHub Actionsによる自動更新を実施します</li>
              <li>政府機関の公式RSSフィード・無料ニュースサイトから情報を収集します</li>
              <li>AIによる要約・フィルタリング後、自動的に公開されます</li>
              <li>システム障害・APIエラー等により更新が遅延または欠落する場合があります</li>
              <li>過去90日分のアーカイブを保持します</li>
            </ul>
          </section>

          {/* 情報源 */}
          <section className="about-section" aria-labelledby="sources-heading">
            <h2 className="about-section-title" id="sources-heading">📡 主な情報源</h2>
            <p><strong>政府・公的機関</strong></p>
            <ul>
              <li>JPCERT/CC（コンピュータ緊急対応チーム）</li>
              <li>IPA（情報処理推進機構）セキュリティ情報</li>
              <li>NISC（内閣サイバーセキュリティセンター）</li>
              <li>デジタル庁 新着情報・note</li>
              <li>総務省 報道発表</li>
              <li>経済産業省 AI関連情報</li>
              <li>政府CIOポータル</li>
            </ul>
            <p style={{ marginTop: '12px' }}><strong>無料ニュースメディア</strong></p>
            <ul>
              <li>ITmedia NEWS / AI+ / エンタープライズ</li>
              <li>Internet Watch / クラウド Watch</li>
              <li>@IT / ZDNet Japan / CNET Japan</li>
              <li>NHKニュース（科学・IT）</li>
            </ul>
          </section>

        </div>
      </div>
    </>
  );
}
