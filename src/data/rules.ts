// EXPORTS: IRule, MOCK_RULES
export interface IRule {
  id: string
  title: string
  mechanism: string
  description: string
  example: string
}

export const MOCK_RULES: IRule[] = [
  {
    id: '1',
    title: '指挥上限机制',
    mechanism: '超限惩罚公式',
    description: '单支舰队有战场指挥容量上限，超限每1点ZC全队输出-2%、生存-2%',
    example: '舰队指挥容量50，当前55，超限5点 → 全队输出-10%、生存-10%'
  },
  {
    id: '2',
    title: '威慑判定剧情机制',
    mechanism: '总SZ = 现役SZ + 库存SZ×0.6',
    description: 'NPC帝国宣战阈值判定，总SZ值决定敌方是否触发宣战行为',
    example: '现役舰船SZ=80，库存舰船SZ=50 → 总SZ=80+30=110，超过阈值100触发威慑'
  },
  {
    id: '3',
    title: '克制倍率',
    mechanism: '克制×1.5 / 被克×0.6',
    description: '克制目标伤害倍率1.5倍，被克制目标伤害倍率0.6倍',
    example: '鱼雷打击舰（克制重甲）攻击战列舰 → 基础伤害×1.5；被小船蜂群攻击 → 受到伤害×1.5'
  },
  {
    id: '4',
    title: '维护需求等级',
    mechanism: '4级维护阶梯',
    description: '1级前线补给站 → 2级标准行星星港 → 3级大型轨道船坞 → 4级巨型旗舰船坞',
    example: '私掠船仅需1级维护（前线补给站），旗舰指挥舰需要4级维护（巨型旗舰船坞）'
  }
]