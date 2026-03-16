"""
update-posts.py

Scansiona posts/it/ e posts/en/, legge data e titolo dal frontmatter
di ogni .md, riscrive index.json ordinando per data (più recente prima)
e genera la cartella HTML per ogni post (es. it/posts/slug/index.html).

Uso:
    python scripts/update-posts.py
"""

import os, re, json
from pathlib import Path

ROOT = Path(__file__).parent.parent


def parse_frontmatter(filepath):
    with open(filepath, encoding='utf-8') as f:
        text = f.read()
    m = re.match(r'^---\r?\n([\s\S]*?)\r?\n---', text)
    if not m:
        return {'date': '1970-01-01', 'title': ''}
    meta = {}
    for line in m.group(1).splitlines():
        i = line.find(':')
        if i > -1:
            key = line[:i].strip()
            val = line[i+1:].strip().strip('"\'')
            meta[key] = val
    return {'date': meta.get('date', '1970-01-01'), 'title': meta.get('title', '')}


def nav_links(lang):
    if lang == 'it':
        return """
        <li><a href="/it/#formazione">Formazione</a></li>
        <li><a href="/it/posts/">Post</a></li>
        <li><a href="/it/#contact">Contatti</a></li>"""
    return """
        <li><a href="/en/#education">Education</a></li>
        <li><a href="/en/posts/">Posts</a></li>
        <li><a href="/en/#contact">Contact</a></li>"""


def lang_switch(lang):
    if lang == 'it':
        return """
      <div class="lang-switch">
        <span class="active">IT</span>
        <span class="sep">·</span>
        <a href="/en/">EN</a>
      </div>"""
    return """
      <div class="lang-switch">
        <a href="/it/">IT</a>
        <span class="sep">·</span>
        <span class="active">EN</span>
      </div>"""


def generate_post_html(lang, slug, title):
    page_title = f'{title} — Diletta Falcone' if title else 'Diletta Falcone'
    toggle_label = 'Cambia tema' if lang == 'it' else 'Toggle theme'
    loading = 'Caricamento…' if lang == 'it' else 'Loading…'
    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{page_title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <script>(function(){{var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}})();</script>
</head>
<body>

  <nav>
    <div class="nav-inner">
      <a href="/{lang}/" class="nav-logo">Diletta Falcone</a>
      <ul class="nav-links">{nav_links(lang)}
      </ul>{lang_switch(lang)}
      <button class="theme-toggle" id="theme-toggle" onclick="toggleTheme()" aria-label="{toggle_label}"></button>
    </div>
  </nav>

  <main>
    <article>
      <div id="post-content"><p class="posts-empty">{loading}</p></div>
    </article>
  </main>

  <footer>
    <p>© 2026 Diletta Falcone</p>
  </footer>

  <script src="/js/site.js"></script>
  <script>initPostPage('{lang}', '{slug}');</script>

</body>
</html>
"""


def update_lang(lang):
    posts_dir = ROOT / 'posts' / lang
    html_dir  = ROOT / lang / 'posts'

    if not posts_dir.is_dir():
        print(f'WARN Cartella non trovata: {posts_dir}')
        return

    posts = []
    for filename in os.listdir(posts_dir):
        if filename.endswith('.md'):
            slug = filename[:-3]
            info = parse_frontmatter(posts_dir / filename)
            posts.append((info['date'], slug, info['title']))

    posts.sort(reverse=True)

    # Aggiorna index.json
    slugs = [slug for _, slug, _ in posts]
    with open(posts_dir / 'index.json', 'w', encoding='utf-8') as f:
        json.dump(slugs, f, indent=2, ensure_ascii=False)
        f.write('\n')
    print(f'OK posts/{lang}/index.json -> {slugs}')

    # Genera HTML per ogni post
    for _, slug, title in posts:
        post_dir = html_dir / slug
        post_dir.mkdir(parents=True, exist_ok=True)
        html_path = post_dir / 'index.html'
        html_path.write_text(generate_post_html(lang, slug, title), encoding='utf-8')
        print(f'OK {lang}/posts/{slug}/index.html')


print('Aggiorno post...\n')
update_lang('it')
update_lang('en')
print('\nFatto. Puoi ora fare commit e push.')
