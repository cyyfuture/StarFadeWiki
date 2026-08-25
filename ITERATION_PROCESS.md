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
| 当前版本 | v3.0 舰队构建器版（2026-08-26） |
| 已完成 Task | P0修复(build.sh MSYS路径+bundle -71%)+v2.0设计迭代+**v3.0舰队构建器**(FleetContext/选船面板/清单统计栏/ZC超限警告/一键优化/导出导入/移动端tab/规则速查?) + vitest 13测试全绿 |
| 待办 | v4.0 功能增强（Command Palette+对比增强+智能推荐） |
| 下一迭代目标 | v4.0: Command Palette + URL分享方案 + 智能推荐(ILP精确优化) |

---

*本文件随项目迭代持续更新*