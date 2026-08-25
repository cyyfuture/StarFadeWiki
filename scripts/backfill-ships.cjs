/**
 * P1-T1 一次性补录脚本：为 36 舰添加 zcCost / szValue / fpNumeric / maintenanceFacility
 *
 * 推导依据（规则书《星海舰队桌游·全舰船/舰载机/规则数据总册》2026-08-26 程序化验证）:
 * - zcCost = cost / 100 —— 用 fp/cost 复现了规则书"战场打击力效率TOP5"全部名次顺序，
 *   且自洽"少量战列极易超标"(战列舰要塞4800A→ZC48, 单舰近吃满50上限)
 * - szValue = garrison（镇守值）—— 数据表固有威慑属性；库存×0.6 是编队级效应，留给运行时计算
 * - fpNumeric: 载机复合值取总和(含中队)，辅助光环型取自身值，等效值不并入(不可靠加算)
 */
const fs = require('fs');

const FACILITY = { 1: '前线补给站', 2: '标准行星星港', 3: '大型轨道船坞', 4: '巨型旗舰船坞' };

// fpNumeric 人工裁定表（依据 regularFP 原文；id 与 ships.ts 一致）
// 载机总和: 常规航母100(20+80), 护盾航母150(20+100+30), 重型舰队航母140(20+120)
// 光环型取自身: 补给舰0 医疗0 督导30 要塞战列60 电子压制20 旗舰指挥40
// 等效双态取第一数值: 工程5 防御舰15 布雷20 两栖15 轨道轰炸50; 无人机母舰70(蜂群)
const FP_NUMERIC = {
  6: 0, 7: 5, 12: 15, 14: 0, 16: 20, 20: 15, 22: 20,
  24: 70, 26: 30, 27: 100, 29: 50, 31: 150, 32: 60, 33: 140, 35: 40,
};

const path = 'src/data/ships.ts';
let src = fs.readFileSync(path, 'utf8');

// 逐条记录处理：找到每个 "  {" (2空格缩进) 记录起始，在其 imageUrl 行前插入新字段
const records = src.split(/(?=^  \{$)/m);
let patched = 0;
const out = records.map(block => {
  const idm = block.match(/id: '(\d+)'/);
  if (!idm) return block;
  const id = idm[1];
  const ship = JSON.parse(fs.readFileSync('C:/Users/cyy/AppData/Local/Temp/ships.json', 'utf8')).find(s => s.id === id);
  if (!ship) { console.warn('no ship for id', id); return block; }
  if (block.includes('zcCost')) return block; // 幂等

  const zc = ship.cost / 100;
  const fp = FP_NUMERIC[id] !== undefined ? FP_NUMERIC[id] : Number(ship.regularFP);
  const ins = [
    `    zcCost: ${Number.isInteger(zc) ? zc : zc.toFixed(2).replace(/\.?0+$/, '')},`,
    `    szValue: ${ship.garrison},`,
    `    fpNumeric: ${isNaN(fp) ? 'NaN // TODO 待复核: ' + ship.regularFP : fp},`,
    `    maintenanceFacility: '${FACILITY[ship.maintenanceLevel]}',`
  ].join('\n');
  patched++;
  return block.replace(/\n    imageUrl:/, '\n' + ins + '\n    imageUrl:');
});

fs.writeFileSync(path, out.join(''));
console.log('patched records:', patched);
// 校验
const after = fs.readFileSync(path, 'utf8');
console.log('zcCost occurrences:', (after.match(/zcCost/g) || []).length);
console.log('interface has zcCost:', after.includes('zcCost:'));
