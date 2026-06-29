// EXPORTS: IRankingItem, IRankingCategory, MOCK_RANKINGS
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

export const MOCK_RANKINGS: IRankingCategory[] = [
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