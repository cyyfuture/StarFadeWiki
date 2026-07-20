const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const pdfPath = path.resolve(__dirname, '..', 'shared', 'static', 'rulebook.pdf');
const buf = fs.readFileSync(pdfPath);

pdfParse(buf).then(function(data) {
  console.log(data.text.substring(0, 25000));
  console.log('\n\n--- TOTAL CHARS:', data.text.length, '---');
}).catch(function(err) {
  console.error('Error:', err);
});