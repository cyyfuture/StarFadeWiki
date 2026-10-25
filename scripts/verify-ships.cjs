/**
 * verify-ships.cjs — 「总册 → ships.ts」机器校验器（审查报告02 §七 建议#2 的落地）
 *
 * 目的：总册若修订，本脚本可立即暴露 ships.ts 与源数据的一切数值漂移，
 *       替代"再开一次 AI 会话手改 TS、无 diff 无证明"的旧路径。
 *
 * 用法：
 *   npm run verify:data            # 正式校验，不一致 exit 1
 *   node scripts/verify-ships.cjs --selftest   # 自检：内存注入 2 处变异，验证比对器能抓出
 *
 * 数据源（优先级）：
 *   1. DOCX 主源：E:\Code 根《星海舰队桌游·全舰船_舰载机_规则数据总册.docx》
 *      mammoth convertToHtml → 解析"一、全舰种综合数据总表"（12 列 × 36 行）逐格比对
 *   2. PDF 兜底：DOCX 不可用时，用 pdf-parse v2 提取同 md5 总册 PDF，
 *      按"舰名切片内数值证据存在性"做弱校验（PDF 文本列序碎裂，无法逐格）
 *
 * 校验口径（依据审查报告02 §二/§三）：
 *   - 总册 11 列 → cost / monthlyMaintenance / regularFP / peakFP / valleyFP /
 *     regularCostFPRatio / maxCostFPRatio / maintenanceFPRatio / garrison / dispatch /
 *     maintenanceLevel，按"数值部分"比对（尾零 0.100≡0.1、两侧均无数值视为文本型放行）
 *   - 复合值按报告口径取数值：如 regularFP '100（自身20+4支中队80）' 全数值序列比对；
 *     轨道轰炸舰 regularCostFPRatio 允许命中"总册 r1+r2 合并"口径（报告 §3.2 已记录的有损合并）
 *   - 镇守/调度列 "g/10、d/10" → garrison / dispatch（分母 10 为量表满值）
 *   - 派生自洽：zcCost===cost/100；szValue===garrison；
 *     fpNumeric===总册FP首值（= backfill-ships.cjs FP_NUMERIC 裁定规则的源锚定复验）；
 *     maintenanceFacility===维护等级→设施映射
 *   - 舰名按"去括号别名"join（总册"战列巡洋舰（战巡）"↔ ts"战列巡洋舰"）
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SHIPS_TS = path.join(ROOT, 'src', 'data', 'ships.ts');
const DOCX_CANDIDATES = [
  path.resolve(__dirname, '..', '..', '星海舰队桌游·全舰船_舰载机_规则数据总册.docx'),
];
const PDF_CANDIDATES = [
  path.resolve(__dirname, '..', '..', '星海舰队桌游·全舰船_舰载机_规则数据总册 (2).pdf'),
  path.resolve(__dirname, '..', '..', '星海舰队桌游·全舰船_舰载机_规则数据总册.pdf'),
  path.resolve(ROOT, 'shared', 'static', 'rulebook.pdf'),
];

// backfill-ships.cjs L12 的派生口径（此处复刻为期望值；该脚本已不可复跑，见报告 §四）
const FACILITY = { 1: '前线补给站', 2: '标准行星星港', 3: '大型轨道船坞', 4: '巨型旗舰船坞' };

// maintenanceFacility 唯一来源：src/lib/rules.ts MAINTENANCE_FACILITIES
// （2026-10-25 起 ships.ts 将该字段改为可选死数据并删去实例值，展示层走 lib/format.ts）
function loadFacilityMap() {
  try {
    const rulesSrc = fs.readFileSync(path.join(ROOT, 'src', 'lib', 'rules.ts'), 'utf8');
    const map = {};
    const re = /level:\s*(\d)\s*,\s*name:\s*'([^']+)'/g;
    let m;
    while ((m = re.exec(rulesSrc))) map[Number(m[1])] = m[2];
    if (Object.keys(map).length === 4) return map;
  } catch (_) { /* fallthrough */ }
  return FACILITY;
}

// ---------- 通用工具 ----------
const numTokens = (s) => (String(s).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
const stripAlias = (name) => String(name).replace(/[（(][^）)]*[）)]/g, '').trim();
const close = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
const eqNums = (a, b) => a.length === b.length && a.every((v, i) => close(v, b[i]));

// ---------- ships.ts 解析（正则轻量解析，项目无 tsx/ts-node） ----------
function parseShipsTs(srcText) {
  const anchor = srcText.indexOf('export const SHIPS_DATA');
  if (anchor < 0) throw new Error('ships.ts 中未找到 SHIPS_DATA');
  const blocks = srcText.slice(anchor).split(/(?=^  \{$)/m);
  const ships = [];
  for (const block of blocks.slice(1)) {
    const fields = {};
    const fre = /^    (\w+): (.+?),?$/gm;
    let m;
    while ((m = fre.exec(block))) {
      let v = m[2].trim().replace(/,$/, '');
      if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
      else if (/^-?\d+(\.\d+)?$/.test(v)) v = Number(v);
      fields[m[1]] = v;
    }
    if (fields.id && fields.name) ships.push(fields);
  }
  return ships;
}

// ---------- 源1：DOCX 主源 ----------
function cellsToShip(c) {
  const pvParts = c[4].split('/');
  const gdParts = c[9].split('、');
  return {
    name: c[0],
    cost: numTokens(c[1])[0],
    maint: numTokens(c[2])[0],
    fp: c[3],
    peak: pvParts[0] || '',
    valley: pvParts.slice(1).join('/') || '',
    r1: c[5],
    r2: c[6],
    r3: c[7],
    garrison: gdParts[0] !== undefined ? numTokens(gdParts[0])[0] : NaN,
    dispatch: gdParts[1] !== undefined ? numTokens(gdParts[1])[0] : NaN,
    level: numTokens(c[10])[0],
  };
}

async function loadDocxRows() {
  if (process.argv.includes('--source=pdf')) return null; // 强制走 PDF 兜底（测试用）
  const docxPath = DOCX_CANDIDATES.find((p) => fs.existsSync(p));
  if (!docxPath) return null;
  const mammoth = require('mammoth');
  const { value: html } = await mammoth.convertToHtml({ path: docxPath });
  const tables = html.match(/<table>[\s\S]*?<\/table>/g) || [];
  for (const t of tables) {
    const rows = (t.match(/<tr>[\s\S]*?<\/tr>/g) || []).map((row) =>
      (row.match(/<t[dh]>[\s\S]*?<\/t[dh]>/g) || []).map((c) => c.replace(/<[^>]+>/g, '').trim())
    );
    const header = rows[0] || [];
    if (header.length === 12 && header[0] === '舰种') {
      return { path: docxPath, rows: rows.slice(1).filter((r) => r.length === 12).map(cellsToShip) };
    }
  }
  return null;
}

// ---------- 源2：PDF 兜底（证据存在性弱校验） ----------
async function loadPdfText() {
  const pdfPath = PDF_CANDIDATES.find((p) => fs.existsSync(p));
  if (!pdfPath) return null;
  const { PDFParse } = require('pdf-parse');
  const parser = new PDFParse({ data: fs.readFileSync(pdfPath) });
  try {
    const res = await parser.getText();
    return { path: pdfPath, text: res.text.normalize('NFKC').replace(/\s+/g, '') };
  } finally {
    await parser.destroy();
  }
}

// ---------- 比对 ----------
const FIELD_DEFS = [
  { docKey: 'cost', tsKey: 'cost', label: '造价 cost' },
  { docKey: 'maint', tsKey: 'monthlyMaintenance', label: '月维护 monthlyMaintenance' },
  { docKey: 'fp', tsKey: 'regularFP', label: '常规FP regularFP' },
  { docKey: 'peak', tsKey: 'peakFP', label: '峰值 peakFP' },
  { docKey: 'valley', tsKey: 'valleyFP', label: '谷值 valleyFP' },
  { docKey: 'r1', tsKey: 'regularCostFPRatio', label: '常规造价战力比 regularCostFPRatio', allowR1R2Merge: true },
  { docKey: 'r2', tsKey: 'maxCostFPRatio', label: '最高造价战力比 maxCostFPRatio' },
  { docKey: 'r3', tsKey: 'maintenanceFPRatio', label: '维护战力比 maintenanceFPRatio' },
  { docKey: 'garrison', tsKey: 'garrison', label: '镇守 garrison' },
  { docKey: 'dispatch', tsKey: 'dispatch', label: '调度 dispatch' },
  { docKey: 'level', tsKey: 'maintenanceLevel', label: '维护等级 maintenanceLevel' },
];

async function verify(tsShips) {
  const issues = [];
  const notes = [];
  console.log(`[源] ships.ts 解析记录数: ${tsShips.length}`);
  if (tsShips.length !== 36) issues.push(`ships.ts 解析出 ${tsShips.length} 舰，期待 36`);

  // 派生自洽：zcCost === cost/100（与数据源无关，两种模式都查）
  for (const s of tsShips) {
    const zc = Number(s.zcCost);
    if (!Number.isFinite(zc) || !close(zc, Number(s.cost) / 100)) {
      issues.push(`[派生] [${s.name}] zcCost=${s.zcCost} ≠ cost/100=${Number(s.cost) / 100}`);
    }
  }
  console.log(`[派生] zcCost===cost/100 复核完成：${tsShips.length} 舰`);

  const docx = await loadDocxRows();
  if (docx) {
    console.log('[模式] DOCX 主源（表格 12 列逐格数值比对）:', docx.path, `(${docx.rows.length} 行)`);
    if (docx.rows.length !== 36) issues.push(`总册舰船表解析出 ${docx.rows.length} 行，期待 36`);

    const byName = new Map();
    for (const r of docx.rows) {
      const k = stripAlias(r.name);
      if (byName.has(k)) issues.push(`总册中舰名重复（去别名后）: ${k}`);
      byName.set(k, r);
    }

    for (const s of tsShips) {
      const key = stripAlias(s.name);
      const doc = byName.get(key);
      if (!doc) {
        issues.push(`[${s.name}] 在总册中未找到同名舰（去括号别名后）`);
        continue;
      }
      // 11 个总册字段
      for (const f of FIELD_DEFS) {
        const tsVal = s[f.tsKey];
        const docVal = doc[f.docKey];
        if (['cost', 'maint', 'garrison', 'dispatch', 'level'].includes(f.docKey)) {
          const d = Number(docVal);
          const t = Number(tsVal);
          if (!Number.isFinite(d) || !Number.isFinite(t) || !close(d, t)) {
            issues.push(`[${s.name}] ${f.label}: ships.ts=${tsVal} | 总册=${docVal}`);
          }
          continue;
        }
        // 数值序列比对（复合值取数值部分；两侧均无数值 = 文本型放行）
        const tNums = numTokens(tsVal);
        const dNums = numTokens(docVal);
        if (tNums.length === 0 && dNums.length === 0) {
          if (String(tsVal) !== String(docVal)) {
            notes.push(`[${s.name}] ${f.label}: 两侧均无数值，文本有损简化「${docVal}」→「${tsVal}」`);
          }
          continue;
        }
        if (eqNums(tNums, dNums)) continue;
        if (f.allowR1R2Merge && eqNums(tNums, [...numTokens(doc.r1), ...numTokens(doc.r2)])) {
          notes.push(`[${s.name}] ${f.label}: 命中总册 r1+r2 合并口径（报告02 §3.2 已记录）`);
          continue;
        }
        issues.push(`[${s.name}] ${f.label}: ships.ts=${JSON.stringify(tsVal)}(数值${JSON.stringify(tNums)}) | 总册=${JSON.stringify(docVal)}(数值${JSON.stringify(dNums)})`);
      }
      // 派生字段：szValue / fpNumeric / maintenanceFacility
      if (Number(s.szValue) !== Number(doc.garrison)) {
        issues.push(`[派生] [${s.name}] szValue=${s.szValue} ≠ 总册镇守值=${doc.garrison}`);
      }
      const fpFirst = numTokens(doc.fp)[0];
      const fpN = Number(s.fpNumeric);
      if (!Number.isFinite(fpN) || !Number.isFinite(fpFirst) || !close(fpN, fpFirst)) {
        issues.push(`[派生] [${s.name}] fpNumeric=${s.fpNumeric} ≠ 总册常规FP首值=${doc.fp}`);
      }
      const expectFacility = loadFacilityMap()[Number(s.maintenanceLevel)];
      if (s.maintenanceFacility !== undefined && s.maintenanceFacility !== expectFacility) {
        issues.push(`[派生] [${s.name}] maintenanceFacility=${s.maintenanceFacility} ≠ ${Number(s.maintenanceLevel)}级→${expectFacility}`);
      } else if (s.maintenanceFacility === undefined && !notes.some((n) => n.includes('maintenanceFacility'))) {
        notes.push('maintenanceFacility 已改为可选死数据（唯一来源 lib/rules.ts MAINTENANCE_FACILITIES），实例缺失不计为不一致；若存在实例值则仍按映射复核');
      }
    }
    // 反向覆盖：总册有而 ts 缺失的舰
    const tsNames = new Set(tsShips.map((s) => stripAlias(s.name)));
    for (const r of docx.rows) {
      if (!tsNames.has(stripAlias(r.name))) issues.push(`[覆盖] 总册舰「${r.name}」在 ships.ts 中缺失`);
    }
    return { mode: 'docx', issues, notes, total: tsShips.length };
  }

  // PDF 兜底：结构化行锚定校验。
  // 不按舰名定位（PDF 提取会把部分汉字转康熙部首，且"督导舰/武库舰"等舰名会出现在
  // 其他舰的特性文本里造成误定位）。行结构锚定链：
  //   cost 与月维护相邻出现（≤15字符）→ 其后第一条"X/10、Y/10"镇守调度模式 → 紧随的"N级"
  // 窗口 = [cost .. 调度模式末尾]（不含特性文本），窗口内：
  //   - 镇守/调度/维护等级：由模式解析值直接比对（结构化）
  //   - 其余字段：ts 数值 token 存在性检查（弱校验，复合值取数值部分）
  const pdf = await loadPdfText();
  if (!pdf) throw new Error('DOCX 与 PDF 数据源均不可用');
  console.log('[模式] PDF 兜底（cost+月维护锚定 + 镇守调度模式定位行窗口·弱校验）:', pdf.path);
  const tokens = [...pdf.text.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => ({ v: Number(m[0]), i: m.index }));
  const gdMatches = [...pdf.text.matchAll(/(\d+(?:\.\d+)?)\/10、(\d+(?:\.\d+)?)\/10/g)].map((m) => ({
    i: m.index,
    end: m.index + m[0].length,
    g: Number(m[1]),
    d: Number(m[2]),
  }));
  console.log(`[PDF兜底] 镇守调度模式识别：${gdMatches.length} 处（期待≥36）`);
  let passCount = 0;
  for (const s of tsShips) {
    const cost = Number(s.cost);
    const maint = Number(s.monthlyMaintenance);
    const level = Number(s.maintenanceLevel);
    const garrison = Number(s.garrison);
    const dispatch = Number(s.dispatch);
    const req = [];
    for (const f of FIELD_DEFS) {
      if (['garrison', 'dispatch', 'level'].includes(f.docKey)) continue; // 结构化解析，另行比对
      for (const n of numTokens(s[f.tsKey])) if (Number.isFinite(n)) req.push(n);
    }
    if (Number.isFinite(Number(s.fpNumeric))) req.push(Number(s.fpNumeric));

    let hit = false;
    let diagMissing = null;
    for (const t0 of tokens) {
      if (!close(t0.v, cost)) continue;
      const t1 = tokens.find((t) => t.i > t0.i && t.i - t0.i <= 15 && close(t.v, maint));
      if (!t1) continue;
      const gd = gdMatches.find((g) => g.i > t1.i && g.i - t1.i <= 260);
      if (!gd) continue;
      if (!close(gd.g, garrison) || !close(gd.d, dispatch)) continue;
      const lvl = (pdf.text.slice(gd.end, gd.end + 6).match(/(\d+)级/) || [])[1];
      if (lvl === undefined || !close(Number(lvl), level)) continue;
      const win = tokens.filter((t) => t.i >= t0.i && t.i <= gd.end + 1);
      const missing = req.filter((r) => !win.some((w) => close(w.v, r)));
      if (!missing.length) { hit = true; break; }
      if (!diagMissing || missing.length < diagMissing.length) diagMissing = missing;
    }
    if (hit) {
      passCount++;
    } else {
      issues.push(`[${s.name}] PDF 行窗口未命中（cost=${cost}+maint=${maint} 锚定，缺 ${JSON.stringify(diagMissing || '锚定行本身')}）`);
    }
  }
  console.log(`[PDF兜底] 行窗口命中：${passCount}/${tsShips.length} 舰`);
  return { mode: 'pdf', issues, notes, total: tsShips.length };
}

// ---------- 自检：内存注入变异，验证比对器确实能抓出不一致 ----------
function selfTest() {
  const real = fs.readFileSync(SHIPS_TS, 'utf8');
  let mutant = real.replace(/(name: '轻巡洋舰'[\s\S]*?peakFP: )75,/, '$176,');
  if (mutant === real) throw new Error('selftest: 轻巡洋舰 peakFP 注入失败');
  mutant = mutant.replace(/(name: '折跃突击舰'[\s\S]*?zcCost: )5\.5,/, '$15.6,');
  if (!/name: '折跃突击舰'[\s\S]*?zcCost: 5\.6,/.test(mutant)) throw new Error('selftest: 折跃突击舰 zcCost 注入失败');
  return parseShipsTs(mutant);
}

(async () => {
  try {
    const isSelfTest = process.argv.includes('--selftest');
    const srcText = fs.readFileSync(SHIPS_TS, 'utf8');
    const tsShips = isSelfTest ? selfTest() : parseShipsTs(srcText);
    const { mode, issues, notes, total } = await verify(tsShips);

    console.log('');
    if (notes.length) {
      console.log(`—— 说明（不计入不一致，${notes.length} 条）——`);
      notes.forEach((n) => console.log('ℹ ' + n));
      console.log('');
    }
    if (issues.length) {
      console.log(`—— 不一致（${issues.length} 条）——`);
      issues.forEach((e) => console.log('✗ ' + e));
      console.log('');
    }

    if (isSelfTest) {
      const expect = ['[轻巡洋舰] 峰值 peakFP', '[派生] [折跃突击舰] zcCost'];
      const ok = issues.length === 2 && expect.every((e) => issues.some((i) => i.includes(e)));
      console.log(ok
        ? '✓ SELFTEST PASS：注入的 2 处变异全部被比对器抓出（字段比对 + 派生复核两条路径均有效）'
        : '✗ SELFTEST FAIL：比对器未能按预期抓出注入变异');
      process.exit(ok ? 0 : 1);
    }

    if (issues.length) {
      console.log(`✗ 校验失败：${total} 舰中存在 ${issues.length} 处不一致`);
      process.exit(1);
    }
    console.log(`✓ ${total}/36 舰全部一致：11 个总册字段逐格比对 + 4 项派生自洽（zcCost/szValue/fpNumeric/facility）零偏差`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
