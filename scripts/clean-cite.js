const fs = require('fs');
const path = require('path');

/**
 * 指定ディレクトリ以下のMarkdownファイルを再帰的に列挙する
 * @param {string} dir 検索起点ディレクトリ
 * @returns {string[]} Markdownファイルの絶対パス一覧
 */
function findMarkdownFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      files.push(...findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * NotebookLMが付与するcite系マーカーを除去する
 * 対象: [cite_start] および [cite: X] / [cite: X, Y, ...]
 * @param {string} content Markdownのテキスト
 * @returns {string} マーカーを除去したテキスト
 */
function removeCiteMarkers(content) {
  return content
    .replace(/\[cite_start\]/g, '')
    .replace(/ \[cite: [\d, ]+\]/g, '');
}

const docsDir = path.join(__dirname, '..', 'docs');
const files = findMarkdownFiles(docsDir);

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const cleaned = removeCiteMarkers(original);
  if (cleaned !== original) {
    fs.writeFileSync(file, cleaned);
    console.log(`cleaned: ${path.relative(process.cwd(), file)}`);
  }
}
