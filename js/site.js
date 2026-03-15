/* ─── site.js ───────────────────────────────────────────────────── */

let _posts = [];
let _lang  = 'it';

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

async function initSite(lang) {
  _lang = lang;
  initTheme();
  await loadMarked();

  try {
    const base  = document.querySelector('base')?.href || '../';
    const slugs = await fetch(base + 'posts/' + lang + '/index.json').then(r => r.json());

    // Carica tutti i .md in parallelo
    const results = await Promise.allSettled(
      slugs.map(slug => fetchPost(base, lang, slug))
    );
    _posts = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  } catch (e) {
    _posts = [];
  }

  renderPostsList();

  // Hash routing
  if (window.location.hash.startsWith('#post-')) {
    const post = _posts.find(p => p.slug === window.location.hash.slice(6));
    if (post) showPost(post);
  }

  window.addEventListener('hashchange', () => {
    if (window.location.hash.startsWith('#post-')) {
      const post = _posts.find(p => p.slug === window.location.hash.slice(6));
      if (post) showPost(post);
    } else {
      hidePost();
    }
  });
}

/* ─── Carica e analizza un .md ──────────────────────────────────── */
async function fetchPost(base, lang, slug) {
  const res = await fetch(base + 'posts/' + lang + '/' + slug + '.md');
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const { meta, content } = parseFrontmatter(await res.text());
  return { slug, title: meta.title || slug, date: meta.date || '', summary: meta.summary || '', content };
}

/* Analizza il blocco --- ... --- in cima al file */
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { meta: {}, content: text.trim() };
  const meta = {};
  m[1].split('\n').forEach(line => {
    const i = line.indexOf(':');
    if (i > -1) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
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

/* ─── Formato data ──────────────────────────────────────────────── */
function formatDate(dateStr, lang) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString(
    lang === 'it' ? 'it-IT' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
}

/* ─── Lista post ────────────────────────────────────────────────── */
function renderPostsList() {
  const container = document.getElementById('posts-list');
  if (!container) return;

  if (!_posts.length) {
    container.innerHTML = '<p class="posts-empty">' +
      (_lang === 'it' ? 'Nessun post ancora.' : 'No posts yet.') + '</p>';
    return;
  }

  const sorted = [..._posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const grid   = document.createElement('div');
  grid.className = 'posts-grid';
  grid.id = 'posts-grid';

  sorted.forEach(post => {
    const item = document.createElement('div');
    item.className = 'post-item';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.innerHTML =
      '<div>' +
        '<div class="post-title">' + escHtml(post.title) + '</div>' +
        '<p class="post-summary">' + escHtml(post.summary) + '</p>' +
      '</div>' +
      '<span class="post-date">' + formatDate(post.date, _lang) + '</span>';
    item.addEventListener('click', () => { window.location.hash = 'post-' + post.slug; });
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') window.location.hash = 'post-' + post.slug;
    });
    grid.appendChild(item);
  });

  container.innerHTML = '';
  container.appendChild(grid);
}

/* ─── Mostra post ───────────────────────────────────────────────── */
function showPost(post) {
  const grid   = document.getElementById('posts-grid');
  const detail = document.getElementById('post-detail');
  if (!detail) return;

  if (grid) grid.classList.add('hidden');
  detail.classList.add('visible');

  const bodyHtml = window.marked
    ? marked.parse(post.content)
    : '<p>' + post.content.replace(/\n\n/g, '</p><p>') + '</p>';

  detail.innerHTML =
    '<button class="back-btn" onclick="goBackToPosts()">← ' +
      (_lang === 'it' ? 'Torna ai post' : 'Back to posts') +
    '</button>' +
    '<h1 class="post-full-title">' + escHtml(post.title) + '</h1>' +
    '<p class="post-full-date">' + formatDate(post.date, _lang) + '</p>' +
    '<div class="post-body">' + bodyHtml + '</div>';

  document.getElementById('posts').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─── Torna alla lista ──────────────────────────────────────────── */
function goBackToPosts() {
  history.pushState('', document.title, window.location.pathname + '#posts');
  hidePost();
}

function hidePost() {
  const grid   = document.getElementById('posts-grid');
  const detail = document.getElementById('post-detail');
  if (grid)   grid.classList.remove('hidden');
  if (detail) { detail.classList.remove('visible'); detail.innerHTML = ''; }
}

/* ─── Utility ───────────────────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
