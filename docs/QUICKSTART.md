# Quickstart — Marketing-OS SEO

利用者向けの最短手順です。診断・評価のみ — 自動投稿・自動最適化は行いません。

## CLI（npm）

```bash
# サイト診断（API キー不要）
npx @start-x-work/mos-seo audit site https://example.com --format json

# コンテンツブリーフ（Gemini キーが必要）
export GEMINI_API_KEY="AIza..."
npx @start-x-work/mos-seo content brief "マーケティング自動化" --lang ja

# キーワードマップ + volume 推定
npx @start-x-work/mos-seo keyword map "マーケティング" --volume --format json
```

統合 CLI 経由:

```bash
npx @start-x-work/marketing-os seo audit llmo https://example.com
```

## Web UI

**URL:** https://marketing-os-seo.pages.dev

### 1. AI 機能（BYOK）

1. ページ下部の **「AI API キー（BYOK）」** を開く
2. Gemini API キーを入力して **保存**
3. **ブリーフ** / **キーワード** で AI 機能を利用

キーは **sessionStorage のみ** に保存されます。運営側の Cloudflare Secrets は不要です。

### 2. Google Search Console 連携（BYOK・任意）

GSC クエリをキーワードマップに含めたい場合:

1. [Google Cloud Console](https://console.cloud.google.com/) で OAuth 2.0 クライアント ID を作成
2. **承認済みリダイレクト URI** に以下を追加:
   - `https://marketing-os-seo.pages.dev/gsc-callback`
   - 自己ホスト時は `{your-origin}/gsc-callback`
3. Web UI フッターの **「Google Search Console（BYOK）」** で Client ID / Secret を保存
4. **GSC と連携** をクリック → Google 認可
5. **キーワード** 画面で GSC 連携用サイト URL を入力してマップ作成

### 3. 自己ホスト（任意）

```bash
cd packages/web
cp .dev.vars.example .dev.vars   # 任意のサーバー側フォールバック
pnpm install && pnpm build && pnpm preview
```

## OSS と商用の境界

| OSS（本リポ） | 商用 [Marketing-OS](https://marketing-os.jp) |
|---|---|
| 診断・ブリーフ・キーワード整理 | 組織横断ワークフロー |
| CLI / Web / ライブラリ | AI CMO 伴走・運用 BPO |
| BYOK（利用者自身の API キー） | SLA 付きサポート |

詳細: [manifesto — Marketing-OS との境界線](https://github.com/start-x-work/manifesto/blob/main/README.md#3-marketing-os-との境界線)
