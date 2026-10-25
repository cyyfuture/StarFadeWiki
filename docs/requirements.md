# 星海舰队桌游Wiki - 需求拆解文档

## 产品概述

- **产品类型**: 游戏Wiki数据站点
- **场景类型**: <scene_type>prototype-app</scene_type>
- **目标用户**: 星海舰队桌游玩家、舰队构建者、规则查阅者
- **核心价值**: 一站式查阅36种舰船+7种舰载机完整数据、跑团规则与配队模板，辅助玩家进行舰队构建与战术决策
- **界面语言**: 中文
- **主题偏好**: 深色（深蓝/深紫/黑色背景 + 霓虹蓝/青色/金色高光）
- **导航模式**: 锚点导航 + 侧边栏目录（桌面端侧边栏固定，移动端折叠为汉堡菜单）
- **导航布局**: Topbar（顶部固定导航栏）+ 侧边栏目录（桌面端）

---

## 页面结构总览

> **说明**：Wiki为单页锚点导航结构，所有内容在同一页面内通过锚点跳转

**页面文件**: `WikiHomePage.tsx`

| 区块名称 | 锚点 | 区块说明 |
|---------|------|---------|
| 顶部导航栏 | - | 固定顶部，含Logo、章节锚点链接、主题切换按钮、搜索入口 |
| 英雄区 | `#hero` | 大标题、副标题、六大核心指标图标展示 |
| 全舰种数据总表 | `#ships` | 36种舰船卡片式网格布局 + 筛选/排序/搜索/对比工具栏 |
| 舰载机中队数据 | `#squadrons` | 7种舰载机卡片式展示 + 数据表格 |
| 跑团战斗规则 | `#rules` | 规则说明卡片（指挥上限、威慑判定、克制倍率、维护等级） |
| 三大配队模板 | `#templates` | 3个配队模板卡片，含舰队组成与造价汇总 |
| 效率梯队排名 | `#rankings` | 3组TOP5排名可视化展示 |
| 侧边栏目录导航 | - | 桌面端固定左侧，移动端折叠；列出所有章节锚点链接 |
| 舰船对比弹窗 | - | 模态弹窗，展示选中舰船的多维度数据对比表 |

---

## 页面布局建议

- **布局模式**: 桌面端侧边栏+主内容区（左侧固定目录导航 + 右侧滚动内容区）；移动端顶部导航栏+全宽内容区（侧边栏折叠为汉堡菜单）
- **视觉重心**: 数据卡片与表格（核心内容是舰船数据查阅与对比，卡片式布局是视觉主体）
- **结果承载区**: 舰船卡片网格（初始态展示全部36艘舰船，筛选/搜索后动态更新）；舰船对比弹窗（初始态为空，用户选择舰船后填充对比表）
- **源材料承载区**: 无（数据均为静态游戏数据，不需要用户上传文件）

---

## 导航配置

### 顶部导航栏（Topbar）

- **导航布局**: Topbar（顶部固定，z-index最高）
- **导航项**:
  | 导航文字 | 锚点 |
  |---------|------|
  | 首页 | `#hero` |
  | 舰船数据 | `#ships` |
  | 舰载机 | `#squadrons` |
  | 战斗规则 | `#rules` |
  | 配队模板 | `#templates` |
  | 效率排名 | `#rankings` |

- **附加元素**: 搜索按钮（点击展开搜索输入框）、主题切换按钮（深色/浅色）

### 侧边栏目录导航（桌面端固定）

- **导航布局**: 左侧固定侧边栏（宽度约240px，可折叠）
- **导航项**（与Topbar一致，增加子章节）:
  | 导航文字 | 锚点 |
  |---------|------|
  | 首页 | `#hero` |
  | 舰船数据总表 | `#ships` |
  | 舰载机中队 | `#squadrons` |
  | 跑团战斗规则 | `#rules` |
  | 标准配队模板 | `#templates` |
  | 效率梯队排名 | `#rankings` |

---

## 数据来源声明

| 数据/操作 | 来源类型 | 实现要求 | mock 兜底 |
|---|---|---|---|
| 36种舰船数据 | demo-mock | `src/data/ships.ts` 导出 `SHIPS_DATA` 常量数组，含所有字段 | ✅ 本身就是 mock（用户提供的完整静态数据） |
| 7种舰载机数据 | demo-mock | `src/data/squadrons.ts` 导出 `SQUADRONS_DATA` 常量数组 | ✅ 本身就是 mock |
| 跑团规则文本 | demo-mock | `src/data/rules.ts` 导出规则说明对象 | ✅ 本身就是 mock |
| 三大配队模板 | demo-mock | `src/data/fleetTemplates.ts` 导出模板数组 | ✅ 本身就是 mock |
| 效率梯队排名 | demo-mock | `src/data/rankings.ts` 导出排名数据 | ✅ 本身就是 mock |
| 舰船筛选/排序/搜索 | demo-mock | 前端内存计算，基于 `SHIPS_DATA` 进行 filter/sort/search | ✅ 纯前端逻辑 |
| 舰船对比选择 | demo-mock | 前端状态管理，存储用户选中的舰船ID列表 | ✅ 纯前端状态 |
| 主题切换（深色/浅色） | local-persist | `localStorage` key=`__wiki_theme`，值为 `'dark'` 或 `'light'`，默认深色 | 无 |

> **说明**: 本Wiki为纯静态数据展示站点，所有数据均由用户提供并硬编码为前端常量，无文件上传、API调用或插件需求。主题偏好使用localStorage持久化用户选择。

---

## 功能列表

### 区块: 顶部导航栏
- **区块目标**: 提供全局导航入口与工具按钮
- **功能点**:
  - **锚点导航**: 点击导航项平滑滚动到对应章节，当前章节高亮
  - **搜索入口**: 点击搜索图标展开搜索输入框，输入舰种名称实时过滤并跳转到舰船数据区
  - **主题切换**: 点击主题切换按钮，在深色/浅色主题间切换，状态持久化到localStorage
  - **移动端菜单**: 移动端侧边栏折叠为汉堡菜单，点击展开/收起

### 区块: 侧边栏目录导航
- **区块目标**: 桌面端提供常驻目录，快速跳转章节
- **功能点**:
  - **章节高亮**: 根据当前滚动位置自动高亮对应章节（Intersection Observer）
  - **折叠/展开**: 侧边栏可折叠，折叠后显示图标模式
  - **子章节展开**: 舰船数据区可展开子分类（小型/中型/大型/旗舰）

### 区块: 英雄区 (`#hero`)
- **区块目标**: 营造科幻氛围，展示Wiki主题与核心指标概览
- **功能点**:
  - **标题展示**: 大标题"星海舰队桌游数据总册"配合霓虹发光文字效果
  - **副标题**: "36种舰船 + 7种舰载机 + 完整跑团规则"
  - **六大核心指标图标卡片**: 战区指挥容量、全域舰船库存、星际全域震慑度、精锐军团编制、持续远洋后勤、星际战略特种打击——每个指标配科幻图标+名称
  - **星空背景动画**: CSS粒子或Canvas星空背景，缓慢移动

### 区块: 全舰种数据总表 (`#ships`)
- **区块目标**: 展示36种舰船完整数据，支持筛选、排序、搜索、对比
- **功能点**:
  - **卡片式网格布局**: 每种舰船一张卡片，含舰种名称、造价、战力、核心特性摘要；悬停有霓虹光效动画（边框发光、轻微上浮）
  - **筛选工具栏**:
    - 按类型筛选：小型/中型/大型/旗舰（多选按钮组）
    - 按定位筛选：打击/防御/辅助/后勤（多选按钮组）
    - 筛选后卡片网格动态更新，无匹配结果时显示空状态提示
  - **排序功能**: 下拉选择排序方式——造价升序/降序、常规战力升序/降序、常规造价战力比升序/降序、维护成本升序/降序
  - **搜索功能**: 输入框实时搜索舰种名称，模糊匹配，搜索结果高亮
  - **卡片详情展开**: 点击卡片展开完整数据（表格形式，含所有字段：造价、月维护、常规战力、峰值/谷值、常规造价战力比、最高造价战力比、维护战力比、核心效率定位、镇守/调度值、维护等级、核心特性描述）
  - **对比功能**: 卡片上显示对比复选框，选中2-5艘舰船后，底部浮现"对比选中舰船"按钮，点击弹出对比弹窗
  - **对比弹窗**: 模态弹窗，以表格形式展示选中舰船的多维度数据对比（行=舰船，列=数据字段），支持关闭和重新选择

### 区块: 舰载机中队数据 (`#squadrons`)
- **区块目标**: 展示7种舰载机中队的完整数据
- **功能点**:
  - **卡片式布局**: 7张卡片，每张含中队名称、造价、战力、克制关系、维护等级
  - **数据表格**: 斑马纹表格展示所有舰载机数据（名称、造价、月维护、常规战力、峰值、核心定位、克制关系、维护等级），悬停行高亮
  - **克制关系可视化**: 卡片内用箭头/标签展示克制与被克制关系

### 区块: 跑团战斗规则 (`#rules`)
- **区块目标**: 清晰展示4条核心战斗规则
- **功能点**:
  - **规则卡片**: 4张卡片分别展示：指挥上限机制、威慑判定剧情机制、克制倍率、维护需求等级
  - **规则说明**: 每条规则含标题、公式/机制说明、示例场景
  - **维护等级可视化**: 4级维护用进度条/阶梯展示（1级前线补给站→4级巨型旗舰船坞）

### 区块: 三大配队模板 (`#templates`)
- **区块目标**: 展示3个标准配队模板供玩家参考
- **功能点**:
  - **模板卡片**: 3张卡片，每张含模板名称、总造价、舰队组成列表（舰种名称×数量）、战术定位说明
  - **造价可视化**: 用进度条展示各模板总造价相对比例
  - **舰队组成**: 列表形式展示，点击舰种名称可跳转到对应舰船卡片

### 区块: 效率梯队排名 (`#rankings`)
- **区块目标**: 展示3组TOP5效率排名
- **功能点**:
  - **排名卡片**: 3张卡片分别展示：存在舰队威慑效率TOP5、战场打击力效率TOP5、长期运营性价比TOP5
  - **排名列表**: 每条排名含名次徽章、舰种名称、效率值进度条
  - **进度条可视化**: 用霓虹色进度条展示相对效率值，第一名满条，后续按比例递减

---

## 数据共享配置

| 存储键名 | 数据说明 | 使用页面 |
|---------|---------|---------|
| `__wiki_theme` | 主题偏好，类型 `'dark' \| 'light'` | WikiHomePage（顶部导航栏主题切换按钮） |
| `__wiki_selectedShips` | 用户选中对比的舰船ID列表，类型 `string[]` | 舰船数据区（对比功能） |

```ts
// 舰船数据接口
interface IShip {
  id: string;
  name: string;
  type: '小型' | '中型' | '大型' | '旗舰';
  role: '打击' | '防御' | '辅助' | '后勤';
  cost: number; // 造价(A)
  monthlyMaintenance: number; // 月维护(A)
  regularFP: number | string; // 常规战力(FP)，可能为复合值如"20+4支中队80"
  peakFP: number | string; // 峰值(FP)
  valleyFP: number | string; // 谷值(FP)
  regularCostFPRatio: number | string; // 常规造价战力比
  maxCostFPRatio: number | string; // 最高造价战力比
  maintenanceFPRatio: number | string; // 维护战力比
  efficiencyPosition: string; // 核心效率定位
  garrison: number; // 镇守值
  dispatch: number; // 调度值
  maintenanceLevel: 1 | 2 | 3 | 4; // 维护等级
  coreFeatures: string; // 核心特性描述
}

// 舰载机数据接口
interface ISquadron {
  id: string;
  name: string;
  cost: number;
  monthlyMaintenance: number;
  regularFP: number;
  peakFP: number | string;
  role: string;
  counterRelation: string; // 克制关系描述
  maintenanceLevel: 1 | 2 | 3;
}

// 配队模板接口
interface IFleetTemplate {
  id: string;
  name: string;
  totalCost: number;
  composition: { shipName: string; count: number }[];
  tacticDescription: string;
}

// 效率排名接口
interface IRanking {
  category: string;
  top5: { rank: number; shipName: string; efficiencyValue: number }[];
}

-------

<scene_type>prototype-app</scene_type>

# UI 设计指南

## 1. 设计推导依据

- **参考意图**: Mood Reference —— 借鉴群星Stellaris Wiki、星战Wookieepedia的深色科技感、星空背景、霓虹光效和卡片式布局，不照搬具体品牌色或版式
- **核心情绪 / 应用类型**: 科幻军事数据库的精密秩序感，兼具探索欲与战略沉浸——36种舰船构成可检索、可对比、可筛选的战术图鉴
- **独特记忆点**: 霓虹青金双色在深空底色上勾勒舰船卡片的战术数据轮廓，进度条如能量槽般在卡片内脉动，让数据表格拥有星舰仪表盘的临场感

## 2. Art Direction

- **方向名**: 深空战术图鉴
- **Design Style**: Cyberpunk 赛博霓虹 + Swiss Minimalist 瑞士极简 —— 霓虹光效提供科幻沉浸与视觉锚点，瑞士极简网格确保36种舰船数据的可读性与对比效率
- **DNA 参数**: 圆角 subtle（`rounded-md`）/ 阴影 layered（卡片悬浮时霓虹外发光替代传统阴影）/ 间距 standard（`gap-4`/`p-6`）/ 字体方向 等宽数字+无衬线正文 / 装饰手法 霓虹边框渐变、进度条能量槽、星空粒子背景
- **应用类型**: Content —— 数据密集型Wiki图鉴，侧边栏目录导航+主内容区卡片网格+可筛选表格

## 3. Color System

**色彩关系**: 深空黑基底 + 霓虹青（primary）主交互 + 暖金（accent）高亮与稀有度标识 + 深蓝紫卡片承载面
**配色设计理由**: primary 霓虹青用于CTA、激活态、进度条和关键数据高亮，在深色背景上具有最高可读性与科技感；accent 暖金用于悬停态、稀有舰船标记和效率排名TOP标识，形成冷暖双色信息层级；bg 深空黑降低长时间浏览疲劳，card 深蓝紫提供数据卡片的承载深度
**主色推导**: 霓虹青（hsl(187 100% 50%)）取自科幻HUD与星舰仪表盘的经典信号色，在深色底上具有天然的高对比与信息优先级；暖金（hsl(42 100% 60%)）作为辅助高亮，模拟星图导航标记与稀有度提示
**使用比例**: 60% 深空黑+深蓝紫中性底 / 30% 霓虹青边框与进度条 / 10% 暖金高亮与TOP标记

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|---|---|---|---|---|
| bg | `--background` | `bg-background` | hsl(230 30% 6%) | 深空黑页面底，模拟宇宙背景 |
| card | `--card` | `bg-card` | hsl(232 28% 12%) | 深蓝紫卡片面，舰船数据承载层 |
| text | `--foreground` | `text-foreground` | hsl(210 20% 92%) | 浅蓝灰正文，高对比可读 |
| textMuted | `--muted-foreground` | `text-muted-foreground` | hsl(215 15% 55%) | 辅助数据、单位标注、占位符 |
| primary | `--primary` | `bg-primary` / `text-primary` | hsl(187 100% 50%) | 霓虹青，CTA、激活态、进度条、关键指标 |
| primaryForeground | `--primary-foreground` | `text-primary-foreground` | hsl(230 30% 6%) | primary上的深色文字和图标 |
| accent | `--accent` | `bg-accent` | hsl(42 100% 60%) | 暖金，悬停高亮、TOP标记、稀有度标识 |
| accentForeground | `--accent-foreground` | `text-accent-foreground` | hsl(230 30% 6%) | accent上的深色文字 |
| border | `--border` | `border-border` | hsl(230 20% 22%) | 卡片边界、输入框、分隔线，弱于card |

**语义色提示**:
- 成功（高性价比/高效舰船）: bg `hsl(160 60% 16%)` / border `hsl(160 50% 40%)` / text `hsl(160 70% 65%)`，饱和度与primary青色对齐
- 警告（维护成本高/低效舰船）: bg `hsl(35 60% 16%)` / border `hsl(35 50% 40%)` / text `hsl(35 70% 60%)`，色温与accent暖金对齐
- 错误（战力比极低/被克制）: bg `hsl(0 50% 16%)` / border `hsl(0 45% 38%)` / text `hsl(0 60% 60%)`，饱和度控制在primary±15%范围内
- 舰船类型标记色: 打击向用primary青、防御向用accent金、辅助向用textMuted灰、后勤向用低饱和蓝紫

## 4. 字体与节奏

- **font-display**: Orbitron —— 大标题与章节标题的科幻感，几何无衬线强化仪表盘气质
- **font-body**: Noto Sans SC —— 中文舰船数据正文清晰可读，数字等宽确保表格对齐
- **字号**: H1 text-5xl（Hero大标题）；H2 text-2xl（章节标题）；body text-base（舰船数据）；muted text-sm（单位标注、辅助说明）
- **圆角**: subtle（`rounded-md`）—— 卡片与按钮保持轻微圆角，避免尖锐直角破坏深空界面的流畅感，也不过度软化军事数据的精密气质

## 5. 全局布局契约

- **Reference Layout Use**: 按需求结构推导——侧边栏目录+主内容区双栏布局，Hero全宽首屏
- **Page / Section Order**: Hero → 全舰种数据总表（可筛选卡片网格）→ 舰载机中队数据 → 跑团规则 → 配队模板 → 效率梯队排名
- **Standard Content Zone**: `max-w-7xl` + `mx-auto`，容纳36舰船卡片网格（桌面4列→平板3列→移动1列）
- **Shell / Frame Alignment**: 侧边栏目录固定左侧（桌面`w-64`，移动端抽屉），主内容区独立滚动，与侧边栏同高
- **Padding & Rhythm**: `px-4 md:px-6 lg:px-8 py-12 md:py-16`，卡片间距`gap-4`，章节间距`py-16`
- **Full-bleed Zones**: Hero区星空背景`w-full`全宽，内部标题与六大指标仍受Standard Content Zone约束；数据表格区可`w-full`溢出容器
- **Local Narrowing**: 跑团规则、配队模板、效率排名等纯文本/列表区在统一容器内收窄至`max-w-4xl`
- **Overflow Strategy**: 全舰种数据总表（12列）使用`overflow-x-auto`横向滚动，不撑破全局max-w；移动端卡片视图替代表格
- **Flexibility Boundary**: 允许移动端padding、卡片内边距和列数调整；全局max-w、侧边栏宽度、霓虹色板和圆角系统保持一致

## 6. 视觉与动效

- **装饰**: 星空粒子背景（CSS生成的缓慢移动光点）、霓虹边框渐变（卡片hover时青→金线性渐变外发光）、进度条能量槽（战力比/性价比用primary青填充，低效区用accent金渐变）
- **阴影/边界**: 中——卡片默认`shadow-md`深色投影，hover时替换为`box-shadow: 0 0 20px hsl(187 100% 50% / 0.3)`霓虹外发光
- **动效**: 精致——卡片hover时0.2s ease-out边框发光过渡+微上浮`translateY(-2px)`；进度条加载时0.6s ease-out从左至右填充；侧边栏目录项hover时primary青左侧边线滑入；页面切换保持fade-in 0.3s

## 7. 组件原则

- 舰船卡片: Default深蓝紫底+细霓虹青边框 / Hover边框变为青金渐变+外发光+微上浮 / Active按下时外发光减弱 / Focus-visible保留青边框+外发光环
- 数据表格: 斑马纹用`bg-card`与`bg-background`交替；行hover时`bg-primary/10`浅青底；表头固定`sticky top-0`
- 进度条: 战力比/性价比用primary青填充，0-0.05红色警告段、0.05-0.1黄色过渡段、0.1+青色高效段；维护战力比反向色阶
- 筛选/排序按钮: Default为`border-border`细边框+textMuted文字 / Active为primary青边框+primary青文字 / Hover为accent金边框过渡
- 侧边栏目录: 当前章节primary青左侧边线+primary青文字；hover时accent金文字过渡
- 加载与空状态: 骨架屏用accent金微光扫过深蓝紫卡片；空搜索结果用星图定位失败隐喻（"未探测到匹配舰船"）

## 8. Image Direction

- **Image Role**: Hero区全宽星空背景图，作为页面首屏的宇宙深空氛围基底
- **Image Art Direction**: 深空星云摄影质感，以深蓝紫为主色调，散布暖金色星团和青色星云气体。构图采用广角深空视角，左上至右下有微弱的星云对角线流动感，画面底部留暗区供标题文字叠加。光线以星团点光源为主，无强烈直射光，整体呈现静谧而深邃的宇宙尺度感。材质上追求天文摄影的颗粒噪点质感，非光滑CG渲染
- **Image Prompt Keywords**: deep space nebula, dark blue purple cosmos, cyan gas cloud, warm gold star cluster, wide angle astrophotography, subtle film grain, dark void bottom area, no spaceships no planets, pure cosmic background, 8K resolution
- **Image Avoidance**: 避免出现明显行星、飞船、空间站等具象科幻元素（这些属于内容区）；避免过度饱和的紫色星云；避免CG光滑渲染感；避免亮部过曝影响前景文字可读性；避免对称构图

## 9. Anti-patterns

- **Neon overload**: 每张卡片边框都常亮霓虹青光，导致视觉疲劳且失去信息层级——默认细边框静默，仅hover和激活态触发霓虹
- **Default dark mode drift**: 回退到通用深灰卡片+白字，丢失深蓝紫基底和青金双色系统——所有承载面必须保持`hsl(232 28% 12%)`深蓝紫色调
- **Progress bar rainbow**: 进度条使用与primary无关的彩虹色阶——战力比进度条只用primary青到accent金的单色相渐变，语义色仅用于警告阈值
- **Table overload on mobile**: 12列数据表在移动端强制横向滚动——移动端自动切换为卡片视图，每艘舰船一张纵向信息卡
- **Sidebar blindness**: 侧边栏目录项hover无反馈，当前章节无标记——必须用primary青左边线+文字色变化同时表达位置与可交互
- **Starfield performance**: 星空粒子背景使用大量DOM元素或未优化的canvas——使用CSS `background-image` + `radial-gradient` 生成静态星空，仅Hero区叠加少量CSS动画光点