# StarFadeWiki 迭代进程规范

> **最后验证**: 2026-08-26 — typecheck ✅ / vitest 13 tests ✅ / build ✅ (主chunk 585KB, gzip 171KB)

> 持续迭代 · 收集灵感 · 重新审视 · 再规划

---

## 核心循环

```
收集灵感 → 重新审视 → 再规划 → 执行迭代 → 归档版本
     ↑________________________________________|
```

每完成一次迭代后，进入"灵感收集"阶段，然后回到审视/规划。

---

## 版本归档规则

`Code/backup/` 目录下的历史版本：

| 编号 | 命名规则 | 说明 |
|------|----------|------|
| `000_` | 原始版 | 初始完整项目，永远保留 |
| `001_` | v1.0_xxx | 当前迭代版本 |
| `002_` | v2.0_xxx | 下一个迭代版本 |
| `003_` | v3.0_xxx | 后续迭代版本 |
| `004_` | v4.0_xxx | 后续迭代版本 |

- **最多保留 5 个版本**（000 + 001-004）
- 新版本产生时，最老的迭代版本（002）被新版本替换
- `000_原始版` 永不删除

**归档方法：**
```bash
# 每次迭代完成后，复制项目（不含 node_modules/.git/dist）到 backup/
SRC="/c/Users/cyy/Desktop/Code/StarFadeWiki"
DST="/c/Users/cyy/Desktop/Code/backup/NNN_vX.X_名称"

find "$SRC" -not -path '*/node_modules/*' -not -path '*/.git/*' \
  -not -path '*/dist/*' -not -name 'node_modules' \
  -not -name '.git' -not -name 'dist' -type f | \
while read f; do
  rel="${f#$SRC/}"
  mkdir -p "$DST/$(dirname "$rel")"
  cp "$f" "$DST/$rel"
done
```

---

## 迭代工作流

### 阶段 1：收集灵感 🧠

当一次迭代完成（或需要停下时）：

1. **浏览器设计参考**：打开 popular-web-designs skill 中的设计模板
2. **搜索竞品**：研究同类型产品的最新 UI 趋势
3. **回顾子个体报告**：重新阅读设计师/玩家/审查师的报告
4. **记录新想法**：保存到 `.hermes/plans/` 下的灵感笔记

### 阶段 2：重新审视 👀

1. 再次审查项目结构书（`PROJECT_STRUCTURE.md`）
2. 查看当前的代码质量和未修复的问题列表
3. 对比最新版和原始版的差异
4. 评估用户价值 vs 开发成本

### 阶段 3：再规划 📋

1. 使用 `plan` skill 写新的迭代计划
2. 每个计划包含最多 5 个 Task
3. 每个 Task 验证后再进入下一个
4. 保存到 `.hermes/plans/YYYY-MM-DD_HHMMSS-xxx.md`

### 阶段 4：执行迭代 ⚡

1. 按计划顺序执行 Task
2. 每个 Task 完成后：`tsc --noEmit` + `npm run build` 验证
3. 遇到问题用 `systematic-debugging` skill
4. 所有 Task 完成后，归档版本

---

## 常用工具

| 用途 | 工具 |
|------|------|
| TypeScript 检查 | `npx tsc -p tsconfig.app.json --noEmit` |
| 构建 | `npm run build` |
| 类型检查 + Lint | `npm run lint` |
| 快速验证 | 浏览器打开 `dist/output/index.html` |

---

## 当前迭代状态

| 项目 | 值 |
|------|-----|
| 当前版本 | v3.0 舰队构建器版 ✅ + **v4.0 启动**（2026-08-26） |
| 已完成 Task | P0修复(build.sh MSYS路径+bundle -71%)+v2.0设计迭代+**v3.0舰队构建器**(FleetContext/选船面板/清单统计栏/ZC超限警告/一键优化/导出导入/移动端tab/规则速查?) + vitest 16测试全绿 |
| v4.0 已做 | Command Palette(Ctrl+K, cmdk) + 分享链接(#fleet=base64url) + 数据命名对齐AGENTS.md(MOCK_*→*_DATA) |
| 待办 | v4.0 余项：ILP精确优化(替换贪心) + 对比增强 + 部署验证(push被凭证阻塞待用户) |

---

## 2026-10-25 深度研究 + 波次0应急止损（10 子代理审查后执行）

> 全套报告见 `E:\Code\研究报告\01~10`，总纲见 `E:\Code\深度研究与改进-计划总纲-20261023.md`。
> 总纲技术裁定已修正 v4.0 方向：**放弃 ILP**（实测贪心与精确 DP 差距 0.00%），改 Web Worker 粒化 DP。

| 波次0动作 | 结果 |
|-----------|------|
| P0-1 push 保命 | ✅ 10 个积压提交 + 波次0修复提交 `253d7c0` 均已推送（aeac6d6..253d7c0），ahead 归零 |
| P0-2 MSYS 污染根治 | ✅ build.sh 增加 `MSYS_NO_PATHCONV=1` + `MSYS2_ENV_CONV_EXCL='*'`（根治 `/`开头变量被改写为 Git 安装根）；守卫升级：检出 `Program Files` 污染即 FATAL + 校验 index.html 引用的 assets 全部存在。已重建 dist：0 污染、引用完整 |
| P0-3 Toaster 挂载 | ✅ app 根部挂载（此前从未被引用，8 处 toast 全部静默失效）；typecheck 通过 |
| P0-4 wrangler | ✅ wrangler@4.152 入 devDependencies（消除 npx 临时安装这条 6-29 部署失败路径）+ 新增 `npm run deploy`；**部署本体阻塞在交互式 `wrangler login`，待用户执行** |
| P0-5 tag | ✅ `v3.0`→f5831cc、`v4.0-start`→d8bf7a3 已推送远端；.hermes v4 计划文件已收编入库 |
| 波次1 预告 | 前端 9 项 P1（约12h）→ 总册→TS 校验器 → 光环建模（优化器 685→真最优 959）→ 文档 v2.0 翻新 |

---

## 2026-10-25 波次1 修固（同日完成，3 子代理并行 + 主会话引擎/文档）

| 线 | 交付 |
|----|------|
| 引擎（主会话） | **光环建模**：optimizeFleet 枚举光环舰子集（补给舰+40%/督导舰+25%，乘法复合）×贪心，新增 effectiveFP/auraMultiplier/auraApplied；OptimizePanel 显示"等效战力(含光环)"，未纳入光环舰以警告披露。AURA_OUTPUT_BONUS 入 rules.ts。测试 13→21 例全绿（含"光环收益低于填充舰时正确拒绝"回归例）；calcTotalDeterrence 补测试（此前零覆盖） |
| 前端（子代理） | 10 项 P1 全清：筛选状态单一化（Header↔FilterBar 双事实源消除）、重复 DOM id 清零、热力图/模板 Tailwind 动态类改字面量映射表、`lib/format.ts` 统一格式化（四份 MAINTENANCE_LABELS 归一）、ClickableCard 键盘化、浅色主题 token 化、星空合一+reduced-motion、ShipCard memo + ShipGrid 稳定化、规则速查移动端入口（Header BookOpen 按钮）。maintenanceFacility 36 条死数据删除（字段留可选因测试夹具引用）；ships.ts"精确复现TOP5"不实注释修正 |
| 数据（子代理） | parse-pdf.cjs 修复（pdf-parse v2 两段式 API）；**verify-ships.cjs 校验器**（`npm run verify:data`）：DOCX 主源 36 舰×11 字段逐格比对 + 4 项派生自洽，实测零偏差，--selftest 变异自检、--source=pdf 兜底；rankings.ts 头部溯源注释（编制值声明） |
| 文档（主会话） | README（门面）/AGENTS（技术规范）/docs/requirements（需求）归位；新增 docs/deploy.md、docs/data-dictionary.md、CHANGELOG.md；RECOVERY_MAP 四处失真修正；PROJECT_STRUCTURE 升 v2.0 |
| 验收 | typecheck 0 错误；**24/24 测试全绿**；verify:data 36/36；build 三守卫通过 0 污染；eslint 0 error |

---

*本文件随项目迭代持续更新*