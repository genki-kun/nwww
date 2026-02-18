---
description: Code Management & GitHub Backup
---

## 概要
このワークフローは、プロジェクトの変更をGitで管理し、GitHubなどのリモートリポジトリに安全にバックアップするための手順です。

## 手順

### 1. 変更の確認とステージング
現在の変更箇所を確認し、コミット対象に追加します。
```bash
git status
git add .
```

### 2. コミットの作成
わかりやすいメッセージを添えて変更を記録します。
```bash
git commit -m "Your descriptive commit message"
```

### 3. リモートリポジトリへの同期 (初回のみ)
// turbo
GitHub等でリポジトリを作成した後、以下のコマンドで接続します（URLは各自のものに置き換えてください）。
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 4. 日常的なバックアップ (Sync)
// turbo
最新の状態をリモートに反映します。
```bash
git push origin main
```

### 5. NWWW 開発プラクティス
- 大きな機能追加の前後で必ずコミットを行う。
- `walkthrough.md` の更新内容とコミットメッセージを同期させる。
- `.env` ファイルがコミットに含まれていないことを常に確認する。
