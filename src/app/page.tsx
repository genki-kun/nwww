import { getAllThreads, getBoards } from '@/data/db-actions';
import styles from './page.module.css';
import ThreadCard from '@/components/ThreadCard';
import DiscoverSection from '@/components/DiscoverSection';
import TopSparkCTA from '@/components/TopSparkCTA';

export default async function Home() {
  const allThreadsWithBoard = await getAllThreads();
  const boards = await getBoards();

  // 1. WHAT'S NEW: Sort by createdAt desc, take 10
  const newThreads = [...allThreadsWithBoard]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  // 2. PICK UP: Sort by momentum (postCount / hours elapsed), take 6
  const now = Date.now();
  const pickUpThreads = [...allThreadsWithBoard]
    .map(t => {
      const hoursElapsed = Math.max((now - new Date(t.createdAt).getTime()) / 3600000, 1);
      return { ...t, momentum: t.postCount / hoursElapsed };
    })
    .sort((a, b) => b.momentum - a.momentum)
    .slice(0, 6);

  // 3. DISCOVER: IDs to exclude (already shown in WHAT'S NEW and PICK UP)
  const usedIds = [
    ...newThreads.map(t => t.id),
    ...pickUpThreads.map(t => t.id)
  ];

  return (
    <main className={styles.main}>
      <TopSparkCTA boards={boards} />

      {/* WHAT'S NEW */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>WHAT&apos;S NEW</h2>
          <p className={styles.sectionSub}>新着スレッド</p>
        </div>
        <div className={styles.whatsNewScroll}>
          {newThreads.map(thread => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              boardName={thread.boardName}
              boardId={thread.boardId}
              variant="horizontal"
            />
          ))}
          {newThreads.length === 0 && (
            <p className={styles.emptyState}>新しいスレッドはありません。</p>
          )}
        </div>
      </section>

      {/* PICK UP */}
      <section className={`${styles.section} ${styles.pickUpSection}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>PICK UP</h2>
          <p className={styles.sectionSub}>注目のスレッド</p>
        </div>
        <div className={styles.pickUpList}>
          {pickUpThreads.map(thread => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              boardName={thread.boardName}
              boardId={thread.boardId}
              variant="list"
            />
          ))}
        </div>
      </section>

      {/* こんなスレッドも */}
      <section className={`${styles.section} ${styles.sectionLast}`}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.discoverTitle}>こんなスレッドも</h3>
          <p className={styles.sectionSub}>まだ知らないスレッドを発見</p>
        </div>
        <DiscoverSection
          allThreads={allThreadsWithBoard}
          excludeIds={usedIds}
        />
      </section>
    </main>
  );
}
