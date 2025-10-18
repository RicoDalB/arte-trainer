# Arte Trainer – Documento Architetturale

> **Obiettivo**: sito web statico, gratuito, per allenarsi al riconoscimento di opere d’arte.  
> **Vincoli chiave**: 1 sola utente, nessun login, **memoria persistente** (giusto/sbagliato per opera), **GitHub Pages** come hosting gratuito.

---

## Sommario
- [Obiettivi & vincoli](#obiettivi--vincoli)
- [Architettura generale](#architettura-generale)
- [Modello dati](#modello-dati)
- [Flussi principali](#flussi-principali)
- [Workflow immagini](#workflow-immagini)
- [Struttura della repository](#struttura-della-repository)
- [Deployment con GitHub Pages](#deployment-con-github-pages)
- [Aggiornamenti futuri (push)](#aggiornamenti-futuri-push)
- [Backup / Portabilità della memoria](#backup--portabilità-della-memoria)
- [Performance & qualità](#performance--qualità)
- [Sicurezza & limiti](#sicurezza--limiti)
- [Appendice – Snippet utili](#appendice--snippet-utili)

---

## Obiettivi & vincoli

- **Utente unico**: la tua fidanzata; niente autenticazione.
- **Gratis**: tutto statico (HTML/CSS/JS) su **GitHub Pages**.
- **Memoria persistente**: al riavvio del sito ricorda le percentuali per ogni opera.
- **Semplicità computazionale**: modello “**una riga di DB per immagine**”, con override dei soli campi necessari.
- **Reset totale**: un pulsante azzera tutte le percentuali/dati registrati.
- **Modalità principali**:
  - **Galleria/Studio**: elenco opere con immagine + metadati; badge percentuale e colori (verde/arancione/rosso).
  - **Quiz**: riconoscimento con “Mostra soluzione” → “Ho indovinato / Ho sbagliato / Salta”, + quiz “Debolezze” (<50% corrette).
  - **Statistiche**: percentuale complessiva, viste, numero opere allenate.
  - **Gestione (opzionale)**: aggiunta locale di nuove opere (immagine + metadati) e **Export overlay** per allineare la repo.

---

## Architettura generale

### Stack
- **Frontend puro**: HTML, CSS, JavaScript (vanilla).
- **Dati base**: `data/opere.json` (versionato in Git).
- **Immagini**: cartella `images/` nella repo.
- **DB locale (memoria)**: `localStorage` del browser con una “riga” per ogni `id` di opera.
- **Overlay locale (opz.)**: nuove opere inserite via UI, salvate in `localStorage`, esportabili come file JSON.

### Mappa logica dei moduli
- **UI Router minimale**: commuta tab _Galleria_, _Quiz_, _Statistiche_, _Gestione_.
- **Data Layer**:
  - `OpereRepository` (**read-only**): carica `data/opere.json`.
  - `MemoriaRepository` (**read/write**): legge/salva counters per opera in `localStorage`.
  - `OverlayRepository` (**opz.**): gestisce opere aggiunte dall’utente in `localStorage` + export JSON.
- **Quiz Engine**:
  - Coda opere filtrate/ordinate, sessione con indice corrente.
  - Registrazione esito (giusto/sbagliato/salta) che aggiorna **solo i contatori** dell’opera corrente.
- **Galleria/Studio**:
  - Griglia card con immagine, titolo, artista, anno, tecnica.
  - **Badge %** di correttezza e **bordo colorato**:
    - `> 80%` → **verde**
    - `60–80%` → **arancione**
    - `< 60%` → **rosso**
    - Nessun dato → “—”
- **Gestione (opz.)**:
  - Form “Aggiungi opera” (titolo, artista, anno, tecnica, percorso immagine).
  - Salvataggio in overlay locale + pulsante **Export overlay**.

---

## Modello dati

### `data/opere.json` (fonte principale)
```json
[
  {
    "id": "nascita-venere-botticelli",
    "titolo": "Nascita di Venere",
    "artista": "Sandro Botticelli",
    "anno": "1484–1486",
    "tecnica": "Tempera su tela",
    "immagine": "images/botticelli_venere.jpg"
  }
]
Note:

id univoco e stabile (slug consigliato: titolo-artista), così la memoria “rimane agganciata” all’opera.

immagine è un percorso relativo dentro images/.

“DB” locale (memoria)
Storage: localStorage

Key: arteTrainerStats.v1

Valore (una riga per immagine):

json
Copia codice
{
  "id-opera": { "correct": 3, "wrong": 1, "seen": 4, "last": 1730000000000 }
}
Percentuale = correct / (correct + wrong) (se correct + wrong = 0 → “—”).

Aggiornamento: quando registri un esito, aggiorni solo i contatori dell’opera corrente e salvi l’oggetto completo (override).

Overlay locale (opere aggiunte via UI)
Storage: localStorage

Key: arteTrainerOverlay.v1

Valore: array di opere stesso schema di opere.json.

Merge a runtime: opere = opereJson.concat(opereOverlay)

Export: “Scarica overlay.json” da committare poi nella repo (merge manuale in data/opere.json).

Flussi principali
1) Galleria/Studio
Carica opere (base + overlay).

Applica filtro testuale e ordinamento (random / artista / anno).

Calcola % per ogni opera dai contatori in memoria.

Mostra badge % o “—” e applica bordi colorati in base alla soglia.

2) Quiz
Scegli sorgente: Tutte oppure Debolezze (opere con % < 50 o mai allenate).

Crea coda random, indice a 0.

Visualizza solo immagine → pulsante Mostra soluzione.

Dopo la soluzione: Ho indovinato / Ho sbagliato / Salta.

Registra esito (update counters) → avanza.

Fine coda → messaggio “Quiz concluso”.

3) Reset memoria
Pulsante Azzera memoria → localStorage.removeItem('arteTrainerStats.v1') → ricalcola UI.

4) Gestione (opz.) – Aggiungi opera
Compila form (titolo, artista, anno, tecnica, percorso immagine).

Genera id (slug) se assente.

Salva in overlay locale.

Export overlay quando vuoi consolidare nella repo.

Workflow immagini
Ridimensiona lato lungo ~1600px.

Comprimi: preferisci .webp, altrimenti .jpg ben compresso (~<300 KB).

Nomi file: minuscole, senza spazi (botticelli_venere.webp).

Metti le immagini in images/ e usa percorsi relativi in JSON.

Evita hotlink da siti esterni: può rompersi e violare diritti. Preferisci immagini in pubblico dominio o con licenze compatibili (e, se serve, cita la fonte).

Struttura della repository
bash
Copia codice
arte-trainer/
├─ index.html
├─ styles.css
├─ app.js
├─ data/
│  └─ opere.json
├─ images/
│  ├─ botticelli_venere.jpg
│  └─ ...
├─ assets/                # (opz.) icone, manifest.json per PWA
├─ README.md
└─ .nojekyll              # (opz.) evita trattamenti Jekyll su GitHub Pages
Deployment con GitHub Pages
1) Crea la repo
GitHub → New repository → nome: arte-trainer (Public).

(Facoltativo) crea README.md iniziale.

2) Primo push (da terminale)
bash
Copia codice
# nella cartella del progetto
git init
git add .
git commit -m "Prima versione: galleria + quiz + memoria locale"
git branch -M main
git remote add origin https://github.com/<tuo-utente>/arte-trainer.git
git push -u origin main
3) Attiva Pages
Repo → Settings → Pages

Source: Deploy from a branch

Branch: main – cartella / (root)

Save

URL generato: https://<tuo-utente>.github.io/arte-trainer/

Ogni volta che fai git push su main, il sito si aggiorna.

Aggiornamenti futuri (push)
Aggiungi/modifica file:

nuove immagini in images/

nuove righe in data/opere.json (o usa overlay + merge successivo)

miglioramenti a index.html, styles.css, app.js

Commit e push:

bash
Copia codice
git add .
git commit -m "Aggiunte 5 opere Rinascimento + immagini"
git push
Backup / Portabilità della memoria
La memoria è per dispositivo. Aggiungi due pulsanti (opzionali) per portarli altrove:

Esporta memoria → scarica memoria.json (contenuto di arteTrainerStats.v1)

Importa memoria → carica file e sovrascrivi lo storage

Snippet:

js
Copia codice
const STATS_KEY = 'arteTrainerStats.v1';

function exportMemoria() {
  const blob = new Blob([localStorage.getItem(STATS_KEY) || '{}'], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'memoria.json';
  a.click();
}

async function importMemoria(file) {
  const text = await file.text();
  localStorage.setItem(STATS_KEY, text);
  alert('Memoria importata.');
  location.reload();
}
Performance & qualità
Lazy loading immagini: <img loading="lazy">

Compressione immagini e misure coerenti

Accessibilità: alt descrittivi (“Titolo – Artista”), colori con buon contrasto, focus visibile sui bottoni

Offline (opz.): Service Worker minimale per PWA (studio anche senza internet)

Sicurezza & limiti
Nessun backend → nessuna credenziale da proteggere.

La memoria è locale: se si svuota la cache/cookie, si perde (usa Export per backup).

Nessun tracciamento di terze parti (privacy by design).

Appendice – Snippet utili
Percentuale & classi colore
js
Copia codice
function getPerf(stats, id) {
  const s = stats[id];
  const corr = s?.correct || 0, wrong = s?.wrong || 0;
  const tot = corr + wrong;
  const pct = tot ? Math.round((corr / tot) * 100) : null;
  return { pct, corr, wrong };
}

function classPerf(pct) {
  if (pct === null) return '';
  if (pct > 80) return 'perf-alta';   // verde
  if (pct >= 60) return 'perf-media'; // arancione
  return 'perf-bassa';                // rosso
}
Registrazione esito (una riga per immagine)
js
Copia codice
const STATS_KEY = 'arteTrainerStats.v1';

function registraEsito(id, ok) {
  const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  const row = (stats[id] ||= { correct:0, wrong:0, seen:0, last:0 });
  if (ok) row.correct++; else row.wrong++;
  row.seen++; row.last = Date.now();
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}
Reset memoria
js
Copia codice
localStorage.removeItem('arteTrainerStats.v1');
// poi rinfresca la UI
Slug per generare id coerenti
js
Copia codice
function slug(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}