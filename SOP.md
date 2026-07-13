# POS System — 開發 / 部署 SOP

## 🚀 第一次開發（從零開始）

1. **確認 PRD**：讀 `PRD/SPEC.md` 完整規格
2. **安裝相依套件**：`npm install --legacy-peer-deps`
3. **啟動開發伺服器**：`npm run dev`
4. **修改程式碼**：編輯 `src/components/views/*` 與 `src/lib/*`
5. **測試**：在 http://localhost:3000 操作 8 個模組

## 🏗️ 部署到 Vercel

```bash
# 1. 確保 build 通過
npm run build

# 2. 部署
export VERCEL_TOKEN=$(grep VERCEL_TOKEN ~/.hermes/credentials/vercel.env | cut -d= -f2)
npx vercel deploy --prod --yes --token "$VERCEL_TOKEN"

# 3. 記下 production URL（會在輸出最後一行）
```

## 🔄 日常更新流程

```bash
# 1. 改 code
# 2. 確認 build
npm run build

# 3. git commit + push
git add -A
git commit -m "描述這次改動"
git push origin main

# 4. Vercel 會自動 redeploy（如果已連結 GitHub）
# 或手動：npx vercel deploy --prod --yes
```

## 🗄️ 資料持久化

- 所有資料存於瀏覽器 **localStorage** (key: `pos-storage`)
- 首次啟動自動載入 demo 資料（20 商品 / 8 會員 / 30 天交易）
- 重置 demo：到「設定」頁 → 「重置 Demo 資料」

## 🐛 除錯

- **白屏**：開 DevTools → Console 查錯誤
- **資料不見**：localStorage 被清 → 到「設定」重置 demo
- **build 失敗**：檢查 tsconfig.json 的 `@/*` alias 是否設定正確

## 📝 Notion 同步

1. 取得 Notion token：`source ~/.hermes/credentials/notion.env`
2. 找到對應 Notion page（OpenClaw Project DB）
3. 更新「程式碼完成度」+「狀態」欄位
4. SPEC 變動時同步更新 `PRD/SPEC.md`

## 🎯 MVP 邊界

**有做**：
- 8 個模組完整 UI
- 商品/會員/交易 CRUD
- 條碼掃描（鍵盤輸入模擬）
- 多付款方式 + 找零計算
- 完整報表 + AI 助理分析
- localStorage 持久化

**未做（標註為整合入口）**：
- 真實金流 API（信用卡授權、Line Pay API）
- 真實發票列印（需連結財政部電子發票）
- 硬體整合（掃碼槍、出鈔機、發票印表機）
- 多店管理 / 雲端同步
- 權限細粒度控管（目前只有 admin/manager/cashier 三層）
