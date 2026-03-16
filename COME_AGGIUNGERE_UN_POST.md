# Come aggiungere un nuovo post

I post sono file Markdown nella cartella `posts/`:

| Cartella | Lingua |
|----------|--------|
| `posts/it/` | Italiano |
| `posts/en/` | Inglese |

---

## Passi

### 1. Crea il file `.md`

Crea un nuovo file in `posts/it/` (e/o `posts/en/` per la versione inglese).

Il nome del file diventa l'URL del post. Usa solo lettere minuscole e trattini:
`posts/it/vitamina-d.md`

### 2. Aggiungi l'header al file

Ogni file inizia con un piccolo blocco tra `---`:

```markdown
---
title: Il titolo del post
date: 2026-04-01
category: medicina
summary: Breve descrizione che appare nella lista (1-2 righe).
---

Qui inizia il testo del post, scritto liberamente in Markdown.

## Titolo di sezione

Puoi usare **grassetto**, *corsivo*, [link](https://esempio.com),
elenchi puntati, citazioni — tutto il Markdown standard.
```

Il campo `category` è **opzionale** ma consigliato: permette di filtrare i post per argomento nella pagina `/posts/`. Usa un nome breve e coerente, tutto in minuscolo, es.:

- `medicina`
- `informatica`
- `cinema`
- `fotografia`

### 3. Genera le pagine HTML e aggiorna l'indice

Esegui lo script di aggiornamento dalla cartella del progetto:

```bash
node scripts/update-posts.js
```

oppure, se hai Python:

```bash
python scripts/update-posts.py
```

Lo script fa tutto in automatico:
- aggiorna `posts/it/index.json` (e `posts/en/index.json`)
- crea la cartella `it/posts/nome-post/` con il file `index.html`

### 4. Pubblica

Salva i file, fai commit e push su GitHub.

---

## Esempio completo

**`posts/it/vitamina-d.md`**
```markdown
---
title: Vitamina D: perché è così importante?
date: 2026-04-01
category: medicina
summary: Scopri il ruolo della vitamina D nella salute delle ossa e del sistema immunitario.
---

La vitamina D è un ormone che il nostro corpo produce grazie all'esposizione al sole.

## A cosa serve?

- Salute delle ossa
- Sistema immunitario
- Umore e benessere

## Come integrarla?

In caso di carenza, il medico può prescrivere una supplementazione adeguata.
```

Dopo aver eseguito lo script, il post sarà accessibile all'indirizzo:

```
https://dilettafalcone.it/it/posts/vitamina-d/
```

---

## Struttura delle URL

| Pagina | URL |
|--------|-----|
| Lista post (IT) | `/it/posts/` |
| Lista post (EN) | `/en/posts/` |
| Singolo post (IT) | `/it/posts/nome-post/` |
| Singolo post (EN) | `/en/posts/nome-post/` |
