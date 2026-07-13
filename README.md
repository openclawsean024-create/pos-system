# POS System | 收銀管理系統

> 全通路零售 POS 系統 MVP — 收銀、庫存、會員、報表一站搞定

🔗 **線上展示**：https://pos-system-pied-seven.vercel.app

## 📋 規格

完整 PRD 在 [`PRD/SPEC.md`](./PRD/SPEC.md)（Notion v2.2.1 對齊版）

## 🚀 功能模組

- 🛒 **收銀介面** — 商品選擇、條碼掃描、購物車、4 種付款方式、現金找零
- 📦 **庫存管理** — 商品 CRUD、低庫存警示、自動扣減、毛利率計算
- 👥 **會員 CRM** — 會員 CRUD、點數累積、儲值卡、4 級會員等級、自動升等
- 📊 **報表中心** — 日/週/月營收、熱銷 TOP 5、會員排行、毛利分析、付款方式分佈
- 🤖 **AI 助理** — 低毛利警示、即將缺貨、銷售下滑/成長偵測、高貢獻會員識別
- 👨‍💼 **員工管理** — 員工 CRUD、上下班打卡、交易業績排行
- ⚙️ **系統設定** — 店家資訊、稅率、收據格式、會員點數規則

## 🛠️ 技術棧

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Zustand (with persist middleware → localStorage)
- lucide-react (icons)
- date-fns (日期處理)

## 🏃 本地開發

```bash
npm install --legacy-peer-deps
npm run dev
# 開啟 http://localhost:3000
```

## 🏗️ 生產部署

```bash
npm run build
npx vercel deploy --prod --yes
```

## 🔐 測試帳號

| 帳號 | 密碼 | 角色 |
|------|------|------|
| admin | admin | 管理員 |
| manager | 1234 | 店長 |
| cashier01 | 1234 | 收銀員 |
| cashier02 | 1234 | 收銀員 |

## 📂 專案結構

```
pos-system/
├── PRD/SPEC.md          # 完整規格書
├── app/                 # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx         # 入口（自動切換 Login/MainApp）
│   └── globals.css
├── src/
│   ├── components/      # React 元件
│   │   ├── LoginScreen.tsx
│   │   ├── MainApp.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── views/       # 8 個模組頁面
│   └── lib/
│       ├── types.ts     # 型別定義
│       ├── store.ts     # Zustand store
│       ├── demo-data.ts # 預載示範資料
│       └── utils.ts     # 工具函式
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── vercel.json
├── .gitignore
└── README.md
```

## 📜 開發 SOP

詳見 [SOP.md](./SOP.md)

## 📝 License

© 2026 OpenClaw — Sean Li
