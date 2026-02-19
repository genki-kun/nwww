
import { Post } from '@/data/mockBBS';
import styles from './PostList.module.css';

import PostContent from './PostContent';
import ReportButton from './ReportButton';

interface PostListProps {
    posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
    return (
        <div className={styles.container}>
            {posts.length === 0 ? (
                <p className={styles.empty}>まだ書き込みはありません。</p>
            ) : (
                <ul className={styles.list}>
                    {posts.map((post, index) => (
                        <li key={post.id} className={styles.item} id={`post-${index + 1}`}>
                            <div className={styles.header}>
                                <span className={styles.number}>{index + 1}</span>
                                <span className={styles.name}>{post.author}</span>
                                <span className={styles.date}>{new Date(post.createdAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</span>
                                <span className={styles.id}>ID: {post.id.substring(0, 8)}</span>
                                <div className={styles.reportWrapper}>
                                    <ReportButton postId={post.id} />
                                </div>
                            </div>
                            <div className={styles.content}>
                                <PostContent content={post.content} posts={posts} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
