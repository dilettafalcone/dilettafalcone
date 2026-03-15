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
summary: Breve descrizione che appare nella lista (1-2 righe).
---

Qui inizia il testo del post, scritto liberamente in Markdown.

## Titolo di sezione

Puoi usare **grassetto**, *corsivo*, [link](https://esempio.com),
elenchi puntati, citazioni — tutto il Markdown standard.
```

### 3. Aggiungi il nome file all'indice

Apri `posts/it/index.json` e aggiungi il nome del file (senza `.md`) in cima all'array:

```json
["vitamina-d", "dormire-bene", "benvenuta", "ferro-alimentazione"]
```

L'ordine nell'indice non conta — i post vengono sempre ordinati per data.

---

## Esempio completo

**`posts/it/vitamina-d.md`**
```markdown
---
title: Vitamina D: perché è così importante?
date: 2026-04-01
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

**`posts/it/index.json`**
```json
["vitamina-d", "dormire-bene", "benvenuta", "ferro-alimentazione"]
```

---

Per pubblicare: salva i file, fai commit e push su GitHub.
