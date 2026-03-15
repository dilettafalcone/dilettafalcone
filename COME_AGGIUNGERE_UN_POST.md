# Come aggiungere un nuovo post

I post del sito sono salvati in due file JSON nella cartella `data/`:

| File | Lingua |
|------|--------|
| `data/posts-it.json` | Italiano |
| `data/posts-en.json` | Inglese |

---

## Passi per aggiungere un post

### 1. Apri il file della lingua giusta

Per esempio, per un post in italiano apri `data/posts-it.json`.

### 2. Aggiungi un nuovo oggetto all'array

Copia questo modello e incollalo come **primo elemento** dell'array (dopo `[`):

```json
{
  "slug": "il-mio-nuovo-post",
  "title": "Il titolo del mio post",
  "date": "2026-04-01",
  "summary": "Una breve descrizione che appare nella lista dei post (1-2 righe).",
  "content": "Scrivi qui il testo completo del post in **Markdown**.\n\nPuoi usare:\n- **grassetto**\n- *corsivo*\n- [link](https://esempio.com)\n- ## Titoli di sezione\n- Elenchi puntati come questo"
},
```

> **Attenzione:** Dopo l'ultimo elemento dell'array non ci vuole la virgola finale.

### 3. Regole per il campo `slug`

- Usa solo lettere minuscole, numeri e trattini: `il-mio-post`
- Niente spazi o caratteri speciali
- Deve essere **unico** (non duplicare slug esistenti)

### 4. Formato della data

Usa il formato `AAAA-MM-GG` (es. `2026-04-01`).

### 5. Scrittura del contenuto (`content`)

Il contenuto supporta **Markdown**. I caratteri speciali nel JSON vanno gestiti così:

| Vuoi scrivere | Nel JSON scrivi |
|---------------|-----------------|
| Nuova riga | `\n` |
| Riga vuota (nuovo paragrafo) | `\n\n` |
| Virgolette doppie | `\"` |
| Backslash | `\` |

---

## Esempio completo

```json
[
  {
    "slug": "vitamina-d",
    "title": "Vitamina D: perché è così importante?",
    "date": "2026-04-01",
    "summary": "Scopri il ruolo della vitamina D nella salute delle ossa e del sistema immunitario.",
    "content": "## Cos'è la vitamina D?\n\nLa vitamina D è un ormone che il nostro corpo produce grazie all'esposizione al sole.\n\n## A cosa serve?\n\n- Salute delle ossa\n- Sistema immunitario\n- Umore e benessere\n\n## Come integrarla?\n\nIn caso di carenza, il medico può prescrivere una supplementazione adeguata."
  },
  {
    "slug": "ferro-alimentazione",
    "title": "Il ferro nell'alimentazione",
    "date": "2026-03-10",
    "summary": "...",
    "content": "..."
  }
]
```

---

Per aggiungere lo stesso post anche in inglese, ripeti la stessa procedura in `data/posts-en.json`.
