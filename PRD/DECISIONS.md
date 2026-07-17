# pos-system — 決策記錄

> SSOT 之一。**回答「為什麼」**：為什麼這個專案是現在這個樣子。
> 格式：(A) 問題陳述 / (B) 考慮的選項 / (C) 最後決策 / (D) 日期。

---

## D-001：採用 SSOT 4 文件（2026-07-16 政策）

**(A) 問題**：之前專案沒有單一事實來源，導致「同一個專案散落 4 個 codebase」、「每次 session 開頭要重新偵察」、「context 壓縮後失憶」。

**(B) 選項**：
- B1：靠記憶 + 對話傳遞（高錯誤率）
- B2：只寫 Notion（Notion 是 delivery 看板，不是 SSOT）
- B3：4 文件齊全：SPEC / ARCHITECTURE / DECISIONS / PROJECT_STATE（本檔）

**(C) 決策**：B3。

**(D) 日期**：2026-07-16（Sean 拍板）

**取捨**：
- ✅ 任何 session 開頭自動 pwd-check 印 SSOT 狀態
- ✅ 不再寫願望進這 4 個檔（願望只進 SPEC）
- ⚠️ 還沒深挖這個專案自己的歷史決策（待 § TODO）

---

## 待補（D-NNN：這個專案自己的歷史決策）

- [ ] 自動從 git log 逆向解讀這個專案的「砍後端」、「改 stack」、「rename」等歷史決策
- [ ] 暫存: 2 個 commit 等被解讀

---

**最後更新**: 2026-07-16 (SSOT Factory)
