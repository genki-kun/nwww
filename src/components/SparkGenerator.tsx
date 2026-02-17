'use client';

import { useState } from 'react';
import { createNewThread } from '@/app/actions';
import styles from './SparkGenerator.module.css';

interface SparkGeneratorProps {
    boardId: string;
}

type SparkType = 'conflict' | 'experience' | 'boundary' | 'hypothesis';

export default function SparkGenerator({ boardId }: SparkGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [topic, setTopic] = useState('');
    const [selectedType, setSelectedType] = useState<SparkType | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const sparkTypes: { id: SparkType; label: string; description: string }[] = [
        { id: 'conflict', label: '対立型 (Conflict)', description: 'A vs B の構造で議論を活性化' },
        { id: 'experience', label: '経験談収集型 (Experience)', description: '「〜な体験ある？」で共感を集める' },
        { id: 'boundary', label: '線引き型 (Boundary)', description: '「どこからが〇〇？」で定義を探る' },
        { id: 'hypothesis', label: '仮説提示型 (Hypothesis)', description: '大胆な仮説で反証を誘う' },
    ];

    /* ... */

    const handleGenerate = async () => {
        if (!selectedType || !topic.trim()) return;

        setIsGenerating(true);

        // Mock AI Generation delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        let title = '';
        let content = '';

        // Mock Generation Logic based on Type
        switch (selectedType) {
            case 'conflict':
                title = `【議論】${topic}は「肯定派」vs「否定派」どっち？`;
                content = `最近話題の「${topic}」について議論したい。\n\nメリットも多いけど、デメリットも無視できない。\n\n肯定派：\n・生産性が上がる\n・新しい価値観\n\n否定派：\n・リスクが高い\n・従来の文化が壊れる\n\nみなさんはどっちの立場？忌憚のない意見を求む。`;
                break;
            case 'experience':
                title = `【募集】${topic}で「まさか」と思った体験談`;
                content = `みなさんの周りで「${topic}」に関する面白い・怖い・考えさせられる体験談を教えてください。\n\n私の場合は…（例）\n\n些細なことでもOK。集まった事例から何か法則が見えるかも。`;
                break;
            case 'boundary':
                title = `どこからが「${topic}」なのか？境界線を決めるスレ`;
                content = `「${topic}」の定義って人によって違うよね。\n\n・Aのケースは？ → たぶんOK\n・Bのケースは？ → 微妙\n・Cのケースは？ → 完全アウト\n\nみんなの「許容範囲」や「定義」の境界線（ライン）を出し合って、集合知でガイドラインを作りたい。`;
                break;
            case 'hypothesis':
                title = `【仮説】${topic}の本質は実は〇〇なんじゃないか説`;
                content = `多くの人は「${topic}」をXだと思ってるけど、実はYなんじゃないか？とふと思った。\n\n根拠：\n1. 最近の動向\n2. 歴史的な類似点\n\nこの仮説、どう思う？\n「それは違う」「一理ある」「むしろZだ」など、反論・補強求む。\n\n[AI提案] このスレッドはAIが議題を提供しました。`;
                break;
        }

        // Auto-submit the generated thread via Server Action
        const formData = new FormData();
        formData.append('boardId', boardId);
        formData.append('title', `[AI] ${title}`);
        formData.append('content', content);

        await createNewThread(formData);

        setIsGenerating(false);
        setIsOpen(false);
        setTopic('');
        setSelectedType(null);
    };

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className={styles.openButton}>
                AIで問いを立てる (AI Spark)
            </button>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>AI Spark Generator</h3>
                <button onClick={() => setIsOpen(false)} className={styles.closeButton}>×</button>
            </div>

            <div className={styles.body}>
                <p className={styles.intro}>AIがあなたの代わりに「盛り上がるスレッド」の種（Spark）を作ります。</p>

                <div className={styles.section}>
                    <label className={styles.label}>1. テーマを入力</label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="例: リモートワーク, AI規制, 30代のキャリア..."
                        className={styles.input}
                    />
                </div>

                <div className={styles.section}>
                    <label className={styles.label}>2. 問いの型を選択</label>
                    <div className={styles.typeGrid}>
                        {sparkTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`${styles.typeButton} ${selectedType === type.id ? styles.selected : ''}`}
                            >
                                <span className={styles.typeLabel}>{type.label}</span>
                                <span className={styles.typeDesc}>{type.description}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.actions}>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !topic || !selectedType}
                        className={styles.generateButton}
                    >
                        {isGenerating ? 'AIが思考中...' : 'この構成でスレッドを作成'}
                    </button>
                </div>
            </div>
        </div>
    );
}
