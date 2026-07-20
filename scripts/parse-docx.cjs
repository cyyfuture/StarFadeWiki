const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const docxPath = path.resolve(__dirname, '..', '..', '星海舰队桌游·全舰船_舰载机_规则数据总册.docx');

mammoth.extractRawText({ path: docxPath }).then(function(result) {
  console.log(result.value);
  console.log('\n\n--- TOTAL CHARS:', result.value.length, '---');
}).catch(function(err) {
  console.error('Error:', err);
});