// EXPORTS: IFleetTemplate, MOCK_FLEET_TEMPLATES
export interface IFleetTemplate {
  id: string
  name: string
  totalCost: number
  composition: { shipName: string; count: number }[]
  tacticDescription: string
  imageUrl: string
}

export const MOCK_FLEET_TEMPLATES: IFleetTemplate[] = [
  {
    id: '1',
    name: '威慑种田舰队',
    totalCost: 8240,
    composition: [
      { shipName: '私掠船', count: 20 },
      { shipName: '导弹巡游舰', count: 10 },
      { shipName: '警戒哨卫舰', count: 5 },
      { shipName: '工程战斗舰', count: 2 },
      { shipName: '补给舰', count: 2 },
      { shipName: '轻巡洋舰', count: 3 }
    ],
    tacticDescription: '以私掠船为核心威慑力量，低成本维持存在舰队，适合和平发展期',
    imageUrl: '/fleet-deterrence.png'
  },
  {
    id: '2',
    name: '均衡备战舰队',
    totalCost: 16880,
    composition: [
      { shipName: '私掠船', count: 10 },
      { shipName: '轻巡洋舰', count: 5 },
      { shipName: '重巡洋舰', count: 3 },
      { shipName: '防御舰', count: 3 },
      { shipName: '鱼雷打击舰', count: 2 },
      { shipName: '常规航母', count: 1 },
      { shipName: '督导舰', count: 1 },
      { shipName: '补给舰', count: 2 },
      { shipName: '工程战斗舰', count: 2 }
    ],
    tacticDescription: '攻防兼备的通用编队，兼顾输出、护航与续航，适合中烈度冲突',
    imageUrl: '/fleet-balanced.png'
  },
  {
    id: '3',
    name: '决战精锐舰队',
    totalCost: 43680,
    composition: [
      { shipName: '要塞战列舰', count: 1 },
      { shipName: '无畏战列舰', count: 2 },
      { shipName: '护盾航母', count: 1 },
      { shipName: '旗舰指挥舰', count: 1 },
      { shipName: '电子压制舰', count: 1 },
      { shipName: '战列巡洋舰', count: 2 },
      { shipName: '防御舰', count: 4 },
      { shipName: '鱼雷打击舰', count: 3 },
      { shipName: '折跃突击舰', count: 2 },
      { shipName: '补给舰', count: 3 },
      { shipName: '工程战斗舰', count: 3 }
    ],
    tacticDescription: '终局决战配置，全域战力倍增体系完整，适合决定性的舰队会战',
    imageUrl: '/fleet-elite.png'
  }
]