
import {
    Coffee, Newspaper, Briefcase, Banknote, Heart,
    Home, Cpu, Video, Film, Palette, GraduationCap,
    Ghost, Trophy, Shapes
} from 'lucide-react';

interface BoardIconProps {
    category?: string;
    className?: string;
    size?: number;
}

export default function BoardIcon({ category, className, size = 20 }: BoardIconProps) {
    if (!category) return <Shapes className={className} size={size} />;

    switch (category) {
        case 'ラウンジ': return <Coffee className={className} size={size} />;
        case '社会・ニュース': return <Newspaper className={className} size={size} />;
        case 'キャリア・ビジネス': return <Briefcase className={className} size={size} />;
        case 'マネー・資産形成': return <Banknote className={className} size={size} />;
        case 'ウェルビーイング': return <Heart className={className} size={size} />;
        case 'ライフスタイル': return <Home className={className} size={size} />;
        case 'テクノロジー': return <Cpu className={className} size={size} />;
        case '動画・ソーシャル': return <Video className={className} size={size} />;
        case 'カルチャー・エンタメ': return <Film className={className} size={size} />;
        case 'クリエイティブ': return <Palette className={className} size={size} />;
        case '学問': return <GraduationCap className={className} size={size} />;
        case 'ミステリー・スピリチュアル': return <Ghost className={className} size={size} />;
        case 'スポーツ・ギャンブル': return <Trophy className={className} size={size} />;
        default: return <Shapes className={className} size={size} />;
    }
}
