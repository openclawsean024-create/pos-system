# pos-system — 專案狀態

> SSOT 之一。**回答「現在怎樣」**：狀態機位置、待辦、bug、下一步。

---

## 1. 狀態機位置

```
[01_DISCOVERY] → [02_DESIGN] → [03_BUILD] → [04_TEST] → [05_DEPLOY] → [06_DELIVER]
```

⚠️ 待評估 — 看 `PRD/ARCHITECTURE.md` 跟 git history 才能判定。

---

## 2. 待辦（依優先）

| ID | 待辦 | 預估 |
|---|---|---|
| TODO-1 | 解讀 git history 補 PRD/DECISIONS.md 的 D-NNN | 30 min |
| TODO-2 | 補 PRD/ARCHITECTURE.md §5 §6 | 15 min |
| TODO-3 | pwd-check 驗證三向（local + GitHub + Vercel + Notion）對齊 | 15 min |
| TODO-4 | 依商業化目標推進或停在 prototype 階段 | 待 Sean 決 |

---

## 3. 下一步

等 Sean 決定「這個專案要推到幾分 / 幾個 session」。

短期最低成本：
1. 完成 TODO-1 + TODO-2（補完 SSOT 細節）
2. pwd-check 一次
3. 靜止直到 Sean 開新工作

---

## 4. SSOT 文件地圖

```
pos-system/
├── PRD/
│   ├── SPEC.md
│   ├── ARCHITECTURE.md
│   └── DECISIONS.md
└── PROJECT_STATE.md
```

| 議題 | 開哪個檔 |
|---|---|
| 「這個專案要做什麼」| SPEC.md |
| 「現在用什麼技術」| ARCHITECTURE.md |
| 「為什麼這樣決定」| DECISIONS.md |
| 「現在卡什麼、下一步」| PROJECT_STATE.md |

---

**最後更新**: 2026-07-16 (SSOT Factory)
