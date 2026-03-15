/**
 * update-posts.js
 *
 * Scansiona posts/it/ e posts/en/, legge la data dal frontmatter
 * di ogni .md e riscrive index.json ordinando per data (più recente prima).
 *
 * Uso:
 *   node scripts/update-posts.js
 */

const fs   = require('fs');
const path = require('path');

function parseFrontmatterDate(filepath) {
  const text  = fs.readFileSync(filepath, 'utf8');
  const match = text.match(/^date:\s*(.+)$/m);
  return match ? match[1].trim() : '1970-01-01';
}

function updateIndex(lang) {
  const dir = path.join(__dirname, '..', 'posts', lang);

  if (!fs.existsSync(dir)) {
    console.warn(`⚠  Cartella non trovata: ${dir}`);
    return;
  }

  const slugs = fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => ({
      slug: f.replace('.md', ''),
      date: parseFrontmatterDate(path.join(dir, f)),
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1))  // più recente prima
    .map(p => p.slug);

  const indexPath = path.join(dir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(slugs, null, 2) + '\n', 'utf8');

  console.log(`✓  posts/${lang}/index.json  →  [${slugs.join(', ')}]`);
}

console.log('Aggiorno gli indici dei post...\n');
updateIndex('it');
updateIndex('en');
console.log('\nFatto. Puoi ora fare commit e push.');
