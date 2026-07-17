# pos-system — 架構藍圖

> SSOT 之一。**只記錄現有事實**，願望與計劃看 SPEC.md / PROJECT_STATE.md。
> 建立日期: 2026-07-16（SSOT Factory），作者: Hermes Agent。
> 來源: package.json + git log + find 反推。

---

## 1. 技術棧（反推自 package.json）

- Next.js (App Router)
- React
- Tailwind
- TypeScript
- Zustand
- lucide-react

更多依賴請參考 `package.json`。

---

## 2. 目錄結構（find -maxdepth 3）

```
.
src
src/lib
src/components
src/components/views
PRD
app
```

---

## 3. Git 狀態

| 項目 | 值 |
|---|---|
| HEAD SHA | 7de2e74 |
| HEAD 日期 | 2026-07-13 |
| HEAD 訊息 | Add PRD/SPEC.md and clean structure |
| Branch | master |
| 總 commit 數 | 2 |
| Remote | openclawsean024-create/pos-system |

---

## 4. SSOT 文件狀態（建立當下）

| 文件 | 狀態 |
|---|---|
| PRD/SPEC.md | ✅ |
| PRD/ARCHITECTURE.md | ✅（本檔） |
| PRD/DECISIONS.md | ✅（SSOT Factory 自動建立） |
| PROJECT_STATE.md | ✅（SSOT Factory 自動建立） |

---

## 5. 待補完（TODO — 後續 session 解讀 commit 歷史補）

- [ ] §1 技術棧精確版本（從 package-lock.json 抓）
- [ ] §2 主要業務模組 / API endpoints（從 src/ 結構補）
- [ ] §6 已知技術風險（從 commit message 「fix:」關鍵字抓）
- [ ] §5 部署拓樸（從 .vercel/project.json + Notion 對齊）

---

**最後更新**: 2026-07-16 (SSOT Factory)
