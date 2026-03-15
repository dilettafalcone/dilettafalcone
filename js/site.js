/* ─── site.js ───────────────────────────────────────────────────── */
/* Uso: aggiungere <script>initSite('it')</script> o initSite('en') */

let _currentPosts = [];
let _currentLang  = 'it';

async function initSite(lang) {
  _currentLang = lang;

  // Carica marked.js solo quando serve (renderizzare markdown nei post)
  await loadMarked();

  // Carica i post
  try {
    const base = document.querySelector('base')?.href || '../';
    const url  = base + 'data/posts-' + lang + '.json';
    const res  = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    _currentPosts = await res.json();
  } catch (e) {
    _currentPosts = [];
  }

  renderPostsList();

  // Hash routing: se l'URL contiene #post-slug mostra subito quel post
  if (window.location.hash.startsWith('#post-')) {
    const slug = window.location.hash.slice(6);
    const post = _currentPosts.find(p => p.slug === slug);
    if (post) showPost(post);
  }

  window.addEventListener('hashchange', () => {
    if (window.location.hash.startsWith('#post-')) {
      const slug = window.location.hash.slice(6);
      const post = _currentPosts.find(p => p.slug === slug);
      if (post) showPost(post);
    } else if (window.location.hash === '#posts' || window.location.hash === '') {
      hidePost();
    }
  });
}

/* ─── marked.js (CDN) ───────────────────────────────────────────── */
function loadMarked() {
  return new Promise((resolve) => {
    if (window.marked) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/marked@12/marked.min.js';
    s.onload  = resolve;
    s.onerror = resolve; // fallback: mostra testo grezzo
    document.head.appendChild(s);
  });
}

/* ─── Formato data ──────────────────────────────────────────────── */
function formatDate(dateStr, lang) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

/* ─── Lista post ────────────────────────────────────────────────── */
function renderPostsList() {
  const container = document.getElementById('posts-list');
  if (!container) return;

  if (!_currentPosts.length) {
    container.innerHTML = '<p class="posts-empty">' +
      (_currentLang === 'it' ? 'Nessun post ancora.' : 'No posts yet.') + '</p>';
    return;
  }

  // Ordina per data (più recente prima)
  const sorted = [..._currentPosts].sort((a, b) => new Date(b.date) - new Date(a.date));

  const grid = document.createElement('div');
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
      '<span class="post-date">' + formatDate(post.date, _currentLang) + '</span>';

    item.addEventListener('click', () => {
      window.location.hash = 'post-' + post.slug;
    });
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

  const backLabel = _currentLang === 'it' ? 'Torna ai post' : 'Back to posts';
  const bodyHtml  = window.marked
    ? marked.parse(post.content)
    : '<p>' + post.content.replace(/\n\n/g, '</p><p>') + '</p>';

  detail.innerHTML =
    '<button class="back-btn" onclick="goBackToPosts()">← ' + backLabel + '</button>' +
    '<h1 class="post-full-title">' + escHtml(post.title) + '</h1>' +
    '<p class="post-full-date">' + formatDate(post.date, _currentLang) + '</p>' +
    '<div class="post-body">' + bodyHtml + '</div>';

  document.getElementById('posts').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─── Torna alla lista ──────────────────────────────────────────── */
function goBackToPosts() {
  history.pushState('', document.title, window.location.pathname + window.location.search + '#posts');
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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
