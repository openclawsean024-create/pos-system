# Deployment Evidence: pos-system

- **Date**: 2026-07-17T23:48+08:00
- **Commit**: 72992162354d2adf38441a6b1722b5ade2d93c5d (chore: commit existing PROJECT_STATE.md)
- **Primary URL (production)**: https://pos-system-pied-seven.vercel.app
- **Deployment URL**: https://pos-system-z9jook797-seans-projects-7dc76219.vercel.app
- **Primary HTTP Status**: 200, 0.10s (follow redirect)
- **Deploy Duration**: 41s
- **Log**: /tmp/pos-system-deploy-1784303082.log
- **Verified by**: production-deploy-safe.sh v1

## Raw vercel output (last 15 lines)

```
Building: Build Completed in /vercel/output [22s]
Building: Deploying outputs...
Production: https://pos-system-z9jook797-seans-projects-7dc76219.vercel.app [40s]
Completing...
Aliased: https://pos-system-pied-seven.vercel.app [40s]

  deploy exit: 0
  duration:    41s
```

## Cross-verification

```
$ vercel ls pos-system | head -3
  3m    pos-system    https://pos-system-z9jook797-...    ● Ready    Production    34s

$ curl -sL -o /dev/null -w "%{http_code}" https://pos-system-pied-seven.vercel.app/
200

$ curl -sL https://pos-system-pied-seven.vercel.app/ | grep -oE "<title>...</title>"
<title>POS System | 收銀管理系統</title>
```

## SOP improvements made during this deploy

- production-deploy-safe.sh v1.1: curl primary alias (not deployment URL), accept 200/302
  - 原因: Vercel 預設 deployment URL 會 302 redirect 到 primary alias
  - 之前: 直接 curl deployment URL → 302 → SOP 誤判為 fail
  - 之後: curl -L follow redirect + 同時 curl deployment URL 確認 redirect chain

## Honest accounting

What was deployed:
- ✅ build / typecheck / lint (local, exit 0)
- ✅ 51 unit tests + 100% util coverage (vitest)
- ✅ a11y 55 aria-labels (was 0)
- ✅ SSOT 4 files
- ✅ ESLint 9 flat config (Next.js 16 deprecation fix)

What was NOT verified post-deploy:
- ⚠️ Production URL live dogfood (D3) — only curl + title check
- ⚠️ Full user flow from production (B3) — manual dogfood pending
- ⚠️ Lighthouse production (D2) — not run
- ⚠️ a11y 55 aria are mostly placeholder (real labels needed)

## Rollback procedure (if needed)

1. Vercel Dashboard → previous Ready production → Promote
2. `cd /home/sean/Program/pos-system && vercel rollback`
3. `cd /home/sean/Program/pos-system && git revert HEAD && git push`