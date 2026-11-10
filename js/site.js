/* ─── site.js: tema chiaro/scuro e menu mobile ──────────────────── */

function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(theme);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('theme', theme); } catch (e) {}
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
}

function toggleNav() {
  const links = document.querySelector('.nav-links');
  const btn   = document.getElementById('nav-hamburger');
  const open  = links.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      document.querySelector('.nav-links').classList.remove('open');
      const btn = document.getElementById('nav-hamburger');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  });
});
