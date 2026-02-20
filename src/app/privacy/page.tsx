
import Link from 'next/link';
import styles from '../LegalLayout.module.css';

export default function PrivacyPage() {
    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backLink}>← 戻る</Link>
            <h1 className={styles.title}>プライバシーポリシー</h1>

            <div className={styles.section}>
                <p className={styles.content}>
                    NWWW（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本サービスが収集する情報とその取り扱いについて、以下の通り定めます。
                </p>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>1. 収集する情報</span>
                <p className={styles.content}>
                    本サービスは、以下の情報を収集・取得することがあります。{"\n"}
                    1. <strong>アクセスログ</strong>: IPアドレス、ブラウザの種類、アクセス日時。{"\n"}
                    2. <strong>投稿情報</strong>: ユーザーが本サービス上に投稿した内容。{"\n"}
                    3. <strong>Cookieおよびローカルストレージ</strong>: 閲覧履歴の記録（Discover機能等に使用）やテーマ設定の保存に使用します。
                </p>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>2. 利用目的</span>
                <p className={styles.content}>
                    収集した情報は、以下の目的で利用します。{"\n"}
                    1. <strong>サービスの提供と運営</strong>: 投稿の表示、AIによる要約や板選定の実行。{"\n"}
                    2. <strong>モデレーション</strong>: スパム対策、荒らし行為の制限。{"\n"}
                    3. <strong>ユーザー体験の向上</strong>: 閲覧履歴に基づいたスレッドのレコメンド。{"\n"}
                    4. <strong>安全の確保</strong>: 規約違反の調査、法的要請への対応。
                </p>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>3. 情報の保管と保護</span>
                <p className={styles.content}>
                    1. <strong>IPアドレスの取り扱い</strong>: 投稿時のIPアドレスはハッシュ化等の処理を行い、投稿者の識別に利用します。生のアドレスは管理目的以外で公開されることはありません。{"\n"}
                    2. <strong>セキュリティ</strong>: 本サービスは、収集した情報の漏洩、紛失、不正アクセスを防止するために、適切な技術的対策を講じます。
                </p>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>4. 第三者への提供</span>
                <p className={styles.content}>
                    本サービスは、次の場合を除き、収集した情報を第三者に開示または提供しません。{"\n"}
                    1. ユーザーの同意がある場合。{"\n"}
                    2. 法令に基づき、裁判所、警察等の公的機関から開示を求められた場合。{"\n"}
                    3. 人の生命、身体または財産の保護のために必要があり、本人の同意を得ることが困難な場合。
                </p>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>5. 外部サービスの使用</span>
                <p className={styles.content}>
                    本サービスは、Google等の提供する分析ツールや広告サービス、AIモデル（Google Gemini等）を利用することがあります。これらのサービスによる情報の取り扱いは、各サービスのプライバシーポリシーに従います。
                </p>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>6. ポリシーの変更</span>
                <p className={styles.content}>
                    本サービスは、法令の改正や運営上の必要に応じて、本プライバシーポリシーを変更することがあります。変更後のポリシーは、本サービス上に掲載された時点から適用されます。
                </p>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>7. お問い合わせ</span>
                <p className={styles.content}>
                    情報の取り扱いに関するご質問等は、以下の窓口までご連絡ください。{"\n"}
                    メール: <a href="mailto:info@nwww.jp">info@nwww.jp</a>
                </p>
            </div>

            <div className={styles.footer}>
                2026年2月18日 制定
            </div>
        </div>
    );
}
