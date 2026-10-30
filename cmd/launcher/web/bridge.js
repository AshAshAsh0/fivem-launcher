// สะพานเชื่อมหน้าเว็บกับตัวโปรแกรม (Go + WebView2)
(() => {
  if (typeof window.goCall !== 'function') return;
  let seq = 0;
  const pend = new Map();
  window.__goResolve = (id, ok, val) => {
    const p = pend.get(id);
    if (!p) return;
    pend.delete(id);
    ok ? p.res(val) : p.rej(new Error(val));
  };
  const call = (m, ...a) => new Promise((res, rej) => {
    const id = ++seq;
    pend.set(id, { res, rej });
    window.goCall(id, m, JSON.stringify(a)).catch(rej);
  });
  const vis = [];
  window.__goVisibility = (v) => vis.forEach((f) => { try { f(v); } catch {} });

  window.api = {
    native: true,
    minimize: () => call('minimize'),
    close: () => call('close'),
    toggleMax: () => {},
    startDrag: () => call('startDrag'),
    onVisibility: (f) => vis.push(f),
    load: () => call('load'),
    save: (d) => call('save', d),
    query: (a, o) => call('query', a, o || {}),
    fetchImage: (u) => call('fetchImage', u),
    fivemStatus: (s) => call('fivemStatus', s || ''),
    pickFiveM: () => call('pickFiveM'),
    launch: (c, after) => call('launch', c, after || 'none'),
    openFiveM: () => call('openFiveM'),
    openExternal: (u) => call('openExternal', u),
    scanCache: () => call('scanCache'),
    clearCache: () => call('clearCache'),
    metrics: () => call('metrics'),
    setPerfMode: (m) => call('setPerfMode', m),
    info: () => call('info'),
    exportData: (d) => call('exportData', d),
    importData: () => call('importData'),
    checkUpdate: (repo) => call('checkUpdate', repo),
    browse: (o) => call('browse', o),
    setLang: (l) => call('setLang', l),
    watchStart: (w) => call('watchStart', w),
    watchStop: (id) => call('watchStop', id),
    watchList: () => call('watchList'),
    installUpdate: (url, ver) => call('installUpdate', url, ver),
    setWallpaper: (b64) => call('setWallpaper', b64),
    clearWallpaper: () => call('clearWallpaper'),
    listBackups: () => call('listBackups'),
    readBackup: (n) => call('readBackup', n),
    wallpaperURL: (v) => `/wallpaper.jpg?v=${v}`,
  };

  // ลากหน้าต่างจากแถบบน/แถบข้าง
  document.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    if (!e.target.closest('.titlebar, .side')) return;
    if (e.target.closest('button, a, input, textarea, [data-act], .nav-btn, .wc')) return;
    e.preventDefault();
    call('startDrag');
  });
  // ปิดเมนูคลิกขวา/ซูมด้วย Ctrl+ล้อเมาส์ ให้เหมือนโปรแกรมทั่วไป
  document.addEventListener('contextmenu', (e) => { if (!e.target.closest('input, textarea')) e.preventDefault(); });
  window.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
  // กันการลากไฟล์จากเครื่องมาวางในหน้าต่าง (ไม่งั้น WebView จะเปิดไฟล์นั้นแทนหน้าโปรแกรม)
  ['dragover', 'drop'].forEach((ev) => window.addEventListener(ev, (e) => {
    if (e.dataTransfer && [...(e.dataTransfer.types || [])].includes('Files')) { e.preventDefault(); e.dataTransfer.dropEffect = 'none'; }
  }));
  // กันปุ่มลัดของเบราว์เซอร์ (รีโหลด, พิมพ์, เครื่องมือนักพัฒนา, ซูม)
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;
    if (e.key === 'F12' || e.key === 'F7' || (e.key === 'F5' && ctrl) ||
        (ctrl && ['r', 'p', 'u', 's', 'o', 'g', 'j', '+', '-', '=', '0'].includes(k)) ||
        (ctrl && e.shiftKey && ['i', 'j', 'c', 'r', 'delete'].includes(k))) {
      e.preventDefault();
    }
  }, true);
})();
