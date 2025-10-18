# Arte Trainer

Allenatore per il riconoscimento di opere d’arte: **quiz**, **raccolta** con percentuali, **memoria locale** per opera, tutto **statico** e **gratuito** (GitHub Pages).

> **Nota**
> Questo progetto è stato realizzato interamente con l’aiuto dell’**Intelligenza Artificiale** ed è stato creato per la mia fidanzata, per aiutarla nell’**allenamento al riconoscimento delle opere** in vista degli esami di **Storia dell’Arte**.

---

## ✨ Funzioni principali

* **Quiz**: mostra un’immagine; solo su richiesta appare la soluzione → **Ho indovinato / Ho sbagliato / Salta**.
* **Raccolta**: tutte le opere con **percentuale di accuratezza** e **bordo colorato** (verde / arancio / rosso).
* **Memoria locale** (per dispositivo & per browser) con `localStorage`:

  * **Azzera** / **Esporta** / **Importa**.
* **Dati separati**: immagini in `images/`, metadati in `data/opere.json`.
* **Tema**: **Graphite** (dark grigio con bottoni primari gialli).

---

## 🗂 Struttura della repo

```
arte-trainer/
├─ index.html      # Home (quiz / raccolta / ricerca / memoria)
├─ quiz.html       # Quiz di riconoscimento
├─ gallery.html    # Raccolta (griglia con percentuali)
├─ advanced.html   # Quiz avanzato (filtri: <50%, mai allenate, limit, ecc.)
├─ styles.css      # Stili (tema Graphite)
├─ app.js          # Logica comune + utilità (memoria, caricamento dati, ecc.)
├─ data/
│  └─ opere.json   # Database delle opere (schema sotto)
├─ images/
│  ├─ ...          # Immagini locali (webp/jpg)
└─ .nojekyll       # (file vuoto) disabilita Jekyll su GitHub Pages
```

---

## 📄 Schema `data/opere.json`

```json
[
  {
    "id": "bacio-gustav-klimt",       // univoco & stabile (slug consigliato)
    "titolo": "Il bacio",
    "artista": "Gustav Klimt",
    "anno": "1907-1908",
    "tecnica": "Olio su tela, foglia d’oro",
    "immagine": "images/bacio.webp"   // percorso relativo nella repo
  }
]
```

### Linee guida immagini

* Metti i file in `images/` (nomi in minuscolo, senza spazi: `botticelli_venere.webp`).
* Ridimensiona lato lungo ≈ **1600 px**; **WebP** preferito; **JPG** compresso (**< 300 KB**).
* Evita **hotlink esterni** (affidabilità/licenze).

---

## 💾 Memoria (localStorage)

* **Key**: `arteTrainerStats.v1`
* **Valore** (oggetto con chiavi = id opera):

```json
{
  "id-opera": { "correct": 3, "wrong": 1, "seen": 4, "last": 1730000000000 }
}
```

* **Percentuale** = `correct / (correct + wrong)` (se tot=0 → "—").
* **Lato UI**: bordi in Raccolta basati sulla % (variabili CSS in `styles.css`):

```css
/* Cambia i colori direttamente in styles.css */
:root {
  --perf-alta:  #12a008;  /* >80%  */
  --perf-media: #df7f19;  /* 60–80% */
  --perf-bassa: #e72424;  /* <60%  */
}
```


## 🔄 Aggiornare contenuti

Aggiungi immagini in `images/` e opere in `data/opere.json`.

**Commit & push:**

```bash
git add .
git commit -m "Aggiunte nuove opere + immagini"
git push
```

Se il CSS sembra “in cache”: ricarica forte (**Ctrl/Cmd + F5**) o usa `styles.css?v=2` (solo per test).

---



## 🩺 Troubleshooting

* **404** su `data/opere.json` o immagini → controlla **percorsi relativi** e **maiuscole/minuscole**.
* **Soluzione visibile subito** nel quiz → assicurati che in `styles.css` ci sia:

  ```css
  .hidden, .solution.hidden, .esito.hidden { display: none !important; }
  ```

  e che in `quiz.html` i blocchi `#solution` e `#esito` partano con `class="... hidden"`.
* **Memoria non resta**:

  * non usare **Navigazione Privata**;
  * assicurati **stessa origine** (`localhost` ≠ `github.io`);
  * niente reset all’avvio;
  * puoi chiedere persistenza:

    ```js
    if (navigator.storage?.persist) navigator.storage.persist();
    ```

---

---

## 📜 Licenze & crediti immagini

Usa immagini in pubblico dominio o con licenze compatibili; se necessario, **cita la fonte** in pagina o qui nel README.
