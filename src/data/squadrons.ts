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
    imageUrl: '/spark/app/app_17956t6ms3q/runtime/api/v1/storage/object/bucket_aadkikkacngew_static/static%2Faadkijxruuucw_ve_miaoda'
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
    imageUrl: '/spark/app/app_17956t6ms3q/runtime/api/v1/storage/object/bucket_aadkikkacngew_static/static%2Faadkijxruuucw_ve_miaoda'
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
    imageUrl: '/spark/app/app_17956t6ms3q/runtime/api/v1/storage/object/bucket_aadkikkacngew_static/static%2Faadkikcgcmkcu_ve_miaoda'
  }
]