/**
 * update-posts.js
 *
 * Scansiona posts/it/ e posts/en/, legge la data dal frontmatter
 * di ogni .md, riscrive index.json ordinando per data (più recente prima)
 * e genera la cartella HTML per ogni post (es. it/posts/slug/index.html).
 *
 * Uso:
 *   node scripts/update-posts.js
 */

const fs   = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

function parseFrontmatter(filepath) {
  const text  = fs.readFileSync(filepath, 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/m);
  if (!match) return { date: '1970-01-01', title: '' };
  const meta = {};
  match[1].split('\n').forEach(line => {
    const i = line.indexOf(':');
    if (i > -1) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  });
  return { date: meta.date || '1970-01-01', title: meta.title || '' };
}

function navLinks(lang) {
  if (lang === 'it') return `
        <li><a href="/it/#formazione">Formazione</a></li>
        <li><a href="/it/posts/">Post</a></li>
        <li><a href="/it/#contact">Contatti</a></li>`;
  return `
        <li><a href="/en/#education">Education</a></li>
        <li><a href="/en/posts/">Posts</a></li>
        <li><a href="/en/#contact">Contact</a></li>`;
}

function langSwitch(lang) {
  if (lang === 'it') return `
      <div class="lang-switch">
        <span class="active">IT</span>
        <span class="sep">·</span>
        <a href="/en/">EN</a>
      </div>`;
  return `
      <div class="lang-switch">
        <a href="/it/">IT</a>
        <span class="sep">·</span>
        <span class="active">EN</span>
      </div>`;
}

function themeToggleLabel(lang) {
  return lang === 'it' ? 'Cambia tema' : 'Toggle theme';
}

function generatePostHtml(lang, slug, title) {
  const pageTitle = title ? title + ' — Diletta Falcone' : 'Diletta Falcone';
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <script>(function(){var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);})();</script>
</head>
<body>

  <nav>
    <div class="nav-inner">
      <a href="/${lang}/" class="nav-logo">Diletta Falcone</a>
      <ul class="nav-links">${navLinks(lang)}
      </ul>${langSwitch(lang)}
      <button class="theme-toggle" id="theme-toggle" onclick="toggleTheme()" aria-label="${themeToggleLabel(lang)}"></button>
    </div>
  </nav>

  <main>
    <article>
      <div id="post-content"><p class="posts-empty">${lang === 'it' ? 'Caricamento…' : 'Loading…'}</p></div>
    </article>
  </main>

  <footer>
    <p>© 2026 Diletta Falcone</p>
  </footer>

  <script src="/js/site.js"></script>
  <script>initPostPage('${lang}', '${slug}');</script>

</body>
</html>
`;
}

function updateLang(lang) {
  const postsDir = path.join(root, 'posts', lang);
  const htmlDir  = path.join(root, lang, 'posts');

  if (!fs.existsSync(postsDir)) {
    console.warn(`⚠  Cartella non trovata: ${postsDir}`);
    return;
  }

  const posts = fs
    .readdirSync(postsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const slug = f.replace('.md', '');
      const { date, title } = parseFrontmatter(path.join(postsDir, f));
      return { slug, date, title };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  // Aggiorna index.json
  const slugs = posts.map(p => p.slug);
  fs.writeFileSync(
    path.join(postsDir, 'index.json'),
    JSON.stringify(slugs, null, 2) + '\n',
    'utf8'
  );
  console.log(`✓  posts/${lang}/index.json  →  [${slugs.join(', ')}]`);

  // Genera HTML per ogni post
  for (const { slug, title } of posts) {
    const dir = path.join(htmlDir, slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const htmlPath = path.join(dir, 'index.html');
    fs.writeFileSync(htmlPath, generatePostHtml(lang, slug, title), 'utf8');
    console.log(`✓  ${lang}/posts/${slug}/index.html`);
  }
}

console.log('Aggiorno post...\n');
updateLang('it');
updateLang('en');
console.log('\nFatto. Puoi ora fare commit e push.');
