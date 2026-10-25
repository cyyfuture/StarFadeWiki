// EXPORTS: IRankingItem, IRankingCategory, RANKINGS_DATA

/**
 * 数据溯源说明（2026-10-25 补注，依据《数据层与管线审查报告02》§P1-2）：
 * - efficiencyValue 是【编制值】：2026-06 建站时人工给出的 0-100 相对展示分，
 *   不是由 SHIPS_DATA 舰船数值直接推导，规则书《总册》中也没有这一列。
 * - 实测校准：按 fpNumeric/zcCost 归一，序为 导弹13.89 > 进攻10.94 > 私掠=鱼雷并列10.0
 *   > 轻巡8.57 > 警戒=护航6.67 > 折跃6.36 —— 折跃突击舰实际排第 8，本榜"战场打击力
 *   TOP5"第 5 名属编辑性名次，数值仅为视觉近似（半对半错）。
 * - 威慑榜同理：按 szValue/cost 排序的真实名次为 导弹>私掠>警戒>工程>防御，
 *   与本榜 私掠>导弹>轻巡>警戒>护航 不同，本榜为总册的编辑性判断。
 * - 因此三榜数值仅供 UI 展示，禁止作为任何派生计算/优化的输入；UI 若渲染裸数值，
 *   应附带"编制值"标注（见 src/components/RankingsSection.tsx）。
 */
export interface IRankingItem {
  rank: number
  shipName: string
  efficiencyValue: number
}

export interface IRankingCategory {
  id: string
  category: string
  description: string
  items: IRankingItem[]
  imageUrl: string
}

export const RANKINGS_DATA: IRankingCategory[] = [
  {
    id: '1',
    category: '存在舰队威慑效率TOP5',
    description: '低成本堆外交威慑，纯库存小船即可拉高震慑值',
    imageUrl: '/squadron-hunter.png',
    items: [
      { rank: 1, shipName: '私掠船', efficiencyValue: 100 },
      { rank: 2, shipName: '导弹巡游舰', efficiencyValue: 88 },
      { rank: 3, shipName: '轻巡洋舰', efficiencyValue: 72 },
      { rank: 4, shipName: '警戒哨卫舰', efficiencyValue: 58 },
      { rank: 5, shipName: '护航驱逐舰', efficiencyValue: 45 }
    ]
  },
  {
    id: '2',
    category: '战场打击力效率TOP5',
    description: '单位指挥占用输出最高，衡量舰船实战伤害效率',
    imageUrl: '/squadron-hunter.png',
    items: [
      { rank: 1, shipName: '导弹巡游舰', efficiencyValue: 100 },
      { rank: 2, shipName: '进攻舰', efficiencyValue: 85 },
      { rank: 3, shipName: '鱼雷打击舰', efficiencyValue: 73 },
      { rank: 4, shipName: '轻巡洋舰', efficiencyValue: 60 },
      { rank: 5, shipName: '折跃突击舰', efficiencyValue: 48 }
    ]
  },
  {
    id: '3',
    category: '长期运营性价比TOP5',
    description: '维护战力比最高，综合衡量长期投入产出效率',
    imageUrl: '/squadron-hunter.png',
    items: [
      { rank: 1, shipName: '导弹巡游舰', efficiencyValue: 100 },
      { rank: 2, shipName: '私掠船', efficiencyValue: 92 },
      { rank: 3, shipName: '进攻舰', efficiencyValue: 92 },
      { rank: 4, shipName: '警戒哨卫舰', efficiencyValue: 75 },
      { rank: 5, shipName: '鱼雷打击舰', efficiencyValue: 68 }
    ]
  }
]