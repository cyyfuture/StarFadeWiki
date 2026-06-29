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
    category: '存在舰队威慑效率',
    description: '衡量舰船在非战时通过存在感震慑敌方的能力',
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
    category: '战场打击力效率',
    description: '衡量舰船在实战中输出伤害的效率表现',
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
    category: '长期运营性价比',
    description: '综合考虑造价、维护与战力的长期投入产出比',
    imageUrl: '/squadron-hunter.png',
    items: [
      { rank: 1, shipName: '导弹巡游舰', efficiencyValue: 100 },
      { rank: 2, shipName: '私掠船', efficiencyValue: 92 },
      { rank: 3, shipName: '进攻舰', efficiencyValue: 92 },
      { rank: 4, shipName: '警戒哨卫舰', efficiencyValue: 75 },
      { rank: 5, shipName: '鱼雷打击舰', efficiencyValue: 68 },
      { rank: 6, shipName: '轻巡洋舰', efficiencyValue: 68 }
    ]
  }
]