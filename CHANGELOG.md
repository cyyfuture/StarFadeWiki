# CHANGELOG

语义化版本记录。早期版本（v0.0–v3.0）摘自 PROJECT_STRUCTURE 版本历史；此后按迭代追加。

## [Unreleased] — v4.0 收官中 + 波次1修固

### Added (2026-10-25)
- **fleet-math 光环建模**: 一键优化枚举光环舰子集（补给舰 +40% / 督导舰 +25% 输出，乘法复合）× 贪心，取等效战力最高组合；`OptimizeResult` 新增 `auraApplied/auraMultiplier/effectiveFP`；OptimizePanel 展示"等效战力(含光环)"与光环构成；未纳入的光环舰以 warnings 披露（此前被静默当 0 战力排除，用户会误判"补给舰无用"）
- 光环常量单一来源: `lib/rules.ts` 新增 `AURA_OUTPUT_BONUS`（数值出自总册 regularFP 原文）
- 测试: fleet-math 13 → 21 例（新增威慑公式 2 例、光环建模 5 例，含"光环收益低于填充舰时正确拒绝"回归例）
- `calcTotalDeterrence` 补充单元测试（此前零覆盖）

### Fixed (2026-10-25, 波次0)
- build.sh: 根治 Git Bash MSYS 路径转换污染（`MSYS_NO_PATHCONV=1` + `MSYS2_ENV_CONV_EXCL='*'`）；产物守卫升级（污染检测 + assets 存在性校验）
- 全站 toast 静默失效: `<Toaster />` 挂载于 app 根（ui/sonner 包装器此前从未被引用）
- 部署链: wrangler@4.152 入 devDependencies（消除 npx 临时安装失败路径），新增 `npm run deploy`

### Docs (2026-10-25)
- README（门面）/ AGENTS（技术规范）/ docs/requirements（需求）三者归位（此前 README 与 AGENTS 内容互换错位）
- 新增 docs/deploy.md、docs/data-dictionary.md、CHANGELOG.md；RECOVERY_MAP 修正 Desktop 旧路径、过时提交数、已删除依赖、ILP 裁定与 push 边界

### Changed (仓库治理, 2026-10-25)
- 清偿 10 个积压提交 push 至远端；打 tag `v3.0`、`v4.0-start`；.hermes v4 计划文件收编入库

---

## [v4.0-start] — 2026-08-26（tag v4.0-start）
- Command Palette（Ctrl+K, cmdk）+ 舰队分享链接（`#fleet=base64url`）+ 数据命名对齐 AGENTS.md

## [v3.0] — 2026-08-26（tag v3.0）
- 舰队构建器: FleetContext + 选船/清单/ZC超限警告/一键优化/导出导入(zod校验)/移动端双 tab
- fleet-math 引擎 + vitest 13 测试；rules.ts 常量单一来源；IShip 扩展 zcCost/szValue/fpNumeric（36/36 补录零 NaN）
- bundle 1684KB→585KB（-65%，SVG 雷达替代 echarts，删 recharts/gsap）
- build.sh MSYS 首修（cygpath -m + 空产物保险丝）；规则速查（`?` 呼出）

## [v2.0] — 2026-07-09
- 浅色主题 + useTheme 统一 + 配队热力图 + 响应式排版 + 雷达图（未及时归档，直接迭代）

## [v1.0] — 2026-07-03
- Header/Sidebar props 修复 + 搜索联动 + HTML/Favicon/SEO

## [v0.0] — 2026-06-30
- 初始完整版（36 舰 + 7 舰载机 + 规则 + 模板 + 排名）
