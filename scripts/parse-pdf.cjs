/**
 * parse-pdf.cjs — 提取《星海舰队桌游·全舰船_舰载机_规则数据总册》PDF 全文并落盘
 *
 * pdf-parse v2 API 变更（v2.4.5 实测）：
 *   v1: const pdfParse = require('pdf-parse');  pdfParse(buffer) → { text }
 *   v2: const { PDFParse } = require('pdf-parse');   // 命名导出的类，模块本身不再是函数
 *       const parser = new PDFParse({ data: buffer });  // Buffer 自动转 Uint8Array
 *       const result = await parser.getText();       // → TextResult { text, pages[], total }
 *       await parser.destroy();                      // 释放 pdfjs worker 资源
 *
 * 输出：scripts/.parse-out/pdf-full.txt（完整文本，不再截断 25000 字）
 * 用法：node scripts/parse-pdf.cjs [pdf路径]
 */
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

// 总册 PDF 母本在 E:\Code 根（与 shared/static/rulebook.pdf 同 md5 的拷贝关系，见审查报告02 §一）
const CANDIDATES = [
  path.resolve(__dirname, '..', '..', '星海舰队桌游·全舰船_舰载机_规则数据总册 (2).pdf'),
  path.resolve(__dirname, '..', '..', '星海舰队桌游·全舰船_舰载机_规则数据总册.pdf'),
  path.resolve(__dirname, '..', 'shared', 'static', 'rulebook.pdf'),
];
const OUT_PATH = path.resolve(__dirname, '.parse-out', 'pdf-full.txt');

async function main() {
  const pdfPath = process.argv[2] || CANDIDATES.find(p => fs.existsSync(p));
  if (!pdfPath) {
    console.error('Error: 找不到总册 PDF，候选路径：\n  ' + CANDIDATES.join('\n  '));
    process.exit(1);
  }
  console.log('source:', pdfPath);

  const buf = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: buf });
  try {
    const result = await parser.getText();
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, result.text, 'utf8');
    console.log('pages:', result.pages.length, '| chars:', result.text.length);
    console.log('written:', OUT_PATH);
  } finally {
    await parser.destroy();
  }
}

main().catch(err => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
