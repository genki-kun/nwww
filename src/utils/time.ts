export function getRelativeTime(dateString: string): string {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();

    // 未来の時刻の場合は「たった今」として扱う
    if (diffMs < 0) return 'たった今';

    // Convert to seconds
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}秒前`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}分前`;

    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}時間前`;

    const diffDay = Math.floor(diffHour / 24);
    if (diffDay === 1) return '昨日';
    if (diffDay < 7) return `${diffDay}日前`;

    // M/D format for > 7 days
    return `${past.getMonth() + 1}/${past.getDate()}`;
}
