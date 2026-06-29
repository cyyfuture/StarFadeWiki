// EXPORTS: IShip, MOCK_SHIPS
export interface IShip {
  id: string
  name: string
  type: '小型' | '中型' | '大型' | '旗舰'
  role: '打击' | '防御' | '辅助' | '后勤'
  cost: number
  monthlyMaintenance: number
  regularFP: number | string
  peakFP: number | string
  valleyFP: number | string
  regularCostFPRatio: number | string
  maxCostFPRatio: number | string
  maintenanceFPRatio: number | string
  efficiencyPosition: string
  garrison: number
  dispatch: number
  maintenanceLevel: 1 | 2 | 3 | 4
  coreFeatures: string
  imageUrl: string
}

export const MOCK_SHIPS: IShip[] = [
  {
    id: '1',
    name: '私掠船',
    type: '小型',
    role: '打击',
    cost: 100,
    monthlyMaintenance: 2,
    regularFP: 10,
    peakFP: 15,
    valleyFP: 6,
    regularCostFPRatio: 0.1,
    maxCostFPRatio: 0.15,
    maintenanceFPRatio: 5.0,
    efficiencyPosition: '纯存在舰队（威慑TOP2）',
    garrison: 4,
    dispatch: 10,
    maintenanceLevel: 1,
    coreFeatures: '可封存预备役不占战场指挥位，擅长破交游击、边境骚扰',
    imageUrl: ''
  },
  {
    id: '2',
    name: '导弹巡游舰',
    type: '中型',
    role: '打击',
    cost: 180,
    monthlyMaintenance: 3.5,
    regularFP: 25,
    peakFP: 37.5,
    valleyFP: 10,
    regularCostFPRatio: 0.139,
    maxCostFPRatio: 0.208,
    maintenanceFPRatio: 7.14,
    efficiencyPosition: '威慑+远程打击（打击效率TOP1）',
    garrison: 8,
    dispatch: 4,
    maintenanceLevel: 1,
    coreFeatures: '超视距重甲压制，性价比极高，惧怕贴脸突袭近战单位',
    imageUrl: ''
  },
  {
    id: '3',
    name: '补给舰',
    type: '中型',
    role: '后勤',
    cost: 200,
    monthlyMaintenance: 3,
    regularFP: '自身0/全队+40%输出',
    peakFP: '指数上涨',
    valleyFP: 0,
    regularCostFPRatio: '纯辅助无固定比值',
    maxCostFPRatio: '纯辅助无固定比值',
    maintenanceFPRatio: '纯辅助无固定比值',
    efficiencyPosition: '纯后勤战略舰',
    garrison: 2,
    dispatch: 2,
    maintenanceLevel: 1,
    coreFeatures: '舰队续航核心，被击毁后全队战力直接腰斩，远征必备核心单位',
    imageUrl: ''
  }
]