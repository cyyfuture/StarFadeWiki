// EXPORTS: ISquadron, MOCK_SQUADRONS
export interface ISquadron {
  id: string
  name: string
  cost: number
  monthlyMaintenance: number
  regularFP: number
  peakFP: number | string
  role: string
  counterRelation: string
  maintenanceLevel: 1 | 2 | 3
  imageUrl: string
}

export const MOCK_SQUADRONS: ISquadron[] = [
  {
    id: '1',
    name: '拦截中队',
    cost: 80,
    monthlyMaintenance: 1.5,
    regularFP: 12,
    peakFP: 18,
    role: '防空制空',
    counterRelation: '克制敌方战机，被反舰攻击中队克制',
    maintenanceLevel: 2,
    imageUrl: '/squadron-hunter.png'
  },
  {
    id: '2',
    name: '制空中队',
    cost: 100,
    monthlyMaintenance: 2,
    regularFP: 10,
    peakFP: 15,
    role: '全域制空',
    counterRelation: '降低敌方战机输出30%，均衡空战单位',
    maintenanceLevel: 2,
    imageUrl: '/squadron-hunter.png'
  },
  {
    id: '3',
    name: '反舰攻击中队',
    cost: 120,
    monthlyMaintenance: 2.5,
    regularFP: 15,
    peakFP: 22.5,
    role: '反小型舰',
    counterRelation: '克制私掠船、轻巡、驱逐舰，被拦截中队克制',
    maintenanceLevel: 2,
    imageUrl: '/squadron-hound.png'
  },
  {
    id: '4',
    name: '重甲轰炸中队',
    cost: 180,
    monthlyMaintenance: 4,
    regularFP: 20,
    peakFP: 30,
    role: '穿甲反大船',
    counterRelation: '高装甲穿透，专门撕裂战列舰、无畏重甲，被拦截中队克制',
    maintenanceLevel: 3,
    imageUrl: '/squadron-hound.png'
  },
  {
    id: '5',
    name: '鱼雷机中队',
    cost: 200,
    monthlyMaintenance: 4.5,
    regularFP: 22,
    peakFP: 33,
    role: '护盾穿透反旗舰',
    counterRelation: '空射鱼雷，高额护盾穿透，克制护盾战列、护盾航母',
    maintenanceLevel: 3,
    imageUrl: '/squadron-hound.png'
  },
  {
    id: '6',
    name: '电子战中队',
    cost: 220,
    monthlyMaintenance: 5,
    regularFP: 5,
    peakFP: '等效全队命中+15%',
    role: '功能辅助致盲',
    counterRelation: '致盲敌舰，敌方锁定失效、射程减半，无高伤害',
    maintenanceLevel: 3,
    imageUrl: '/squadron-hunter.png'
  },
  {
    id: '7',
    name: '特战空降中队',
    cost: 150,
    monthlyMaintenance: 3,
    regularFP: 8,
    peakFP: 40,
    role: '特种作战夺舰',
    counterRelation: '配合两栖登陆舰登舰作战、地表突击，可直接瘫痪敌方舰船指挥系统',
    maintenanceLevel: 2,
    imageUrl: '/squadron-hunter.png'
  }
]