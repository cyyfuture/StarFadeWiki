/**
 * 规则常量单一来源 —— 数值全部出自规则书《跑团战斗简化规则》。
 * 改规则书数值时只动这个文件。
 */
export const RULE_CONSTANTS = {
  /** 战场指挥上限默认值（ZC 总和上限，玩家可在构建器中调整） */
  COMMAND_CAP_DEFAULT: 50,
  /** 每超 1 点 ZC：全队输出 -2%、生存 -2% */
  OVER_CAP_PENALTY_PER_POINT: 0.02,
  /** 威慑判定: 库存舰船 SZ 按 60% 折算计入总威慑 */
  DETERRENCE_STOCKPILE_FACTOR: 0.6,
  /** 克制伤害倍率 */
  COUNTER_MULT: 1.5,
  /** 被克制伤害倍率 */
  COUNTERED_MULT: 0.6,
} as const;

export const MAINTENANCE_FACILITIES = [
  { level: 1, name: '前线补给站' },
  { level: 2, name: '标准行星星港' },
  { level: 3, name: '大型轨道船坞' },
  { level: 4, name: '巨型旗舰船坞' },
] as const;
