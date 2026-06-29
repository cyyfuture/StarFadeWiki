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
    tacticDescription: '低成本堆外交威慑，邻国不敢宣战，适合种田发育流',
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
    tacticDescription: '兼顾威慑与实战，应对绝大多数NPC冲突，适合通用跑团剧情',
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
    tacticDescription: '纯实战精锐，短期决战爆发力拉满，容易被多国联盟宣战，仅适合短期决战',
    imageUrl: '/fleet-elite.png'
  }
]