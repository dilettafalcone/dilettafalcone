/* ─── site.js ───────────────────────────────────────────────────── */

let _posts = [];
let _lang  = 'it';
let _activeCategory = '';

/* ─── Theme ─────────────────────────────────────────────────────── */
function initTheme() {
  const saved = localStorage.getItem('theme');
  const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(theme);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
}

/* ─── Home page ─────────────────────────────────────────────────── */
function initSite(lang) {
  _lang = lang;
  initTheme();
}

/* ─── Posts listing page ─────────────────────────────────────────── */
async function initPostsList(lang) {
  _lang = lang;
  initTheme();
  await loadMarked();

  try {
    const slugs = await fetch('/posts/' + lang + '/index.json').then(r => r.json());
    const results = await Promise.allSettled(
      slugs.map(slug => fetchPost(lang, slug))
    );
    _posts = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  } catch (e) {
    _posts = [];
  }

  renderCategoryFilters();
  renderFilteredPosts();
}

/* ─── Individual post page ───────────────────────────────────────── */
async function initPostPage(lang, slug) {
  _lang = lang;
  initTheme();
  await loadMarked();

  try {
    const post = await fetchPost(lang, slug);
    document.title = post.title + ' — Diletta Falcone';
    renderSinglePost(post);
  } catch (e) {
    const c = document.getElementById('post-content');
    if (c) c.innerHTML = '<p class="posts-empty">' +
      (lang === 'it' ? 'Post non trovato.' : 'Post not found.') + '</p>';
  }
}

/* ─── Fetch and parse a .md ──────────────────────────────────────── */
async function fetchPost(lang, slug) {
  const res = await fetch('/posts/' + lang + '/' + slug + '.md');
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const { meta, content } = parseFrontmatter(await res.text());
  return {
    slug,
    title:    meta.title    || slug,
    date:     meta.date     || '',
    summary:  meta.summary  || '',
    category: meta.category || '',
    content
  };
}

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { meta: {}, content: text.trim() };
  const meta = {};
  m[1].split('\n').forEach(line => {
    const i = line.indexOf(':');
    if (i > -1) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  });
  return { meta, content: m[2].trim() };
}

/* ─── marked.js (CDN) ───────────────────────────────────────────── */
function loadMarked() {
  return new Promise(resolve => {
    if (window.marked) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/marked@12/marked.min.js';
    s.onload = s.onerror = resolve;
    document.head.appendChild(s);
  });
}

/* ─── Date formatting ────────────────────────────────────────────── */
function formatDate(dateStr, lang) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString(
    lang === 'it' ? 'it-IT' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
}

/* ─── Category filters ───────────────────────────────────────────── */
function renderCategoryFilters() {
  const container = document.getElementById('category-filters');
  if (!container) return;

  const cats = [...new Set(_posts.map(p => p.category).filter(Boolean))].sort();
  if (!cats.length) { container.style.display = 'none'; return; }

  const allBtn = document.createElement('button');
  allBtn.className = 'cat-btn active';
  allBtn.textContent = _lang === 'it' ? 'Tutti' : 'All';
  allBtn.onclick = () => setCategory('');
  container.appendChild(allBtn);

  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn';
    btn.textContent = cat;
    btn.onclick = () => setCategory(cat);
    container.appendChild(btn);
  });
}

function setCategory(cat) {
  _activeCategory = cat;
  const allLabel = _lang === 'it' ? 'Tutti' : 'All';
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.toggle('active', cat === '' ? btn.textContent === allLabel : btn.textContent === cat);
  });
  renderFilteredPosts();
}

/* ─── Posts list rendering ───────────────────────────────────────── */
function renderFilteredPosts() {
  const container = document.getElementById('posts-list');
  if (!container) return;

  const filtered = _activeCategory
    ? _posts.filter(p => p.category === _activeCategory)
    : _posts;

  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!sorted.length) {
    container.innerHTML = '<p class="posts-empty">' +
      (_lang === 'it' ? 'Nessun post ancora.' : 'No posts yet.') + '</p>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'posts-grid';

  sorted.forEach(post => {
    const item = document.createElement('a');
    item.className = 'post-item';
    item.href = '/' + _lang + '/posts/' + post.slug + '/';
    item.innerHTML =
      '<div>' +
        (post.category ? '<span class="post-cat">' + escHtml(post.category) + '</span>' : '') +
        '<div class="post-title">' + escHtml(post.title) + '</div>' +
        '<p class="post-summary">' + escHtml(post.summary) + '</p>' +
      '</div>' +
      '<span class="post-date">' + formatDate(post.date, _lang) + '</span>';
    grid.appendChild(item);
  });

  container.innerHTML = '';
  container.appendChild(grid);
}

/* ─── Single post rendering ──────────────────────────────────────── */
function renderSinglePost(post) {
  const container = document.getElementById('post-content');
  if (!container) return;

  const bodyHtml = window.marked
    ? marked.parse(post.content)
    : '<p>' + post.content.replace(/\n\n/g, '</p><p>') + '</p>';

  container.innerHTML =
    '<a class="back-btn" href="/' + _lang + '/posts/">' +
      '← ' + (_lang === 'it' ? 'Torna ai post' : 'Back to posts') +
    '</a>' +
    (post.category ? '<span class="post-cat">' + escHtml(post.category) + '</span>' : '') +
    '<h1 class="post-full-title">' + escHtml(post.title) + '</h1>' +
    '<p class="post-full-date">' + formatDate(post.date, _lang) + '</p>' +
    '<div class="post-body">' + bodyHtml + '</div>';
}

/* ─── Utility ────────────────────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
