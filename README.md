# StarFadeWiki — 星海舰队桌游数据 Wiki

一站式查阅 **36 种舰船 + 7 种舰载机 + 完整跑团规则** 的静态数据站，附舰队构建器：预算/指挥容量双约束的一键优化（含乘法光环建模）、ZC 超限警告、导出导入与分享链接（`#fleet=`）、Command Palette（Ctrl+K）、规则速查（`?` 或 Header 按钮）。

- **技术栈**: React 19 + TypeScript + Vite(rolldown) + Tailwind CSS v4 + shadcn/ui + framer-motion
- **形态**: 纯前端静态站，无后端无 API；数据为 TypeScript 常量（源自官方总册，机器校验）
- **部署**: Cloudflare 静态资产（项目名 `starsadewiki1`）
- **仓库**: github.com/cyyfuture/StarFadeWiki（tag: `v3.0`、`v4.0-start`）

## 快速开始

```bash
npm install
npm run dev          # 开发
npm run typecheck    # 类型检查
npm test             # 单元测试（fleet-math + share）
npm run build        # 构建 → dist/output/（含 MSYS 污染守卫与产物完整性校验）
npm run verify:data  # 总册→ships.ts 机器一致性校验
npm run deploy       # 构建 + 部署（首次需 npx wrangler login）
```

## 文档索引

| 文档 | 内容 |
|------|------|
| [AGENTS.md](AGENTS.md) | 技术规范：目录规则、禁改文件、命令、主题变量 |
| [docs/requirements.md](docs/requirements.md) | 需求拆解 + UI 设计指南 |
| [docs/deploy.md](docs/deploy.md) | 构建与部署手册 |
| [docs/data-dictionary.md](docs/data-dictionary.md) | 数据词典：字段口径与派生规则 |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | 结构书与版本历史 |
| [ITERATION_PROCESS.md](ITERATION_PROCESS.md) | 迭代流程与当前状态 |
| [RECOVERY_MAP.md](RECOVERY_MAP.md) | 遗忘恢复地图（断点续作入口） |
| [CHANGELOG.md](CHANGELOG.md) | 变更日志 |

## 数据一致性

`src/data/ships.ts` 等数据文件转录自《全舰船_舰载机_规则数据总册》（DOCX/PDF）。**改任何数值必须**：

1. 跑 `npm run verify:data`（对照总册逐字段机器比对）；
2. 派生字段规则见 [docs/data-dictionary.md](docs/data-dictionary.md)（`zcCost = cost/100` 等）。

## 迭代与治理

版本演进、改进波次与裁定记录见 `ITERATION_PROCESS.md` 与改进总纲 `E:\Code\深度研究与改进-计划总纲-20261023.md`。发版打 git tag，废除目录复制式归档。
