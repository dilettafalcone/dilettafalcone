"""
update-posts.py

Scansiona posts/it/ e posts/en/, legge la data dal frontmatter
di ogni .md e riscrive index.json ordinando per data (più recente prima).

Uso:
    python scripts/update-posts.py
"""

import os, re, json

def get_date(filepath):
    with open(filepath, encoding='utf-8') as f:
        lines = f.readlines()
    in_front = False
    for line in lines:
        if line.strip() == '---':
            if not in_front:
                in_front = True
                continue
            else:
                break  # fine frontmatter
        if in_front:
            m = re.match(r'^date:\s*(.+)', line)
            if m:
                return m.group(1).strip()
    return '1970-01-01'

def update_index(lang):
    folder = os.path.join('posts', lang)
    if not os.path.isdir(folder):
        print(f'WARN Cartella non trovata: {folder}')
        return

    posts = []
    for filename in os.listdir(folder):
        if filename.endswith('.md'):
            slug = filename[:-3]
            date = get_date(os.path.join(folder, filename))
            posts.append((date, slug))

    posts.sort(reverse=True)          # più recente prima
    slugs = [slug for _, slug in posts]

    index_path = os.path.join(folder, 'index.json')
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(slugs, f, indent=2, ensure_ascii=False)
        f.write('\n')

    print(f'OK posts/{lang}/index.json -> {slugs}')

print('Aggiorno gli indici dei post...')
update_index('it')
update_index('en')
print('\nFatto. Puoi ora fare commit e push.')
