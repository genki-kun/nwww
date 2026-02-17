
import styles from './AIInsights.module.css';

export default function AIInsights() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>AI Insight</h3>
            </div>
            <div className={styles.content}>
                <div className={styles.section}>
                    <h4 className={styles.subtitle}>Hot Topics</h4>
                    <ul className={styles.tagList}>
                        <li className={styles.tag}>#LLM進化論</li>
                        <li className={styles.tag}>#AI著作権</li>
                        <li className={styles.tag}>#GPU不足</li>
                    </ul>
                </div>
                <div className={styles.section}>
                    <h4 className={styles.subtitle}>Discussion Analysis</h4>
                    <p className={styles.text}>
                        現在、「技術的特異点」に関する議論が活発化しています。肯定派と慎重派の意見が拮抗しており、新たな哲学的視点が求められています。
                    </p>
                </div>
            </div>
        </div>
    );
}
