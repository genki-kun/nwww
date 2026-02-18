
export interface Post {
    id: string;
    author: string;
    content: string;
    createdAt: string;
    userId?: string; // Anonymous ID
    likes: number;
    status?: 'active' | 'deleted';
}

export interface Thread {
    id: string;
    title: string;
    lastUpdated: string;
    postCount: number;
    views: number;
    tags: string[]; // Added tags
    aiSummary?: string;
    posts: Post[];
    // Growth & Selection fields
    createdAt: string;
    momentum: number;
    status: 'active' | 'archived' | 'filled';
}

export interface Board {
    id: string;
    name: string;
    description: string;
    category: string;
    threads: Thread[];
}

export let MOCK_BOARDS: Board[] = [
    // --- ラウンジ ---
    {
        id: "lounge-live",
        name: "なんでも実況",
        description: "今起きていることをリアルタイムで。",
        category: "ラウンジ",
        threads: [
            {
                id: "thread-live-1",
                title: "【速報】円安、ついに1ドル160円突破か！？ 34",
                lastUpdated: "2026-02-15T23:45:00",
                postCount: 452,
                views: 5200,
                tags: ["Economy", "Live"],
                createdAt: "2026-02-15T20:00:00",
                momentum: 1200,
                status: 'active',
                posts: [
                    {
                        id: "post-live-1",
                        author: "名無しさん",
                        content: "うわあああああああ逝ったああああああああああ",
                        createdAt: "2026-02-15T23:45:00",
                        likes: 0,
                        status: 'active',
                    }
                ],
            }
        ],
    },
    {
        id: "lounge-chat",
        name: "なんでも雑談",
        description: "日常の話題、暇つぶし。",
        category: "ラウンジ",
        threads: [
            {
                id: "thread-chat-1",
                title: "お前らの黒歴史晒していけｗｗｗ",
                lastUpdated: "2026-02-15T22:10:00",
                postCount: 128,
                views: 3400,
                tags: ["Chat", "Funny"],
                createdAt: "2026-02-15T18:00:00",
                momentum: 500,
                status: 'active',
                posts: [
                    {
                        id: "post-chat-1",
                        author: "名無しさん",
                        content: "中二病時代のノートが見つかったんだが、死にたい",
                        createdAt: "2026-02-15T18:00:00",
                        likes: 15,
                        status: 'active',
                    }
                ],
            },
            {
                id: "thread-chat-2",
                title: "最近のAI進化しすぎワロタｗｗｗ 未来どうなるん？",
                lastUpdated: "2026-02-15T21:00:00",
                postCount: 85,
                views: 2100,
                tags: ["AI", "Tech"],
                createdAt: "2026-02-14T15:00:00",
                momentum: 300,
                status: 'active',
                posts: [
                    {
                        id: "post-chat-2",
                        author: "名無しさん",
                        content: "もう俺らの仕事なくなるんじゃね？マジで。",
                        createdAt: "2026-02-14T15:00:00",
                        likes: 8,
                        status: 'active',
                    }
                ],
            }
        ],
    },
    {
        id: "lounge-qa",
        name: "なんでも知恵袋",
        description: "質問、相談、知恵の共有。",
        category: "ラウンジ",
        threads: [
            {
                id: "thread-qa-1",
                title: "【至急】彼女へのプレゼント、予算3万で何がいい？",
                lastUpdated: "2026-02-15T19:30:00",
                postCount: 42,
                views: 1200,
                tags: ["Love", "Advice"],
                createdAt: "2026-02-15T10:00:00",
                momentum: 120,
                status: 'active',
                posts: [
                    {
                        id: "post-qa-1",
                        author: "名無しさん",
                        content: "付き合って3ヶ月。20代後半です。アクセか？コスメか？",
                        createdAt: "2026-02-15T10:00:00",
                        likes: 3,
                        status: 'active',
                    }
                ],
            }
        ],
    },

    // --- 社会・ニュース ---
    {
        id: "news-global",
        name: "国際ニュース",
        description: "世界情勢、紛争、外交。",
        category: "社会・ニュース",
        threads: [
            {
                id: "thread-news-global-1",
                title: "【米国】次期大統領選、激戦州で接戦続く 世論調査",
                lastUpdated: "2026-02-15T14:00:00",
                postCount: 230,
                views: 8900,
                tags: ["Politics", "US"],
                createdAt: "2026-02-15T08:00:00",
                momentum: 600,
                status: 'active',
                posts: [
                    {
                        id: "post-news-g-1",
                        author: "名無しさん",
                        content: "どっちが勝っても混乱しそうだなこれ",
                        createdAt: "2026-02-15T08:00:00",
                        likes: 12,
                    }
                ],
            }
        ],
    },
    {
        id: "news-domestic",
        name: "国内ニュース",
        description: "政治、事件、災害情報。",
        category: "社会・ニュース",
        threads: [
            {
                id: "thread-news-dom-1",
                title: "【気象】台風7号、週末に関東直撃の恐れ 厳重警戒を",
                lastUpdated: "2026-02-15T16:00:00",
                postCount: 156,
                views: 12000,
                tags: ["Weather", "Disaster"],
                createdAt: "2026-02-15T07:00:00",
                momentum: 800,
                status: 'active',
                posts: [
                    {
                        id: "post-news-d-1",
                        author: "名無しさん",
                        content: "また週末かよ...コロッケ買ってくるわ",
                        createdAt: "2026-02-15T07:00:00",
                        likes: 45,
                    }
                ],
            }
        ],
    },
    {
        id: "news-politics",
        name: "政治・経済",
        description: "政策議論、株価動向、経済。",
        category: "社会・ニュース",
        threads: [
            {
                id: "thread-news-1",
                title: "【議論】ベーシックインカムは日本で導入可能なのか議論するスレ",
                lastUpdated: "2026-02-14T13:00:00",
                postCount: 89,
                views: 1250,
                tags: ["Economy", "Society"],
                aiSummary: "財源の問題と労働意欲への影響が主な論点。AIによる自動化が進む中で必須になるという意見も。",
                createdAt: "2026-02-13T10:00:00",
                momentum: 80,
                status: 'active',
                posts: [],
            }
        ],
    },
    {
        id: "news-media",
        name: "メディア・ネット",
        description: "マスコミ報道、SNSトレンド、炎上案件。",
        category: "社会・ニュース",
        threads: [],
    },
    {
        id: "news-local",
        name: "地域・街",
        description: "地元の話題、移住、町おこし。",
        category: "社会・ニュース",
        threads: [],
    },

    // --- キャリア・ビジネス ---
    {
        id: "biz-startup",
        name: "スタートアップ",
        description: "起業、ベンチャー、資金調達。",
        category: "キャリア・ビジネス",
        threads: [
            {
                id: "thread-startup-1",
                title: "シード期で1億調達したけど質問ある？",
                lastUpdated: "2026-02-14T19:00:00",
                postCount: 56,
                views: 2300,
                tags: ["Startup", "Finance"],
                createdAt: "2026-02-14T10:00:00",
                momentum: 150,
                status: 'active',
                posts: [
                    {
                        id: "post-startup-1",
                        author: "名無しさん",
                        content: "VCとの交渉マジで疲れたわ。特定避けて答える。",
                        createdAt: "2026-02-14T10:00:00",
                        likes: 20,
                    }
                ],
            }
        ],
    },
    {
        id: "biz-career",
        name: "仕事・キャリア",
        description: "就職、転職、働き方。",
        category: "キャリア・ビジネス",
        threads: [
            {
                id: "thread-life-1",
                title: "30代後半で異業種転職した人の体験談を聞きたい",
                lastUpdated: "2026-02-14T12:30:00",
                postCount: 34,
                views: 562,
                tags: ["Career", "JobChange"],
                createdAt: "2026-02-14T09:00:00",
                momentum: 230,
                status: 'active',
                posts: [],
            }
        ],
    },
    {
        id: "biz-sidehustle",
        name: "副業",
        description: "副業、複業、スキルシェア。",
        category: "キャリア・ビジネス",
        threads: [],
    },

    // --- マネー・資産形成 ---
    {
        id: "money-stock",
        name: "株・投資",
        description: "日本株、米国株、NISA、iDeCo。",
        category: "マネー・資産形成",
        threads: [
            {
                id: "thread-stock-1",
                title: "【S&P500】米国株投資信託スレ Part153",
                lastUpdated: "2026-02-15T22:30:00",
                postCount: 980,
                views: 15000,
                tags: ["Money", "Stock"],
                createdAt: "2026-02-10T11:00:00",
                momentum: 200,
                status: 'active',
                posts: [
                    {
                        id: "post-stock-1",
                        author: "名無しさん",
                        content: "結局オルカンとS&Pどっちがいいんだよ",
                        createdAt: "2026-02-10T11:00:00",
                        likes: 5,
                    }
                ],
            }
        ],
    },
    {
        id: "money-crypto",
        name: "ビットコイン・仮想通貨",
        description: "BTC、ETH、アルトコイン、Web3。",
        category: "マネー・資産形成",
        threads: [
            {
                id: "thread-crypto-1",
                title: "ビットコイン10万ドル目前！お前らまだ買ってないの？ｗｗ",
                lastUpdated: "2026-02-15T23:00:00",
                postCount: 340,
                views: 6700,
                tags: ["Crypto", "BTC"],
                createdAt: "2026-02-15T12:00:00",
                momentum: 800,
                status: 'active',
                posts: [
                    {
                        id: "post-crypto-1",
                        author: "名無しさん",
                        content: "靴磨きの少年がどうとか言ってた奴息してる？",
                        createdAt: "2026-02-15T12:00:00",
                        likes: 12,
                    }
                ],
            }
        ],
    },

    // --- ウェルビーイング ---
    {
        id: "well-relationship",
        name: "恋愛・人間関係",
        description: "恋愛、結婚、家族、人間関係。",
        category: "ウェルビーイング",
        threads: [
            {
                id: "thread-rel-1",
                title: "上司がウザすぎて会社辞めたいんだが",
                lastUpdated: "2026-02-15T20:15:00",
                postCount: 23,
                views: 500,
                tags: ["Work", "Stress"],
                createdAt: "2026-02-15T15:00:00",
                momentum: 40,
                status: 'active',
                posts: [
                    {
                        id: "post-rel-1",
                        author: "名無しさん",
                        content: "毎朝挨拶しても無視される。これパワハラじゃね？",
                        createdAt: "2026-02-15T15:00:00",
                        likes: 3,
                    }
                ],
            }
        ],
    },
    {
        id: "well-health",
        name: "メンタル・健康",
        description: "メンタルヘルス、フィットネス、健康法。",
        category: "ウェルビーイング",
        threads: [],
    },

    // --- ライフスタイル ---
    {
        id: "life-shopping",
        name: "買い物",
        description: "おすすめ商品、セール情報。",
        category: "ライフスタイル",
        threads: [],
    },
    {
        id: "life-food",
        name: "料理・食べ物",
        description: "レシピ、グルメ、飲食店。",
        category: "ライフスタイル",
        threads: [
            {
                id: "thread-food-1",
                title: "最強の夜食決定戦",
                lastUpdated: "2026-02-15T23:30:00",
                postCount: 88,
                views: 1500,
                tags: ["Food", "LateNight"],
                createdAt: "2026-02-15T21:00:00",
                momentum: 200,
                status: 'active',
                posts: [
                    {
                        id: "post-food-1",
                        author: "名無しさん",
                        content: "カップヌードルカレー味一択だろ",
                        createdAt: "2026-02-15T21:00:00",
                        likes: 10,
                    }
                ],
            }
        ],
    },
    {
        id: "life-diy",
        name: "DIY",
        description: "日曜大工、ハンドメイド。",
        category: "ライフスタイル",
        threads: [],
    },
    {
        id: "life-interior",
        name: "インテリア",
        description: "家具、部屋作り、収納。",
        category: "ライフスタイル",
        threads: [],
    },
    {
        id: "life-fashion",
        name: "ファッション",
        description: "メンズ、レディース、コーディネート。",
        category: "ライフスタイル",
        threads: [],
    },
    {
        id: "life-pet",
        name: "ペット・動物",
        description: "犬、猫、小動物、アクアリウム。",
        category: "ライフスタイル",
        threads: [],
    },
    {
        id: "life-parenting",
        name: "子育て",
        description: "育児、教育、子供の成長。",
        category: "ライフスタイル",
        threads: [],
    },
    {
        id: "life-school",
        name: "学校生活",
        description: "学生生活、部活、勉強。",
        category: "ライフスタイル",
        threads: [],
    },
    {
        id: "life-travel",
        name: "旅行",
        description: "国内旅行、海外旅行、観光地。",
        category: "ライフスタイル",
        threads: [
            {
                id: "thread-travel-1",
                title: "北海道一人旅に行くんだけどおすすめある？",
                lastUpdated: "2026-02-14T22:00:00",
                postCount: 65,
                views: 1200,
                tags: ["Travel", "Solo"],
                createdAt: "2026-02-14T10:00:00",
                momentum: 50,
                status: 'active',
                posts: [
                    {
                        id: "post-travel-1",
                        author: "名無しさん",
                        content: "札幌、小樽あたりで美味い寿司屋教えてくれ",
                        createdAt: "2026-02-14T10:00:00",
                        likes: 4,
                    }
                ],
            }
        ],
    },
    {
        id: "life-car",
        name: "車",
        description: "自動車、ドライブ、メンテナンス。",
        category: "ライフスタイル",
        threads: [],
    },
    {
        id: "life-bike",
        name: "バイク",
        description: "ツーリング、カスタム、二輪。",
        category: "ライフスタイル",
        threads: [],
    },

    // --- テクノロジー ---
    {
        id: "tech-ai",
        name: "AI",
        description: "生成AI、LLM、機械学習。",
        category: "テクノロジー",
        threads: [
            {
                id: "thread-ai-1",
                title: "GPT-5待機スレ part3",
                lastUpdated: "2026-02-15T22:00:00",
                postCount: 890,
                views: 12000,
                tags: ["AI", "GPT"],
                createdAt: "2026-02-10T00:00:00",
                momentum: 500,
                status: 'active',
                posts: [
                    {
                        id: "post-ai-1",
                        author: "名無しさん",
                        content: "いつ来るんだよ...待ちくたびれた",
                        createdAt: "2026-02-10T00:00:00",
                        likes: 4,
                    }
                ],
            },
            {
                id: "thread-ai-2",
                title: "画像生成AIで架空のアイドル作ったから見て",
                lastUpdated: "2026-02-15T21:40:00",
                postCount: 45,
                views: 3200,
                tags: ["AI", "Art"],
                createdAt: "2026-02-15T18:00:00",
                momentum: 200,
                status: 'active',
                posts: [
                    {
                        id: "post-ai-2",
                        author: "名無しさん",
                        content: "（画像略）どう？もっといける？",
                        createdAt: "2026-02-15T18:00:00",
                        likes: 12,
                    }
                ],
            }
        ],
    },
    {
        id: "tech-app",
        name: "アプリ・ソフトウェア",
        description: "PCソフト、スマホアプリ、Webサービス。",
        category: "テクノロジー",
        threads: [],
    },
    {
        id: "tech-dev",
        name: "プロダクト開発",
        description: "プログラミング、開発手法、UI/UX。",
        category: "テクノロジー",
        threads: [],
    },
    {
        id: "tech-home-elec",
        name: "家電",
        description: "白物家電、黒物家電、最新家電。",
        category: "テクノロジー",
        threads: [],
    },
    {
        id: "tech-pc-mobile",
        name: "スマホ・パソコン",
        description: "iPhone、Android、Mac、自作PC。",
        category: "テクノロジー",
        threads: [
            {
                id: "thread-pc-1",
                title: "iPhone 18 リーク情報まとめ",
                lastUpdated: "2026-02-15T15:00:00",
                postCount: 120,
                views: 5600,
                tags: ["iPhone", "Apple"],
                createdAt: "2026-02-14T10:00:00",
                momentum: 300,
                status: 'active',
                posts: [
                    {
                        id: "post-pc-1",
                        author: "名無しさん",
                        content: "カメラがさらに出っ張るらしいぞ",
                        createdAt: "2026-02-14T10:00:00",
                        likes: 8,
                    }
                ],
            }
        ],
    },
    {
        id: "tech-gadget",
        name: "ガジェット",
        description: "ウェアラブル、カメラ、電子機器。",
        category: "テクノロジー",
        threads: [],
    },
    {
        id: "tech-science",
        name: "科学技術",
        description: "最新技術、宇宙、ロボット。",
        category: "テクノロジー",
        threads: [],
    },

    // --- 動画・ソーシャル ---
    {
        id: "social-youtube",
        name: "YouTube・動画",
        description: "YouTuber、動画制作。",
        category: "動画・ソーシャル",
        threads: [
            {
                id: "thread-youtube-1",
                title: "【悲報】某大物Youtuber、活動休止を発表",
                lastUpdated: "2026-02-15T20:00:00",
                postCount: 560,
                views: 24000,
                tags: ["YouTube", "Gossip"],
                createdAt: "2026-02-15T12:00:00",
                momentum: 1500,
                status: 'active',
                posts: [
                    {
                        id: "post-yt-1",
                        author: "名無しさん",
                        content: "マジかよ...ショックで寝込むわ",
                        createdAt: "2026-02-15T12:00:00",
                        likes: 54,
                    }
                ],
            }
        ],
    },
    {
        id: "social-vtuber",
        name: "VTuber・配信者",
        description: "バーチャルYouTuber、ストリーマー。",
        category: "動画・ソーシャル",
        threads: [],
    },
    {
        id: "social-twitter",
        name: "X (Twitter)",
        description: "Xの話題、トレンド。",
        category: "動画・ソーシャル",
        threads: [],
    },
    {
        id: "social-other",
        name: "その他SNS",
        description: "Instagram, TikTok, Reddit, Bluesky。",
        category: "動画・ソーシャル",
        threads: [],
    },

    // --- カルチャー・エンタメ ---
    {
        id: "ent-manga",
        name: "漫画",
        description: "週刊誌、Web漫画、名作。",
        category: "カルチャー・エンタメ",
        threads: [],
    },
    {
        id: "ent-anime",
        name: "アニメ",
        description: "テレビアニメ、映画アニメ。",
        category: "カルチャー・エンタメ",
        threads: [
            {
                id: "thread-anime-1",
                title: "今期覇権アニメ予測スレ",
                lastUpdated: "2026-02-15T23:50:00",
                postCount: 340,
                views: 5400,
                tags: ["Anime", "Review"],
                createdAt: "2026-02-10T00:00:00",
                momentum: 400,
                status: 'active',
                posts: [
                    {
                        id: "post-anime-1",
                        author: "名無しさん",
                        content: "やっぱオリジナルアニメが熱いよな",
                        createdAt: "2026-02-10T00:00:00",
                        likes: 10,
                    }
                ],
            }
        ],
    },
    {
        id: "ent-drama",
        name: "映画・ドラマ",
        description: "邦画、洋画、ドラマ、Netflix。",
        category: "カルチャー・エンタメ",
        threads: [],
    },
    {
        id: "ent-radio",
        name: "ラジオ",
        description: "ラジオ番組、ポッドキャスト。",
        category: "カルチャー・エンタメ",
        threads: [],
    },
    {
        id: "ent-game",
        name: "ゲーム総合",
        description: "家庭用ゲーム、PCゲーム。",
        category: "カルチャー・エンタメ",
        threads: [
            {
                id: "thread-game-1",
                title: "モンハンの新作、発売日決定ｷﾀ━━━━(ﾟ∀ﾟ)━━━━!!",
                lastUpdated: "2026-02-15T19:00:00",
                postCount: 670,
                views: 18000,
                tags: ["Game", "MH"],
                createdAt: "2026-02-15T09:00:00",
                momentum: 2000,
                status: 'active',
                posts: [
                    {
                        id: "post-game-1",
                        author: "名無しさん",
                        content: "全裸待機余裕でした",
                        createdAt: "2026-02-15T09:00:00",
                        likes: 33,
                    }
                ],
            }
        ],
    },
    {
        id: "ent-socialgame",
        name: "ソシャゲ",
        description: "スマホゲーム、ガチャ。",
        category: "カルチャー・エンタメ",
        threads: [],
    },
    {
        id: "ent-music",
        name: "音楽",
        description: "邦楽、洋楽、フェス。",
        category: "カルチャー・エンタメ",
        threads: [
            {
                id: "thread-music-1",
                title: "今年のフェスのメンツ微妙すぎん？",
                lastUpdated: "2026-02-14T18:00:00",
                postCount: 120,
                views: 4500,
                tags: ["Music", "Fes"],
                createdAt: "2026-02-14T12:00:00",
                momentum: 80,
                status: 'active',
                posts: [
                    {
                        id: "post-music-1",
                        author: "名無しさん",
                        content: "ヘッドライナー誰だよこれ...知らないおじさんばっか",
                        createdAt: "2026-02-14T12:00:00",
                        likes: 6,
                    }
                ],
            }
        ],
    },
    {
        id: "ent-book",
        name: "読書・文学",
        description: "小説、ビジネス書、ライトノベル。",
        category: "カルチャー・エンタメ",
        threads: [],
    },
    {
        id: "ent-comedy",
        name: "お笑い",
        description: "芸人、バラエティ、賞レース。",
        category: "カルチャー・エンタメ",
        threads: [],
    },
    {
        id: "ent-idol",
        name: "アイドル総合",
        description: "アイドルグループ、推し活。",
        category: "カルチャー・エンタメ",
        threads: [],
    },
    {
        id: "ent-kpop",
        name: "K-POP",
        description: "韓国アイドル、音楽。",
        category: "カルチャー・エンタメ",
        threads: [],
    },
    {
        id: "ent-hello",
        name: "ハロプロ",
        description: "ハロー！プロジェクト。",
        category: "カルチャー・エンタメ",
        threads: [],
    },
    {
        id: "ent-celeb",
        name: "芸能",
        description: "芸能人、ゴシップ。",
        category: "カルチャー・エンタメ",
        threads: [],
    },
    {
        id: "ent-tokusatsu",
        name: "特撮",
        description: "仮面ライダー、戦隊、ウルトラマン。",
        category: "カルチャー・エンタメ",
        threads: [],
    },

    // --- クリエイティブ ---
    {
        id: "create-illust",
        name: "イラスト",
        description: "絵描き、イラスト制作。",
        category: "クリエイティブ",
        threads: [],
    },
    {
        id: "create-design",
        name: "デザイン",
        description: "グラフィック、Webデザイン。",
        category: "クリエイティブ",
        threads: [
            {
                id: "thread-design-1",
                title: "【悲報】クライアント「ロゴ、もうちょっとポップにできる？」",
                lastUpdated: "2026-02-15T16:00:00",
                postCount: 42,
                views: 2100,
                tags: ["Design", "Work"],
                createdAt: "2026-02-15T09:00:00",
                momentum: 100,
                status: 'active',
                posts: [
                    {
                        id: "post-design-1",
                        author: "名無しさん",
                        content: "ポップって何だよ...抽象的すぎるだろ",
                        createdAt: "2026-02-15T09:00:00",
                        likes: 15,
                    }
                ],
            }
        ],
    },
    {
        id: "create-3dcg",
        name: "3DCG",
        description: "Blender, Maya, modeling。",
        category: "クリエイティブ",
        threads: [],
    },
    {
        id: "create-3dprint",
        name: "3Dプリント",
        description: "3Dプリンター、造形。",
        category: "クリエイティブ",
        threads: [],
    },
    {
        id: "create-dtm",
        name: "DTM",
        description: "デスクトップミュージック、作曲。",
        category: "クリエイティブ",
        threads: [],
    },
    {
        id: "create-tanka",
        name: "短歌・川柳",
        description: "五七五、定型詩。",
        category: "クリエイティブ",
        threads: [],
    },
    {
        id: "create-arch",
        name: "建築",
        description: "建築デザイン、建物。",
        category: "クリエイティブ",
        threads: [],
    },

    // --- 学問 ---
    {
        id: "acad-natural",
        name: "自然科学",
        description: "物理、化学、生物、地学。",
        category: "学問",
        threads: [
            {
                id: "thread-sci-1",
                title: "「フェルミのパラドックス」に対する一番説得力のある解って何？",
                lastUpdated: "2026-02-13T20:00:00",
                postCount: 210,
                views: 4500,
                tags: ["Space", "Philosophy"],
                aiSummary: "「グレート・フィルター説」と「動物園仮説」が人気。最近は「すでにAI化してデジタル宇宙に移行した」説も有力。",
                createdAt: "2026-02-10T20:00:00",
                momentum: 52,
                status: 'active',
                posts: [],
            },
        ],
    },
    {
        id: "acad-human",
        name: "人文・社会科学",
        description: "歴史、心理、社会、教育。",
        category: "学問",
        threads: [],
    },
    {
        id: "acad-math",
        name: "数学",
        description: "数学、統計学。",
        category: "学問",
        threads: [],
    },
    {
        id: "acad-philo",
        name: "哲学・思想",
        description: "哲学、倫理、思想。",
        category: "学問",
        threads: [
            {
                id: "thread-philo-1",
                title: "人生の意味について真面目に語るスレ",
                lastUpdated: "2026-02-14T23:00:00",
                postCount: 156,
                views: 4000,
                tags: ["Philosophy", "Life"],
                createdAt: "2026-02-10T22:00:00",
                momentum: 30,
                status: 'active',
                posts: [
                    {
                        id: "post-philo-1",
                        author: "名無しさん",
                        content: "死んだら無になるなら、生きる意味なんてなくね？",
                        createdAt: "2026-02-10T22:00:00",
                        likes: 8,
                    }
                ],
            }
        ],
    },
    {
        id: "acad-eng",
        name: "機械・工学",
        description: "工学、技術研究。",
        category: "学問",
        threads: [],
    },

    // --- ミステリー・スピリチュアル ---
    {
        id: "mys-occult",
        name: "オカルト・怪談",
        description: "心霊、不思議な体験。",
        category: "ミステリー・スピリチュアル",
        threads: [
            {
                id: "thread-occult-1",
                title: "【洒落怖】今までで一番怖かった体験書いてけ",
                lastUpdated: "2026-02-15T23:55:00",
                postCount: 666,
                views: 13000,
                tags: ["Occult", "Horror"],
                createdAt: "2026-02-13T00:00:00",
                momentum: 999,
                status: 'active',
                posts: [
                    {
                        id: "post-occult-1",
                        author: "名無しさん",
                        content: "深夜の山道で白い着物の女を見た話する",
                        createdAt: "2026-02-13T00:00:00",
                        likes: 66,
                    }
                ],
            }
        ],
    },
    {
        id: "mys-urban",
        name: "都市伝説・陰謀論",
        description: "都市伝説、未解決事件。",
        category: "ミステリー・スピリチュアル",
        threads: [],
    },
    {
        id: "mys-spirit",
        name: "スピリチュアル",
        description: "精神世界、占い、パワースポット。",
        category: "ミステリー・スピリチュアル",
        threads: [],
    },
    {
        id: "mys-religion",
        name: "宗教",
        description: "宗教、信仰。",
        category: "ミステリー・スピリチュアル",
        threads: [],
    },

    // --- スポーツ・ギャンブル ---
    {
        id: "sports-baseball",
        name: "野球",
        description: "プロ野球、メジャーリーグ、高校野球。",
        category: "スポーツ・ギャンブル",
        threads: [
            {
                id: "thread-baseball-1",
                title: "大谷翔平、本日もホームラン確実か",
                lastUpdated: "2026-02-15T11:00:00",
                postCount: 890,
                views: 22000,
                tags: ["Baseball", "MLB"],
                createdAt: "2026-02-15T08:00:00",
                momentum: 2500,
                status: 'active',
                posts: [
                    {
                        id: "post-bb-1",
                        author: "名無しさん",
                        content: "なおエ",
                        createdAt: "2026-02-15T08:00:00",
                        likes: 100,
                    }
                ],
            }
        ],
    },
    {
        id: "sports-soccer",
        name: "サッカー",
        description: "Jリーグ、海外サッカー、代表。",
        category: "スポーツ・ギャンブル",
        threads: [],
    },
    {
        id: "sports-sumo",
        name: "相撲",
        description: "大相撲、力士。",
        category: "スポーツ・ギャンブル",
        threads: [],
    },
    {
        id: "sports-fight",
        name: "スポーツ・格闘技",
        description: "その他スポーツ、格闘技。",
        category: "スポーツ・ギャンブル",
        threads: [],
    },
    {
        id: "sports-gamble",
        name: "ギャンブル",
        description: "競馬、競艇、パチンコ。",
        category: "スポーツ・ギャンブル",
        threads: [],
    },
];

export const getBoards = async (): Promise<Board[]> => {
    return MOCK_BOARDS;
};

export const getBoard = async (boardId: string): Promise<Board | undefined> => {
    return MOCK_BOARDS.find((b) => b.id === boardId);
};

// --- Logic for Growth & Selection ---

function calculateMomentum(thread: Thread): number {
    const now = new Date();
    const created = new Date(thread.createdAt);

    // Safety check for invalid dates
    if (isNaN(created.getTime())) return 0;

    const diffMs = now.getTime() - created.getTime();
    const daysSinceCreation = Math.max(diffMs / (1000 * 60 * 60 * 24), 0.001); // Min 0.001 days to avoid div/0

    // Momentum = Posts / Days
    // (Example: 10 posts in 1 day = 10 momentum. 1 post in 10 days = 0.1 momentum)
    return Math.floor(thread.postCount / daysSinceCreation);
}

function checkSelectionStatus(thread: Thread): 'active' | 'archived' {
    const now = new Date();
    const created = new Date(thread.createdAt);
    const lastUpdated = new Date(thread.lastUpdated);

    const hoursSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    const daysSinceLastUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

    // 1. Culling Rule: "No Engagement" (Initial Culling)
    // If >24h old AND <5 posts -> Archive.
    // (Strict for AI threads could be implemented here if we track 'isAi')
    if (hoursSinceCreation > 24 && thread.postCount < 5) {
        return 'archived';
    }

    // 2. Culling Rule: "Time Decay" (Natural Death)
    // If no updates for 7 days -> Archive.
    if (daysSinceLastUpdate > 7) {
        return 'archived';
    }

    return 'active';
}

export const getThreads = async (boardId: string): Promise<Thread[]> => {
    const board = MOCK_BOARDS.find((b) => b.id === boardId);
    if (!board) return [];

    // Apply Growth & Selection logic on read
    // In a real app, this would be a background job or DB query
    board.threads = board.threads.map(t => {
        const momentum = calculateMomentum(t);
        const status = checkSelectionStatus(t);
        return { ...t, momentum, status };
    });

    // Filter out archived threads for main view (or handle in UI)
    // For now, let's return ALL, but UI will hide archived or show differently
    // Actually, createThread adds to this array. 
    // Let's filter here to simulate "Disappearing" threads if they are culled.
    // Spec says "Archived (Hidden from main list)".

    // Sort by Momentum (Heat) Descending
    return board.threads
        .filter(t => t.status === 'active')
        .sort((a, b) => b.momentum - a.momentum);
};

export const getThread = async (boardId: string, threadId: string): Promise<Thread | undefined> => {
    // For getThread, we might want to return even if archived?
    // Using simple lookup for now.
    const board = MOCK_BOARDS.find((b) => b.id === boardId);
    return board?.threads.find((t) => t.id === threadId);
};


export const addPost = async (boardId: string, threadId: string, post: Omit<Post, 'id' | 'createdAt' | 'likes'>): Promise<Post | undefined> => {
    const thread = await getThread(boardId, threadId);
    if (!thread) return undefined;

    const newPost: Post = {
        id: `post-${Date.now()}`,
        ...post,
        createdAt: new Date().toISOString(),
        likes: 0,
    };

    thread.posts.push(newPost);
    thread.postCount++;
    thread.lastUpdated = newPost.createdAt;
    // Momentum / Status will be updated on next getThreads call
    return newPost;
};

export const createThread = async (boardId: string, title: string, firstPostContent: string, userId?: string): Promise<Thread | undefined> => {
    const board = await getBoard(boardId);
    if (!board) return undefined;

    const now = new Date().toISOString();
    const newThread: Thread = {
        id: `thread-${Date.now()}`,
        title,
        lastUpdated: now,
        postCount: 1,
        views: 0, // Init views
        tags: [],
        posts: [],
        createdAt: now,
        momentum: 1000,
        status: 'active',
    };

    const firstPost: Post = {
        id: `post-${Date.now()}`,
        author: "名無しさん",
        content: firstPostContent,
        createdAt: newThread.lastUpdated,
        userId: userId,
        likes: 0,
    };

    newThread.posts.push(firstPost);
    board.threads.unshift(newThread); // Add to top

    return newThread;
};
