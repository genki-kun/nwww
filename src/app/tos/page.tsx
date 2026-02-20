
import Link from 'next/link';
import styles from '../LegalLayout.module.css';

export default function TosPage() {
    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backLink}>← 戻る</Link>
            <h1 className={styles.title}>利用規約</h1>

            <div className={styles.section}>
                <p className={styles.content}>
                    NWWW（以下「本サービス」）をご利用いただきありがとうございます。本利用規約（以下「本規約」）は、本サービスを利用するすべてのユーザー（以下「ユーザー」）に適用されます。本サービスを利用することで、ユーザーは本規約のすべての内容に同意したものとみなされます。
                </p>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>1. 定義</span>
                <p className={styles.content}>
                    ・「本サービス」とは、NWWWが提供する掲示板および関連サービスを指します。{"\n"}
                    ・「ユーザー」とは、本サービスにアクセスし、または利用するすべての個人または法人を指します。{"\n"}
                    ・「投稿コンテンツ」とは、ユーザーが本サービス上に投稿したテキスト、画像、リンク等を指します。
                </p>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>2. 禁止事項</span>
                <p className={styles.content}>
                    ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。{"\n"}
                    1. 法令または公序良俗に反する行為。{"\n"}
                    2. 他のユーザー、第三者、または本サービスの名誉・信用を毀損し、またはプライバシーを侵害する行為。{"\n"}
                    3. 氏名、住所、電話番号、メールアドレスなど、特定の個人を識別できる情報（個人情報）を本人の同意なく投稿する行為。{"\n"}
                    4. 特定の個人、団体、人種、宗教等に対する差別、誹謗中傷、またはヘイトスピーチに該当する行為。{"\n"}
                    5. スパム投稿、大量の連投、または本サービスの運営を妨害する行為。{"\n"}
                    6. 違法な薬物、武器、児童ポルノ等の提供や宣伝、またはこれらを助長する行為。{"\n"}
                    7. その他、本サービスが不適当と判断する行為。
                </p>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>3. 本サービスの権利とモデレーション</span>
                <p className={styles.content}>
                    1. <strong>コンテンツの権利</strong>: ユーザーが投稿したコンテンツの著作権はユーザーに帰属します。ただし、ユーザーは本サービスに対し、コンテンツを本サービス内で無償で使用（複製、表示、改変等）する権利を許諾するものとします。{"\n"}
                    2. <strong>削除権限</strong>: 本サービスは、投稿コンテンツが禁止事項に抵触する場合、または運営上の理由により必要と判断した場合、事前通知なくコンテンツを削除（または「あぼーん」表示による非表示化）し、あるいはユーザーのアクセスを制限することができるものとします。{"\n"}
                    3. <strong>AIによる分析</strong>: 本サービスは、投稿内容をAIを使用して分析・要約・分類することがあり、ユーザーはこれに同意するものとします。
                </p>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>4. 免責事項</span>
                <p className={styles.content}>
                    1. <strong>コンテンツの責任</strong>: 本サービスは、ユーザーによって投稿された内容の正確性、適法性、妥当性について一切保証しません。投稿に関する責任はすべて投稿したユーザーが負うものとします。{"\n"}
                    2. <strong>損害賠償</strong>: ユーザーが本サービスの利用により第三者との間で紛争が生じた場合、ユーザー自身の責任と費用で解決するものとし、本サービスは一切の責任を負いません。{"\n"}
                    3. <strong>サービスの停止</strong>: 本サービスは、メンテナンスやトラブル等の理由により、予告なくサービスの一部または全部を停止することがあります。
                </p>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>5. 規約の変更</span>
                <p className={styles.content}>
                    本サービスは、必要と判断した場合にはいつでも本規約を変更することができるものとします。変更後の規約は、本サービス上に表示された時点から効力を生じるものとします。
                </p>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>6. 準拠法および裁判管轄</span>
                <p className={styles.content}>
                    本規約は日本法に準拠します。本サービスに関して紛争が生じた場合は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
                </p>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>7. お問い合わせ</span>
                <p className={styles.content}>
                    本規約に関するご質問等は、以下の窓口までご連絡ください。{"\n"}
                    メール: <a href="mailto:info@nwww.jp">info@nwww.jp</a>
                </p>
            </div>

            <div className={styles.footer}>
                2026年2月18日 制定
            </div>
        </div>
    );
}
