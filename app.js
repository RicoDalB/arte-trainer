// app.js
// Namespace globale condiviso
window.ArteTrainer = (function(){
  const STATS_KEY   = 'arteTrainerStats.v1';
  const OVERLAY_KEY = 'arteTrainerOverlay.v1';

  // --- Utils
  function slug(s) {
    return String(s).toLowerCase()
      .normalize('NFD').replace(/\p{Diacritic}/gu,'')
      .replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i=a.length-1; i>0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // --- Storage (memoria)
  function getStats() {
    try { return JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); }
    catch { return {}; }
  }
  function setStats(obj) {
    localStorage.setItem(STATS_KEY, JSON.stringify(obj));
  }
  function resetMemoria() {
    localStorage.removeItem(STATS_KEY);
    alert('Memoria azzerata.');
    location.reload();
  }
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

  function registraEsito(id, ok) {
    const stats = getStats();
    const row = (stats[id] ||= { correct:0, wrong:0, seen:0, last:0 });
    if (ok) row.correct++; else row.wrong++;
    row.seen++; row.last = Date.now();
    setStats(stats);
  }

  function getPerf(id) {
    const s = getStats()[id];
    const corr = s?.correct || 0, wrong = s?.wrong || 0;
    const tot = corr + wrong;
    const pct = tot ? Math.round((corr / tot) * 100) : null;
    return { pct, corr, wrong, seen: s?.seen || 0 };
  }
  function classPerf(pct) {
    if (pct === null) return '';
    if (pct > 80) return 'perf-alta';
    if (pct >= 60) return 'perf-media';
    return 'perf-bassa';
  }

  // --- Overlay (opere aggiunte via UI) – opzionale
  function getOverlay() {
    try { return JSON.parse(localStorage.getItem(OVERLAY_KEY) || '[]'); }
    catch { return []; }
  }

  // --- Dati opere
  async function caricaOpere() {
    const res = await fetch('data/opere.json');
    const base = await res.json();
    const overlay = getOverlay();
    const list = base.concat(overlay).map(o => ({
      ...o,
      id: o.id || slug(`${o.titolo || ''}-${o.artista || ''}`),
      _annoNum: parseInt((o.anno||'').match(/\d{3,4}/)?.[0]||0,10)
    }));
    return list;
  }

  return {
    // data
    caricaOpere,
    // memory
    registraEsito, getPerf, classPerf,
    resetMemoria, exportMemoria, importMemoria,
    // utils
    slug, shuffle
  };
})();
