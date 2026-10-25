# StarFadeWiki v4.0「完成态」总纲 — 极致详细实施计划

> **For Hermes:** 按 Phase 顺序执行，每个 Task 完成后必须验证（命令+期望输出已写明）再进入下一个。可用 subagent-driven-development 逐 Task 派发，每 Task 带上本文件对应段落 + RECOVERY_MAP.md。
>
> 编制时间: 2026-08-26 05:33 | 前置状态: v3.0 已交付(tag v3.0-fleet-builder) + v4 首批(Command Palette/分享链接/数据命名)已完成
> 代码事实核查时间: 2026-08-26 05:32（本计划所有"现状"均为当时 grep/read_file 实证）

---

## 〇、总目标与验收标准

**一句话**: 把 StarFadeWiki 收尾成"可分享、可对比、可部署、可交接"的完成态——v4 是打磨与工程化版本，不追新功能面。

**硬验收标准**:

| # | 标准 | 验证方式 |
|---|---|---|
| A1 | 对比弹窗有最优项高亮 + 与构建器互通（从对比一键带入构建器） | 浏览器手测 §5 |
| A2 | ILP 精确优化替换贪心：5000A/上限50 场景下 FP ≥ 贪心结果，且 ≤8000 规模求解 <300ms | vitest 基准测试 |
| A3 | 首屏 LCP 改善：路由级代码分割落地，首屏 JS < 700KB | build 日志对比（当前单包 603KB） |
| A4 | `git push origin master --tags` 成功、GitHub Actions CI 绿、Cloudflare Pages 生产 URL 可访问且含 #builder | curl 探测 |
| A5 | 组件归位后 lint/typecheck/build 三绿，无循环依赖 | 实测 + madge --circular |
| A6 | 新会话冷启动恢复：只读 RECOVERY_MAP.md + git log 能说出项目全貌 | 自测 |

**明确不做**（YAGNI 边界，与 v3 相同）：不做后端/账号/云存档；不做 i18n；不做虚拟滚动；不引 redux/zustand；ILP 不引 OR-tools——用自写分支定界或 jsLPSolver 二选一（见 Task 1.3 决策点）。

---

## 总路线图（四阶段）

```
Phase A 工程地基(组件归位+CI)     ← 纯机械重构，先做避免后面 rebase 痛苦
   ↓
Phase B 对比增强(功能层)          ← A1
   ↓
Phase C 精确优化(算法层)          ← A2
   ↓
Phase D 性能与部署(交付层)        ← A3+A4, push 必须先解决凭证
```

依赖说明：Phase A 动文件路径 → 必须最先做（否则 B/C 的 diff 全要重排）；B 和 C 无相互依赖可并行；D 的部署验证依赖 push 成功。

---

## Phase A：工程地基（预计 0.5 天）

### Task A1 组件归位 pages/WikiHomePage/components/

**Objective:** 兑现 README 的文件放置规则；全局组件留 src/components/。

**现状实证（05:32 grep）:** 17 个组件全部只有 1 个 importer。归位映射：
- **移入** `src/pages/WikiHomePage/components/`: HeroSection, ShipCard, ShipFilterBar, ShipDetailModal, CompareModal, SquadronSection, RulesSection, TemplatesSection, RankingsSection, FleetHeatmapSection（10个，页面专属）
- **留下**: Header, AppSidebar, Footer, StarfieldBackground（布局/全局装饰）+ RadarChart, RulesQuickRef, CommandPalette（跨页面复用潜力，v4 后若加路由页会用）
- builder/ 子目录整体随迁或留原位均可——推荐**留在 src/components/builder/**（其内部相对导入 ./share 不受影响，改动最小）

**Files:** `git mv` 上述 10 个文件 + WikiHomePage.tsx 及互引的 import 路径改写

**Step 1:** 逐个 `git mv src/components/X.tsx src/pages/WikiHomePage/components/X.tsx`
**Step 2:** 批量改 import：`@/components/HeroSection` → `./components/HeroSection`（仅 WikiHomePage 内）；ShipCard 被 ShipCard 自己引用 RadarChart 的路径核对
**Step 3:** 删除无引用模板残留 `src/pages/ExamplePage/`
**Step 4: 验证**
```bash
npm run typecheck && npm run lint   # 均 exit 0
npx vite build --logLevel warn 2>&1 | head -3  # 或直接 npm run build
```
**Step 5:** Commit `refactor: move page-specific components under pages/WikiHomePage/components`

### Task A2 GitHub Actions CI

**Objective:** 每次推送自动跑三件套，替代"本地记得才验证"。

**Files:** Create `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push: { branches: [master] }
  pull_request:
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npx vitest run
      - run: npm run build
```

**注意:** build.sh 在 Linux 上走原生路径分支（case uname），cygpath 分支不会触发——但要在 PR 里确认一次 Linux 构建真通过（这正是 v3 时推断"远程正常"的首次实证）。

**验证:** push 后 Actions 页面全绿（依赖 Task D1 push 完成，可先提交等 push 后看结果）。

### Task A3 循环依赖检查（一次性体检）

```bash
npx -y madge --circular --extensions ts,tsx src
# 期望: No circular dependency found!
```
若有环：优先断在 lib 层（fleet-math/rules 不许反向 import 组件）。修复后记录到 RECOVERY_MAP。

---

## Phase B：对比增强（预计 0.5 天）

> 现状实证: CompareModal 接口 `{open, onOpenChange, ships: IShip[], onRemoveShip}`；WikiHomePage 维护 selectedShipIds Set，上限5艘（132-160行）；无任何高亮/建议逻辑。

### Task B1 最优项高亮

**Objective:** 对比表里每列数值最优者加 primary 高亮徽章，一眼看出"谁便宜/谁抗打/谁省维护"。

**设计:** 新建纯函数 `getBestValues(ships, keys)` 放 `src/lib/compare-math.ts`：
- 输入舰数组 + 参与评比的数值键列表 `[cost(低优), monthlyMaintenance(低优), fpNumeric(高优), zcCost(低优), maintenanceFPRatio(高优), szValue(高优)]`
- 返回 `{ [shipId]: Set<key> }` 标记每舰哪些键是全场最优
- 方向规则写成常量表，别散在 JSX 里
- **vitest 先行**：并列最优都标记、NaN 舰不参与评比

**UI:** CompareModal 表格单元格按 best 集合加 `text-primary font-semibold` + 小皇冠图标（lucide Crown，尺寸12）。复合字符串字段（regularFP 含文本）跳过评比。

**验证:** 选 私掠船/导弹巡游舰/轻巡洋舰 三艘对比——私掠船造价列应高亮、导弹巡游舰战力列应高亮；`npx vitest run` 全绿。

### Task B2 对比 → 构建器互通

**Objective:** 对比弹窗加「把这几艘带入构建器」按钮 → replaceAll(units, null) 并滚动到 #builder。

**实现:** CompareModal 加可选 prop `onSendToBuilder?: (ships: IShip[]) => void`；WikiHomePage 里实现为：
```typescript
replaceAll(ships.map(s => ({ shipId: s.id, count: 1 })), budget);
document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth' });
toast.success('已带入舰队构建器');
```
按钮放弹窗 footer 左侧，次级样式（border 按钮，不抢主 CTA）。空舰队场景天然覆盖（count=1 起步）。

**验证:** 手测往返——选3艘→带入构建器→清单出现3行各×1→ZC能量槽正确累加。

---

## Phase C：精确优化 ILP（预计 1 天）

> 现状: optimizeFleet 是贪心（性价比降序装入）。贪心的已知缺陷：剩 2 点 ZC 装不下任何大舰时直接放弃预算；组合边界 case 可能显著次优。

### Task C1 线性化建模 + 决策点

**Objective:** 把问题形式化为整数规划并选定求解器。

**模型:**
```
maximize Σ fp_i·x_i
s.t. Σ cost_i·x_i ≤ Budget
     Σ zc_i·x_i ≤ Cap
     x_i ∈ ℤ≥0, 且 Σ zc_i·x_i ≤ Cap 隐含数量上限
```
36 个整型变量的小规模问题。

**决策点（执行前二选一，推荐①）:**
1. **jsLPSolver**（~50KB，纯JS整数规划，npm 有维护）——引入新 runtime dep，但求解正确性白拿
2. **自写分支定界**——零依赖但要写对松弛/剪枝，约150行 + 更多测试

倾向①：603KB 包体还有余量（gzip 后 solver 增量 ~15KB）；且"正确性白拿"符合本项目"严禁编造须可复核"的价值观。装完先跑 bundle diff，若主 chunk 涨超 30KB 再改动态 import()。

### Task C2 实现 + 基准测试（TDD）

**Files:** Modify `src/lib/fleet-math.ts`（optimizeFleet 内部换引擎，函数签名不变——贪心保留为 `_greedyFallback`，solver 失败/超时自动降级）；新增基准测试。

**关键测试用例:**
```typescript
it('ILP 结果 FP ≥ 贪心 (5000A/cap50)', () => {
  const greedy = optimizeFleet(SHIPS_DATA, 5000, 50, { engine: 'greedy' });
  const ilp = optimizeFleet(SHIPS_DATA, 5000, 50);
  expect(ilp.totals.totalFP).toBeGreaterThanOrEqual(greedy.totals.totalFP);
});
it('求解超时/失败时优雅降级到贪心', ...);
it('性能: ≤8000A 规模求解 < 300ms', () => { /* performance.now 计时 */ });
it('边界: 预算小于最便宜有效舰 → 空解+warning', ...);
```

**UI 配套:** OptimizePanel 结果区显示引擎标签「精确最优」或「启发式(降级)」，诚实标注。

**验证:** `npx vitest run` 全绿（含新基准）；手测 5000A 生成对比旧贪心结果 FP 不降。

---

## Phase D：性能与部署（预计 1 天 + 等用户）

### Task D1 解决 push 凭证 🔴阻塞项

**现状实证:** remote = https://github.com/cyyfuture/StarFadeWiki.git；credential.helper=manager；后台 push 报 `could not read Username`（askpass 无法弹 GUI）。直连 github.com ls-remote 已验证网络可达。

**方案（按优先级）:**
1. **用户手动 push 一次**（最简单）：终端跑 `git push origin master --tags`，GUI 弹窗确认后 Windows 会缓存凭证，此后 agent 后台 push 大概率直接成功
2. 用户给 PAT → `git config --global credential.helper store` + 写入 `https://<token>@github.com/` 形式的条目（**token 只进 credential store，不进 repo 文件**）
3. 改 SSH remote（需用户已有 SSH key）

**执行:** 方案1下用户 push 后，agent 用 `git ls-remote origin master` 校验远端 HEAD == 本地 HEAD，然后触发 Cloudflare Pages 构建（若已连 Git 集成则自动）。

### Task D2 路由级代码分割（A3）

**Objective:** 首屏 JS 从 603KB 降到 <700KB 目标内进一步压缩——重点是把 echarts 替代后的剩余大块（framer-motion + radix 全家桶 ~350KB 估算）中非首屏部分拆出去。

**手段（按收益排序）:**
1. `React.lazy(() => import(...))` 拆 FleetBuilderSection / FleetHeatmapSection / CommandPalette / CompareModal / RulesQuickRef —— 全部在首屏视口外，Suspense fallback 用骨架卡片
2. manuallyChunks: vendor 分组（react-dom 一组、radix 一组、motion 一组）——vite.config 的 advancedChunks
3. lucide-react 已 tree-shake，无需处理

**验证:** `npm run build` 后 index chunk 尺寸日志 + `dist/output/assets/` 文件列表；浏览器 Network 面板首屏加载量实测。

### Task D3 Cloudflare 部署验证（A4）

wrangler.jsonc 已存在（v0 时配好）。push 成功后：
```bash
# 若 Pages 连了 Git: 推送自动部署, 等待后 curl 探测
curl -sI https://starsadewiki1.pages.dev/ | head -3          # 期望 HTTP/2 200
curl -s https://starsadewiki1.pages.dev/ | grep -o "id=\"builder\""  # 期望命中
```
若未连 Git 集成：`npx wrangler pages deploy dist/output --project-name starsadewiki1`（需要用户一次性 `wrangler login`）。

**验证:** 生产 URL 打开 → Ctrl+K 呼出 Palette → 生成 5000A 方案 → 导出 JSON 再导入 → 往返一致。

### Task D4 最终文档同步

- PROJECT_STRUCTURE.md 版本历史补 v4.0 行（含 backup/004 归档记录）
- ITERATION_PROCESS.md 当前迭代状态表更新
- RECOVERY_MAP.md 状态改 🟢活跃(v4.0 完成态)，恢复指令补 CI badge 说明
- 按 ITERATION_PROCESS 规则归档 `backup/004_v4.0_完成态/`
- tag `v4.0-final` + push

---

## 附：风险登记簿

| 风险 | 可能 | 影响 | 缓解 |
|---|---|---|---|
| push 凭证继续卡（用户不在） | 中 | 中 | D1 排最前但不阻塞 A/B/C——全部可离线做完，push 攒着最后一批 |
| jsLPSolver 与 rolldown 打架 | 低 | 中 | 先装先测 bundle；不行退方案②自写分支定界（计划已备） |
| React.lazy 拆分后 Suspense 闪烁 | 中 | 低 | fallback 用同色骨架卡而非 spinner；AnimatePresence 包一层过渡 |
| 组件归位漏改 import | 低 | 低 | typecheck 即时兜底；逐 mv 逐验不批量 |
| ILP 在极端输入退化慢 | 低 | 中 | 求解器设 timeout 250ms 自动降级贪心，UI 如实标注 |
| CI 首跑发现 Linux 构建差异 | 低 | 中 | build.sh 的 cygpath 分支只在 MSYS 触发，理论无差异；真有就在 CI 日志里现形 |

## 附：执行方式建议

- 推荐 subagent-driven-development：Phase A 的 A1（纯机械）、C2（TDD 清晰）适合派发；D1 涉及用户凭证必须主会话交互
- 主会话自执行也完全可行，总量约 3 天
- 每 Phase 结束 commit + 可选 tag；最终 `backup/004_` 归档 + `v4.0-final` tag

## 附：给下一个执行者的三条铁律

1. **改前重查**：本计划的"现状实证"截至 2026-08-26 05:32，若 repo 又动了，先重新 grep 核对再动手
2. **strict=false 心法**：联合类型收窄一律 `'error' in r` / `'x' in obj`，不要信 boolean 判别式
3. **严禁编造数值**：任何拿不准的游戏数据标 NaN 待复核，宁可空着不可瞎填——这是用户铁律
