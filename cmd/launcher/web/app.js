/* FiveM Launcher — renderer */
(() => {
  'use strict';
  const CFG = window.LAUNCHER_CONFIG;
  const api = window.api;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const fmtNum = (n) => Number(n || 0).toLocaleString('en-US');
  // รูปที่โหลดไม่ได้ (แบนเนอร์/ไอคอนเสีย) ให้เอาออก ไม่ให้เห็นไอคอนรูปแตก
  // (ใช้ตัวฟังกลางแทน onerror ในแท็ก เพราะ CSP ไม่อนุญาตสคริปต์ในแท็ก)
  document.addEventListener('error', (e) => { const t = e.target; if (t && t.tagName === 'IMG' && !t.dataset.keep) t.remove(); }, true);

  // ---------- icons ----------
  const I = {
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 5.5v13a1 1 0 0 0 1.5.9l10.4-6.5a1 1 0 0 0 0-1.8L8.5 4.6A1 1 0 0 0 7 5.5Z" fill="currentColor" stroke="none"/></svg>',
    bolt: '<svg viewBox="0 0 24 24"><path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>',
    refresh: '<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18" cy="12" r="1.3" fill="currentColor"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="m7 7 10 10M17 7 7 17"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4.8c0-.4.4-.8.8-.8h4.4c.4 0 .8.4.8.8V7M6.5 7l.9 12.2c.1.8.7 1.3 1.5 1.3h6.2c.8 0 1.4-.5 1.5-1.3L17.5 7"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
    discord: '<svg viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M19.3 5.3A16.6 16.6 0 0 0 15.2 4l-.5 1a15.4 15.4 0 0 0-5.4 0l-.5-1a16.5 16.5 0 0 0-4.1 1.3C2.1 9.2 1.4 13 1.7 16.7a16.7 16.7 0 0 0 5 2.6l1.1-1.7a10.7 10.7 0 0 1-1.7-.8l.4-.3a11.9 11.9 0 0 0 11 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.7a16.6 16.6 0 0 0 5-2.6c.4-4.3-.7-8-3-11.4ZM8.7 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z"/></svg>',
    folder: '<svg viewBox="0 0 24 24"><path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h4l2 2h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z"/></svg>',
    ext: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>',
    download: '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    upload: '<svg viewBox="0 0 24 24"><path d="M12 20V9M7 14l5-5 5 5M5 4h14"/></svg>',
    reset: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 4v5h5"/></svg>',
    folder2: '<svg viewBox="0 0 24 24"><path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h4l2 2h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z"/><path d="M12 11v5M9.5 13.5h5"/></svg>',
    sliders: '<svg viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
    gamepad: '<svg viewBox="0 0 24 24"><path d="M7.5 7h9a4.5 4.5 0 0 1 4.4 5.4l-.9 4.3a2.3 2.3 0 0 1-4 1l-1.6-1.9h-5l-1.6 1.9a2.3 2.3 0 0 1-4-1l-.9-4.3A4.5 4.5 0 0 1 7.5 7Z"/><path d="M8 10.5v3M6.5 12h3"/><circle cx="15.5" cy="11" r=".6" fill="currentColor"/><circle cx="17" cy="13" r=".6" fill="currentColor"/></svg>',
    chevs: '<svg viewBox="0 0 24 24"><path d="m6 6 6 6-6 6M13 6l6 6-6 6"/></svg>',
    filter: '<svg viewBox="0 0 24 24"><path d="M4 6.5h16M7 12h10M10 17.5h4"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="m12 3.8 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5 2.7 1-5.6-4.1-3.9 5.6-.8Z"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24"><path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7Z" fill="currentColor" stroke="none"/></svg>',
    mark: '<svg viewBox="0 0 40 40"><path d="M13 30 21.2 9.5c.5-1.3 2.3-1.3 2.8 0L32 30" fill="none" stroke="currentColor" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 30h7.5" stroke="currentColor" stroke-width="4.4" stroke-linecap="round"/><path d="M22.6 21.5v8.5" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg>',
  };

  // ---------- state ----------
  const DEFAULT_SETTINGS = { bHidePrivate: false, bHideFull: false, bSort: 'players', lang: null, after: 'minimize', refresh: 15, perf: 'balanced', motion: 'full', fivemPath: null };
  // เก็บเฉพาะค่าที่ยังใช้อยู่ (ค่าที่เลิกใช้แล้ว เช่น ธีม/รูปพื้นหลัง/เคอร์เซอร์ จะถูกตัดทิ้ง)
  const pickSettings = (o) => Object.fromEntries(Object.keys(DEFAULT_SETTINGS).map((k) => [k, o && o[k] !== undefined ? o[k] : DEFAULT_SETTINGS[k]]));
  const state = {
    servers: [],
    groups: [],
    settings: { ...DEFAULT_SETTINGS },
    page: 'browse',
    refreshing: false,
    fivem: { path: '', found: false },
    visible: true,
    version: '',
    update: null,
    watching: {},
    os: '',
    browse: { q: '', region: 'th', items: [], total: 0, players: 0, updated: 0, loading: false, error: null, loaded: false },
  };

  // จำนวนเซิร์ฟที่บันทึกล่าสุด: ถ้าลดลงจะแนบที่มาไปด้วย (ตัวโปรแกรมจะสำรองไฟล์เดิม + จดบันทึกสาเหตุ)
  let savedCount = 0;
  function persist() {
    const d = { version: 1, servers: state.servers, groups: state.groups, settings: state.settings };
    if (state.servers.length < savedCount) {
      try { d._why = `page=${state.page} ` + String(new Error().stack || '').split('\n').slice(2, 7).map((l) => l.trim()).join(' | '); } catch {}
    }
    savedCount = state.servers.length;
    api.save(d);
  }

  // ---------- color ----------
  const hexToRgb = (h) => {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const lum = (hex) => {
    const [r, g, b] = hexToRgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const shade = (hex, amt) => { const [r, g, b] = hexToRgb(hex); return rgbToHex(r * (1 - amt), g * (1 - amt), b * (1 - amt)); };
  const isHex = (c) => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
  const toneOf = (s) => (isHex(s.tone) ? s.tone : isHex(s.autoTone) ? s.autoTone : '#2c2c3a');
  // ตรวจข้อมูลที่โหลดจากไฟล์ (กันไฟล์สำรองที่เสียหรือถูกแก้มา)
  function cleanGroups(list, servers) {
    if (!Array.isArray(list)) list = [];
    const out = [], seen = new Set();
    for (const g of list) {
      if (!g || typeof g !== 'object') continue;
      const id = typeof g.id === 'string' && /^[a-z0-9]{4,40}$/i.test(g.id) && !seen.has(g.id) ? g.id : null;
      const name = typeof g.name === 'string' ? g.name.trim().slice(0, 40) : '';
      if (!id || !name) continue;
      seen.add(id);
      out.push({ id, name, collapsed: !!g.collapsed });
    }
    servers.forEach((s) => { if (s.group && !seen.has(s.group)) s.group = null; });
    return out;
  }
  function cleanServers(list) {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    return list.filter((x) => x && typeof x === 'object' && typeof x.address === 'string' && x.address.trim()).map((x) => {
      let id = typeof x.id === 'string' && /^[a-z0-9]{4,40}$/i.test(x.id) ? x.id : uid();
      if (seen.has(id)) id = uid();
      seen.add(id);
      const str = (v, n = 300) => (typeof v === 'string' ? v.slice(0, n) : '');
      const img = (v) => (typeof v === 'string' && /^(https?:|data:image\/)/i.test(v) ? v : null);
      return {
        ...x, id,
        address: str(x.address, 300).trim(), connect: str(x.connect || x.address, 300).trim(), display: str(x.display || x.address, 300),
        name: str(x.name, 120) || str(x.address, 120), desc: str(x.desc), category: str(x.category, 30),
        discord: str(x.discord), bannerUrl: str(x.bannerUrl, 2000), logoUrl: str(x.logoUrl, 2000),
        logo: img(x.logo), banner: img(x.banner),
        tone: isHex(x.tone) ? x.tone : 'auto', autoTone: isHex(x.autoTone) ? x.autoTone : null,
        fav: undefined, group: typeof x.group === 'string' ? x.group : null, lastPlayed: Number(x.lastPlayed) || null, addedAt: Number(x.addedAt) || Date.now(),
        status: x.status && typeof x.status === 'object' ? { online: !!x.status.online, players: Number(x.status.players) || 0, max: Number(x.status.max) || 0, ping: x.status.ping == null ? null : Number(x.status.ping) || 0 } : null,
      };
    });
  }
  function toneStyle(hex) {
    const L = lum(hex);
    const ink = L > 0.45 ? '#1d1d21' : '#ffffff';
    const text = L > 0.5 ? shade(hex, 0.45) : hex;
    return `--tone:${hex};--tone-ink:${ink};--tone-deep:${shade(hex, 0.28)};--tone-text:${text};--tone-line:${L > 0.5 ? shade(hex, 0.15) : hex}`;
  }

  function loadImage(src) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    });
  }
  async function dominantColor(src) {
    if (!src) return null;
    try {
      if (!src.startsWith('data:')) src = (await api.fetchImage(src)) || src;
      const img = await loadImage(src);
      const c = document.createElement('canvas');
      c.width = c.height = 48;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, 48, 48);
      const d = ctx.getImageData(0, 0, 48, 48).data;
      const buckets = new Map();
      for (let i = 0; i < d.length; i += 4) {
        const [r, g, b, a] = [d[i], d[i + 1], d[i + 2], d[i + 3]];
        if (a < 160) continue;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;
        if (max < 40 || (max > 235 && sat < 0.12) || sat < 0.22) continue;
        const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
        const e = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0, s: 0 };
        e.n++; e.r += r; e.g += g; e.b += b; e.s += sat;
        buckets.set(key, e);
      }
      let best = null, score = 0;
      for (const e of buckets.values()) {
        const sc = e.n * (0.6 + e.s / e.n);
        if (sc > score) { score = sc; best = e; }
      }
      if (!best) return '#2c2c3a';
      return rgbToHex(best.r / best.n, best.g / best.n, best.b / best.n);
    } catch {
      return null;
    }
  }

  // ---------- helpers ----------
  const logoOf = (s) => s.logoUrl || s.logo || null;
  const bannerOf = (s) => s.bannerUrl || s.banner || null;
  const st = (s) => s.status || { online: false, players: 0, max: 0, ping: null };
  function loadPct(s) {
    const { players, max } = st(s);
    if (!max) return 0;
    return Math.min(100, Math.round((players / max) * 100));
  }
  const barColor = (p) => (p >= 95 ? '#ef5b5b' : p >= 50 ? '#f2b632' : '#2fcf7a');
  const pctColor = (p) => (p >= 95 ? '#e04848' : p >= 50 ? '#d79a12' : '#1ea960');
  function fmtSize(b) {
    if (b == null) return 'ไม่มี';
    if (b === 0) return '0 MB';
    if (b < 1024 * 1024) return `${Math.max(1, Math.round(b / 1024))} KB`;
    if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(1)} MB`;
    return `${(b / 1024 ** 3).toFixed(2)} GB`;
  }
  const normUrl = (u) => (!u ? '' : /^[a-z]+:\/\//i.test(u) ? u : `https://${u}`);
  const initial = (name) => (String(name || '?').trim()[0] || '?').toUpperCase();

  // ---------- toast ----------
  // แจ้งเตือนแบบ HUD: ok = สำเร็จ (เขียว), err = ผิดพลาด (แดง), info = ข้อมูล (ฟ้า), warn = คำเตือน (ส้ม)
  const TOAST = {
    ok: { cls: 'ok', t: 'สำเร็จ', ic: '<svg viewBox="0 0 24 24"><path d="m6.5 12.5 3.8 3.8 7.2-8"/></svg>' },
    err: { cls: 'err', t: 'ผิดพลาด', ic: '<svg viewBox="0 0 24 24"><path d="m7.5 7.5 9 9M16.5 7.5l-9 9"/></svg>' },
    info: { cls: 'info', t: 'ข้อมูล', ic: '<svg viewBox="0 0 24 24"><path d="M12.6 10.5 11 17.5M13 6.6v.01"/></svg>' },
    warn: { cls: 'warn', t: 'คำเตือน', ic: '<svg viewBox="0 0 24 24"><path d="M12 4.5 21 19.5H3Z" fill="currentColor" stroke="none"/><path d="M12 10v4.5M12 17v.01" stroke="#1a1c20" stroke-width="2.2"/></svg>' },
  };
  function toast(msg, type = 'ok') {
    const k = TOAST[type] || TOAST.ok;
    const el = document.createElement('div');
    el.className = `toast ${k.cls}`;
    el.innerHTML = `<span class="ti">${k.ic}</span><span class="tx"><b>${k.t}</b><span>${esc(msg)}</span></span><i class="tbar"></i>`;
    $('#toasts').appendChild(el);
    while ($('#toasts').children.length > 4) $('#toasts').firstChild.remove();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, type === 'err' || type === 'warn' ? 4200 : 2800);
  }

  // ---------- theme / prefs ----------
  function applyPrefs() {
    const r = document.documentElement;
    r.dataset.theme = 'hud'; // ธีมเดียวของ Launcher
    r.dataset.motion = state.settings.motion;
    r.dataset.perf = state.settings.perf;
    if (!state.settings.lang) state.settings.lang = window.I18N?.detect() || 'th';
    window.I18N?.set(state.settings.lang);
    api.setLang?.(state.settings.lang);
  }
  const isEN = () => state.settings.lang === 'en';
  // เวลาที่เล่นล่าสุดแบบสั้น ๆ เช่น "3 ชม." / "3h"
  function ago(t) {
    const m = Math.max(0, Math.floor((Date.now() - t) / 60000)), en = isEN();
    if (m < 1) return en ? 'just now' : 'เมื่อกี้';
    if (m < 60) return en ? `${m}m ago` : `${m} นาทีก่อน`;
    const h = Math.floor(m / 60);
    if (h < 24) return en ? `${h}h ago` : `${h} ชม.ก่อน`;
    const d = Math.floor(h / 24);
    if (d < 30) return en ? `${d}d ago` : `${d} วันก่อน`;
    const mo = Math.floor(d / 30);
    return en ? `${mo}mo ago` : `${mo} เดือนก่อน`;
  }

  // ---------- navigation ----------
  function go(page) {
    if (page !== 'settings') page = 'browse'; // หน้าหลักคือรายชื่อเซิร์ฟ เหลือแค่หน้าตั้งค่าแยกออกไป
    closeMenu();
    closeModal();
    state.page = page;
    $$('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.page === page));
    $('#scroll').classList.toggle('split', true);
    $('#scroll').classList.toggle('set', page === 'settings');
    render(true);
    $('#scroll').scrollTop = 0;
  }

  function render(animate = false) {
    const v = $('#view');
    v.innerHTML = state.page === 'settings' ? settingsHTML() : browseHTML();
    v.classList.toggle('enter', animate);
    if (animate) setTimeout(() => v.classList.remove('enter'), 700);
    bindView();
  }

  // ---------- แจ้งเตือนเซิร์ฟ ----------
  // แจ้งเตือนเมื่อมีที่ว่าง (เซิร์ฟเต็ม) หรือเมื่อเซิร์ฟเปิด (เซิร์ฟออฟไลน์)
  function bellKind(s) {
    const S = st(s);
    if (!S.online) return 'online';
    if (S.max && S.players >= S.max) return 'slot';
    return '';
  }
  function bellHTML(s) {
    const w = state.watching[s.id];
    if (w) return `<button class="pill pill-bell on" data-act="watch" data-id="${s.id}" title="กดเพื่อยกเลิก">🔔 ${w === 'online' ? 'รอเซิร์ฟเปิด' : 'รอที่ว่าง'} · ยกเลิก</button>`;
    const k = bellKind(s);
    if (!k) return '';
    return `<button class="pill pill-bell" data-act="watch" data-id="${s.id}">🔔 ${k === 'online' ? 'แจ้งเมื่อเปิด' : 'แจ้งเมื่อว่าง'}</button>`;
  }
  async function toggleWatch(s) {
    if (state.watching[s.id]) {
      try { await api.watchStop(s.id); } catch {}
      delete state.watching[s.id];
      toast('ยกเลิกการแจ้งเตือนแล้ว');
    } else {
      const kind = bellKind(s) || 'slot';
      try { await api.watchStart({ id: s.id, address: s.address, connect: s.connect || s.address, name: s.name, kind }); } catch { return toast('ตั้งแจ้งเตือนไม่สำเร็จ', 'err'); }
      state.watching[s.id] = kind;
      toast(kind === 'online' ? `จะแจ้งเตือนเมื่อ ${s.name} เปิด` : `จะแจ้งเตือนเมื่อ ${s.name} มีที่ว่าง`);
    }
    updateHomeParts();
  }
  window.__goWatchHit = ({ id, kind }) => {
    delete state.watching[id];
    const s = byId(id);
    if (s) toast(kind === 'online' ? `${s.name} เปิดแล้ว!` : `${s.name} มีที่ว่างแล้ว!`);
    refreshAll();
  };

  // ---------- กลุ่ม ----------
  const groupById = (id) => state.groups.find((g) => g.id === id);

  function groupModal(g, thenMove) {
    const m = modal(`
      <div class="modal sm">
        <div class="modal-head"><h2>${g ? 'เปลี่ยนชื่อกลุ่ม' : 'สร้างกลุ่มใหม่'}</h2><button class="x-btn" data-close>${I.x}</button></div>
        <div class="modal-body">
          <div class="field"><label>ชื่อกลุ่ม</label><input class="input" id="gName" maxlength="40" placeholder="เช่น เซิร์ฟหลัก, ลองเล่น" value="${esc(g?.name || '')}"></div>
        </div>
        <div class="modal-foot"><button class="btn" data-close>ยกเลิก</button><button class="btn btn-dark" id="gSave">${I.check} บันทึก</button></div>
      </div>`);
    const save = () => {
      const name = $('#gName', m).value.trim().slice(0, 40);
      if (!name) return $('#gName', m).focus();
      if (g) g.name = name;
      else {
        const ng = { id: uid(), name, collapsed: false };
        state.groups.push(ng);
        if (thenMove) thenMove.group = ng.id;
      }
      persist(); closeModal(); updateHomeParts();
      toast(g ? 'เปลี่ยนชื่อกลุ่มแล้ว' : 'สร้างกลุ่มแล้ว');
    };
    $('#gSave', m).addEventListener('click', save);
    $('#gName', m).addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); });
    setTimeout(() => $('#gName', m)?.focus(), 50);
  }

  function groupMenu(anchor, g) {
    showMenu(anchor, `
      <button data-m="rename">${I.edit} เปลี่ยนชื่อกลุ่ม</button>
      <button data-m="up" ${state.groups[0] === g ? 'disabled' : ''}>↑ เลื่อนกลุ่มขึ้น</button>
      <button data-m="down" ${state.groups[state.groups.length - 1] === g ? 'disabled' : ''}>↓ เลื่อนกลุ่มลง</button>
      <hr><button data-m="del" class="danger">${I.trash} ลบกลุ่ม</button>`, (k) => {
      const i = state.groups.indexOf(g);
      if (k === 'rename') return groupModal(g);
      if (k === 'up' && i > 0) [state.groups[i - 1], state.groups[i]] = [state.groups[i], state.groups[i - 1]];
      if (k === 'down' && i < state.groups.length - 1) [state.groups[i + 1], state.groups[i]] = [state.groups[i], state.groups[i + 1]];
      if (k === 'del') {
        state.servers.forEach((s) => { if (s.group === g.id) s.group = null; });
        state.groups = state.groups.filter((x) => x !== g);
        toast('ลบกลุ่มแล้ว (เซิร์ฟในกลุ่มย้ายไป “ไม่ได้จัดกลุ่ม”)');
      }
      persist(); updateHomeParts();
    });
  }

  // อัปเดตเฉพาะตัวเลข/สถานะของเซิร์ฟของฉัน โดยไม่สร้างแถวใหม่ (ไม่โหลดรูปซ้ำ ไม่กระตุก)
  function patchAll() {
    if (state.page !== 'browse') return;
    $$('.b-row[data-mid]').forEach((r) => {
      const s = byId(r.dataset.mid); if (!s) return;
      const S = st(s), p = loadPct(s);
      const set = (sel, fn) => { const el = r.querySelector(sel); if (el) fn(el); };
      r.classList.toggle('offline', !S.online);
      set('.js-pl', (el) => { el.textContent = S.online ? fmtNum(S.players) : '—'; });
      set('.js-max', (el) => { el.textContent = fmtNum(S.max); });
      set('.js-bar', (el) => { el.style.width = `${S.online ? p : 0}%`; el.style.setProperty('--barc', barColor(p)); });
      set('.js-stc', (el) => { el.innerHTML = stChip(S.online, S.players, S.max, false); });
    });
  }
  // วาดรายชื่อใหม่ (คงตำแหน่งเลื่อน) และแผงเซิร์ฟของฉันที่เปิดอยู่
  function updateHomeParts() {
    if (state.page !== 'browse') return;
    const col = $('#bList')?.closest('.b-col'), y = col ? col.scrollTop : 0;
    drawBrowse();
    if (col) col.scrollTop = y;
    const sel = state.browse.sel;
    if (sel && sel.startsWith('m:')) { const m = byId(sel.slice(2)); m ? mineSide(m) : closeServer(); }
  }

  // ---------- BROWSE (รายชื่อเซิร์ฟสาธารณะ) ----------
  const joinOf = (id) => `cfx.re/join/${id}`;
  // ใช้ที่อยู่ตรงของเซิร์ฟถ้ามี (ไม่ต้องผ่านระบบลิงก์ cfx.re) ไม่งั้นใช้ cfx.re/join
  const targetOf = (s) => s.endpoint || joinOf(s.id);


  function browseHTML() {
    const B = state.browse;
    return `
      <div class="toolbar">
        <label class="search ${B.q ? 'has' : ''}" id="bSearch">${I.search}<input id="bq" placeholder="ค้นหาชื่อเซิร์ฟ หรือวาง IP / ลิงก์ cfx.re" value="${esc(B.q)}" spellcheck="false"><button class="q-clear" id="bqClear" title="ล้างคำค้นหา">${I.x}</button></label>
        <div class="seg" id="bRegion">
          <button data-r="th" class="${B.region === 'th' ? 'on' : ''}">เซิร์ฟไทย</button>
          <button data-r="all" class="${B.region === 'all' ? 'on' : ''}">ทั้งหมด</button>
        </div>
        <button class="btn b-flt" id="bFilter" title="ตัวกรอง">${I.filter}<span>ตัวกรอง</span><i id="bFltN" data-no-i18n>${fltCount() || ''}</i></button>
        <button class="icon-btn ${B.loading ? 'spin' : ''}" id="bRefresh" title="โหลดรายชื่อใหม่">${I.refresh}</button>
      </div>
      ${state.fivem && state.fivem.found === false ? `<div class="fivem-miss">${I.x}<span><b>ไม่พบ FiveM ในเครื่องนี้</b><small>ต้องติดตั้ง FiveM ก่อนถึงจะเข้าเซิร์ฟได้ ถ้าติดตั้งไว้ที่อื่น เลือกไฟล์ FiveM.exe เองได้</small></span><button class="btn btn-sm btn-dark" data-act="dl-fivem2">${I.ext} ดาวน์โหลด FiveM</button><button class="btn btn-sm" data-act="pick-fivem2">${I.folder2} เลือกไฟล์</button></div>` : ''}
      <div class="b-split ${B.sel ? 'open' : ''}" id="bSplit">
        <aside class="sv-side" id="svSide"></aside>
        <div class="b-panel"><div class="b-col"><div class="b-list" id="bList"></div><div class="b-more" id="bMore"></div></div></div>
      </div>`;
  }

  function browseRow(s) {
    const sub = s.desc || s.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 6).join(' · ') || joinOf(s.id);
    return `<div class="b-row ${s.private ? 'priv' : ''}" data-id="${esc(s.id)}">
      <div class="b-ic"><span>${esc(initial(s.name))}</span>${s.icon ? `<img src="${esc(imgSrc(s.icon))}" alt="" loading="lazy">` : ''}</div>
      <div class="b-main"><div class="b-name" title="${esc(s.name)}" data-no-i18n>${esc(s.name)}</div><div class="b-sub" title="${esc(sub)}" data-no-i18n>${esc(sub)}</div></div>
      <div class="b-pl">${plHTML(s.players, s.max, true)}</div>
      <i class="b-chev">${I.chevs}</i>
      <div class="b-st">${stChip(true, s.players, s.max, s.private)}</div>
    </div>`;
  }

  const fltCount = () => (state.settings.bHidePrivate ? 1 : 0) + (state.settings.bHideFull ? 1 : 0) + (state.settings.bSort === 'name' ? 1 : 0);
  // หัวข้อแบบเมนูในเกม: คำแรกขาว คำหลังฟ้า + บรรทัดรองจาง ๆ + กล่องไอคอน
  function secHead(kind, sub, extra = '') {
    const [a, b, ic] = kind === 'mine'
      ? (isEN() ? ['My', 'servers', I.star] : ['เซิร์ฟ', 'ของฉัน', I.star])
      : (isEN() ? ['Public', 'servers', I.globe] : ['เซิร์ฟ', 'สาธารณะ', I.globe]);
    return `<div class="b-sec sec-${kind}"><div class="sh-ic">${ic}</div><div class="sh-t"><p data-no-i18n>${a}<span>${b}</span></p><small id="${kind === 'pub' ? 'bMeta' : 'mMeta'}">${sub}</small></div>${extra}</div>`;
  }
  // สถานะเซิร์ฟแบบชัด ๆ: ออนไลน์ (เขียว) / ใกล้เต็ม (ส้ม) / เต็ม (แดง) / ออฟไลน์ (เทา) / ส่วนตัว (เหลือง)
  function stInfo(online, players, max, priv) {
    const p = max ? players / max : 0;
    return priv ? ['priv', 'ส่วนตัว'] : !online ? ['off', 'ออฟไลน์'] : max && players >= max ? ['full', 'เต็ม'] : p >= 0.85 ? ['busy', 'ใกล้เต็ม'] : ['ok', 'ออนไลน์'];
  }
  function stChip(online, players, max, priv) {
    const [k, label] = stInfo(online, players, max, priv);
    return `<span class="stc stc-${k}">${priv ? '<b>🔒</b>' : '<i></i>'}<span>${label}</span></span>`;
  }
  function plHTML(players, max, online) {
    const p = max ? Math.min(100, Math.round((players / max) * 100)) : 0;
    return `<div class="pl-n"><b class="js-pl">${online === false ? '—' : fmtNum(players)}</b><span>/<span class="js-max">${fmtNum(max)}</span></span></div><div class="bar"><i class="js-bar" style="width:${online === false ? 0 : p}%;--barc:${barColor(p)}"></i></div>`;
  }

  // ช่องค้นหาเป็นที่อยู่เซิร์ฟ (IP:พอร์ต, โดเมน, ลิงก์ cfx.re, คำสั่ง connect) → เข้าได้ตรง ๆ
  function directTarget(q) {
    let t = String(q || '').trim().replace(/^connect\s+/i, '');
    if (!t || /\s/.test(t)) return '';
    if (/^(https?:\/\/)?cfx\.re\/join\/[a-z0-9]{3,12}\/?$/i.test(t)) return t;
    if (/^\d{1,3}(\.\d{1,3}){3}(:\d{2,5})?$/.test(t)) return t;
    if (/^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+(:\d{2,5})?(\/\S*)?$/i.test(t) && /\.[a-z]{2,}(:|\/|$)/i.test(t)) return t;
    return '';
  }
  function directRow(t) {
    return `<div class="b-row b-direct" data-direct="1">
      <div class="b-ic">${I.bolt}</div>
      <div class="b-main"><div class="b-name">เข้าเซิร์ฟจากที่อยู่นี้โดยตรง</div><div class="b-sub" data-no-i18n>${esc(t)}</div></div>
      <div class="b-pl"></div>
      <div class="b-act"><button class="btn btn-sm" data-b="direct-save">${I.plus} บันทึก</button><button class="btn btn-sm btn-dark b-play" data-b="direct">${I.play} เข้าเลย</button></div>
    </div>`;
  }
  function joinDirect(t) {
    warnNoFiveM();
    toast(`กำลังเข้า ${t}`, 'info');
    api.launch(t, state.settings.after).catch(() => toast('ที่อยู่ไม่ถูกต้อง หรือเปิด FiveM ไม่สำเร็จ', 'err'));
  }

  const imgSrc = (u) => (api.img ? api.img(u) : u);

  // แผงรายละเอียดเซิร์ฟด้านซ้าย (คลิกที่แถว) — รายชื่อยังอยู่ด้านขวา กดเซิร์ฟอื่นสลับได้ทันที
  function closeServer() {
    state.browse.sel = null;
    $('#bSplit')?.classList.remove('open');
    $$('.b-row.sel').forEach((r) => r.classList.remove('sel'));
    const side = $('#svSide'); if (side) side.innerHTML = '';
  }
  // แผงเลือกเซิร์ฟ: ป้ายสถานะกรอบตัดมุม + โลโก้ใหญ่มีแสงฟุ้ง + กล่องสถิติแบบกระจก + ปุ่มเล่นเรืองแสง
  function sideTpl(o) {
    const pct = o.max ? Math.min(100, Math.round((o.players / o.max) * 100)) : 0;
    return `
      <div class="sx-hero" style="--tone:${o.tone || '#2ec2ff'}">
        ${o.bg ? `<img class="sx-bg ${o.blur ? 'blur' : ''}" src="${esc(o.bg)}" alt="">` : ''}
        <button class="x-btn sx-x" id="svClose" title="ปิด">${I.x}</button>
        <div class="sx-logo"><span>${esc(initial(o.name))}</span>${o.logo ? `<img src="${esc(o.logo)}" alt="">` : ''}</div>
        <h2 class="sx-name" data-no-i18n title="${esc(o.name)}">${esc(o.name)}</h2>
        ${o.sub ? `<div class="sx-sub" data-no-i18n title="${esc(o.sub)}">${esc(o.sub)}</div>` : ''}
        <div class="sx-st">${stChip(o.online !== false, o.players, o.max, o.priv)}${o.badgeSub ? `<span class="sx-tag">${o.badgeSub}</span>` : ''}</div>
      </div>
      <div class="sv-body sx-body">
        <div class="sx-lbl"><i></i><span>ข้อมูลเซิร์ฟ</span></div>
        <div class="sx-stats">
          <div class="sx-box"><span>ผู้เล่น</span><b>${o.online === false ? '—' : fmtNum(o.players)}<small>/${fmtNum(o.max)}</small></b></div>
          <div class="sx-box"><span>ปิง</span><b id="svPing">${o.ping}</b></div>
          <div class="sx-box"><span>ความจุ</span><b style="color:${pctColor(pct)}">${pct}%</b></div>
        </div>
        <div class="bar sx-bar"><i style="width:${o.online === false ? 0 : pct}%;--barc:${barColor(pct)}"></i></div>
        ${o.extra || ''}
      </div>
      ${o.foot || ''}`;
  }
  // ช่องที่อยู่เซิร์ฟแบบ "YOUR CODE INVITE": ป้ายเล็กด้านบน + กล่องที่อยู่ + ปุ่มคัดลอกสี่เหลี่ยม
  const addrBox = (a) => `<div class="rp-addr"><span class="rp-lbl">ที่อยู่เซิร์ฟ</span><div class="sv-addr"><code data-no-i18n>${esc(a)}</code><button class="rp-copy" id="svCopy" title="คัดลอก">${I.copy}</button></div></div>`;
  // ปุ่มเล่นแบบ CONFIRM (สามเหลี่ยมสองข้าง)
  const playFoot = (label) => `<div class="sv-foot"><button class="rp-confirm sv-play" id="svPlay">${label}</button></div>`;
  function serverPopup(s) {
    state.browse.selItem = s;
    const tags = s.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 8);
    const target = targetOf(s);
    const mineOf = state.servers.find((x) => x.cfxId === s.id);
    const side = openSide(sideTpl({
      name: s.name, online: true, players: s.players, max: s.max, priv: s.private, ping: s.private ? '—' : '…',
      bg: s.banner ? imgSrc(s.banner) : s.icon ? imgSrc(s.icon) : '', blur: !s.banner, logo: s.icon ? imgSrc(s.icon) : '',
      badgeSub: s.locale ? esc(s.locale.replace('_', '-').toUpperCase()) : '',
      sub: tags.slice(0, 4).join(' · '),
      extra: `
        ${s.desc ? `<p class="sv-desc" data-no-i18n>${esc(s.desc)}</p>` : ''}
        ${s.private
          ? (mineOf
            ? `<p class="sv-note ok">บันทึกเซิร์ฟนี้ไว้ใน “เซิร์ฟของฉัน” แล้ว — กดเล่นจากรายการด้านบนได้เลย</p><button class="btn" id="svGoMine">★ ไปที่เซิร์ฟของฉัน</button>`
            : `<p class="sv-note">เซิร์ฟนี้ตั้งเป็นส่วนตัว เข้าจากรายชื่อไม่ได้ — ขอ IP หรือลิงก์จาก Discord ของเซิร์ฟ แล้ววางด้านล่าง ระบบจะบันทึกไว้ใน “เซิร์ฟของฉัน” ให้กดเข้าได้ทุกครั้ง</p>
              <div class="sv-ipbox"><input class="input" id="svIp" placeholder="เช่น 103.91.190.199:30120" spellcheck="false"><button class="btn btn-dark" id="svSave">${I.check} บันทึก</button></div>`)
          : addrBox(target)}
        ${s.discord || s.website ? `<div class="sv-links">
          ${s.discord ? `<button class="btn btn-sm sv-discord" data-link="${esc(s.discord)}">${I.discord} Discord</button>` : ''}
          ${s.website ? `<button class="btn btn-sm" data-link="${esc(s.website)}">${I.globe} เว็บไซต์</button>` : ''}
        </div>` : ''}`,
      foot: s.private ? '' : playFoot('เล่นเลย', s.players, s.max),
    }), s.id);
    if (!side) return;
    $('#svSave', side)?.addEventListener('click', () => savePrivate(s, $('#svIp', side).value));
    $('#svIp', side)?.addEventListener('keydown', (e) => { if (e.key === 'Enter') savePrivate(s, e.target.value); });
    $('#svGoMine', side)?.addEventListener('click', () => { if (mineOf) { $('#bq').value = ''; state.browse.q = ''; drawBrowse(); mineSide(mineOf); $('#bList').closest('.b-col').scrollTop = 0; } });
    $('#svPlay', side)?.addEventListener('click', () => {
      warnNoFiveM();
      toast(`กำลังเข้า ${s.name}`, 'info');
      api.launch(target, state.settings.after).catch(() => toast('เปิด FiveM ไม่สำเร็จ', 'err'));
    });
    $$('[data-link]', side).forEach((btn) => btn.addEventListener('click', () => api.openExternal(btn.dataset.link)));
    $('#svCopy', side)?.addEventListener('click', () => {
      navigator.clipboard.writeText(target).then(() => toast('คัดลอกที่อยู่แล้ว'), () => toast('คัดลอกไม่สำเร็จ', 'err'));
    });
    const ping = $('#svPing', side);
    if (s.private) { ping.textContent = '—'; return; }
    api.query(target, {}).then((r) => {
      if (state.browse.sel !== s.id) return; // ผู้ใช้เปลี่ยนไปเซิร์ฟอื่นแล้ว
      const el = $('#svPing'); if (el) el.innerHTML = r && r.online && r.ping != null ? `${r.ping}<small>ms</small>` : '—';
    }).catch(() => { const el = $('#svPing'); if (el && state.browse.sel === s.id) el.textContent = '—'; });
  }

  // ---------- เซิร์ฟของฉัน (เพิ่ม IP เองได้ รวมเซิร์ฟส่วนตัว) ----------
  function mineHTML(q) {
    const t = String(q || '').trim().toLowerCase();
    const list = state.servers.filter((s) => !t || [s.name, s.address, s.display].join(' ').toLowerCase().includes(t));
    if (t && !list.length) return '';
    const head = secHead('mine', state.servers.length ? `บันทึกไว้ ${state.servers.length} เซิร์ฟ · ดับเบิลคลิกเพื่อเข้า` : 'เซิร์ฟที่คุณบันทึกไว้', `<button class="btn btn-sm" data-b="add-mine">${I.plus} เพิ่มเซิร์ฟ / IP</button>`);
    if (!list.length) return head + `<button class="mine-empty" data-b="add-mine">${I.plus}<span><b>เพิ่มเซิร์ฟของคุณ</b><small>ใส่ IP หรือลิงก์ของเซิร์ฟ (รวมเซิร์ฟส่วนตัว) แล้วจะอยู่ตรงนี้ กดเข้าได้ทุกครั้ง</small></span></button>`;
    if (!state.groups.length) return head + list.map(mineRow).join('');
    const ids = new Set(state.groups.map((g) => g.id));
    const grpHead = (g, n) => `<div class="mine-grp"><span data-no-i18n>${esc(g.name)}</span><i>${n}</i>${`<button class="grp-more" data-grp="menu" data-gid="${g.id}" title="จัดการกลุ่ม">${I.more}</button>`}</div>`;
    const parts = state.groups.map((g) => {
      const items = list.filter((s) => s.group === g.id);
      if (t && !items.length) return '';
      return grpHead(g, items.length) + (items.length ? items.map(mineRow).join('') : '<div class="mine-grp-empty">ยังไม่มีเซิร์ฟในกลุ่มนี้ — คลิกขวาที่เซิร์ฟแล้วเลือกกลุ่ม</div>');
    }).join('');
    const loose = list.filter((s) => !s.group || !ids.has(s.group));
    return head + parts + (loose.length ? `<div class="mine-grp"><span>ไม่ได้จัดกลุ่ม</span><i>${loose.length}</i></div>` + loose.map(mineRow).join('') : '');
  }
  function mineRow(s) {
    const S = st(s), logo = logoOf(s), sel = state.browse.sel === 'm:' + s.id;
    return `<div class="b-row mine ${S.online ? '' : 'offline'} ${sel ? 'sel' : ''}" data-mid="${s.id}" title="ดับเบิลคลิกเพื่อเข้าเซิร์ฟ">
      <div class="b-ic" style="background:${toneOf(s)}"><span>${esc(initial(s.name))}</span>${logo ? `<img src="${esc(logo)}" alt="">` : ''}</div>
      <div class="b-main"><div class="b-name" data-no-i18n>${esc(s.name)}</div><div class="b-sub" data-no-i18n>${esc(s.display || s.address)}${s.lastPlayed ? ` · ${esc(ago(s.lastPlayed))}` : ''}</div></div>
      <div class="b-pl">${plHTML(S.players, S.max, S.online)}</div>
      <i class="b-chev">${I.chevs}</i>
      <div class="b-st js-stc">${s.status ? stChip(S.online, S.players, S.max, false) : '<span class="stc stc-off"><i></i>…</span>'}</div>
    </div>`;
  }
  function bindMine(root) {
    $$('[data-b="add-mine"]', root).forEach((b) => (b.onclick = () => openServerModal()));
    $$('[data-grp="menu"]', root).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); groupMenu(b, groupById(b.dataset.gid)); }));
    $$('.b-row[data-mid]', root).forEach((row) => {
      const s = byId(row.dataset.mid);
      if (!s) return;
      row.onclick = (e) => { if (!e.target.closest('button') && state.browse.sel !== 'm:' + s.id) mineSide(s); };
      row.ondblclick = (e) => { if (!e.target.closest('button')) play(s.id); };
      row.oncontextmenu = (e) => { e.preventDefault(); openMenu(atMouse(e), s); };
    });
  }
  // เปิดหน้าต่างเพิ่มเซิร์ฟ พร้อมใส่ที่อยู่ให้แล้วกดตรวจสอบเลย
  function addServerWith(addr) {
    openServerModal();
    setTimeout(() => { const i = $('#fAddr'); if (i) { i.value = addr; $('#fCheck')?.click(); } }, 80);
  }
  function openSide(html, key) {
    const B = state.browse, side = $('#svSide'), split = $('#bSplit');
    if (!side || !split) return null;
    B.sel = key;
    $$('.b-row').forEach((r) => r.classList.toggle('sel', (r.dataset.mid ? 'm:' + r.dataset.mid : r.dataset.id) === key));
    const wasOpen = split.classList.contains('open');
    side.innerHTML = html;
    split.classList.add('open');
    side.classList.toggle('swap', wasOpen);
    side.scrollTop = 0;
    $('#svClose', side).onclick = closeServer;
    return side;
  }
  function mineSide(s) {
    const S = st(s), p = loadPct(s), logo = logoOf(s), banner = bannerOf(s), t = toneOf(s);
    state.browse.selItem = null;
    const side = openSide(sideTpl({
      name: s.name, online: S.online, players: S.players, max: S.max, priv: false, tone: t,
      ping: S.ping != null ? `${S.ping}<small>ms</small>` : '—',
      bg: banner || logo || '', blur: !banner, logo,
      badgeSub: 'เซิร์ฟของฉัน', sub: [s.category, s.display || s.address].filter(Boolean).join(' · '),
      extra: `
        ${s.desc ? `<p class="sv-desc" data-no-i18n>${esc(s.desc)}</p>` : ''}
        ${addrBox(s.connect || s.address)}
        <div class="sv-links">
          ${bellHTML(s)}
          ${s.discord ? `<button class="btn btn-sm sv-discord" data-link="${esc(normUrl(s.discord))}">${I.discord} Discord</button>` : ''}
          <button class="btn btn-sm" id="svGrp">${I.folder2} กลุ่ม</button>
          <button class="btn btn-sm btn-danger" id="svDel">${I.trash} ลบ</button>
        </div>`,
      foot: playFoot(S.online ? 'เล่นเลย' : 'ลองเข้า', S.online ? S.players : 0, S.max),
    }), 'm:' + s.id);
    if (!side) return;
    $('#svPlay', side).onclick = () => play(s.id);
    $('#svDel', side).onclick = () => confirmDelete(s);
    $('#svGrp', side).onclick = (e) => openMenu(e.currentTarget, s);
    $$('[data-link]', side).forEach((b) => (b.onclick = () => api.openExternal(b.dataset.link)));
    $$('[data-act="watch"]', side).forEach((b) => (b.onclick = () => toggleWatch(s)));
    $('#svCopy', side).onclick = () => { navigator.clipboard.writeText(s.connect || s.address).then(() => toast('คัดลอกที่อยู่แล้ว'), () => toast('คัดลอกไม่สำเร็จ', 'err')); };
  }
  // เซิร์ฟส่วนตัวจากรายชื่อ: ใส่ IP ที่ได้จาก Discord ของเซิร์ฟ แล้วบันทึกเข้า "เซิร์ฟของฉัน" (ใช้ชื่อ/โลโก้ของเซิร์ฟนั้น)
  async function savePrivate(s, addr) {
    addr = String(addr || '').trim().replace(/^connect\s+/i, '');
    if (!directTarget(addr)) return toast('ที่อยู่ไม่ถูกต้อง ลองวาง IP:พอร์ต หรือลิงก์ cfx.re/join', 'err');
    const rec = {
      id: uid(), address: addr, connect: addr, display: addr.replace(/^https?:\/\//, ''), cfxId: s.id,
      name: s.name, category: '', desc: s.desc || '', bannerUrl: '', logoUrl: '', discord: s.discord || '',
      tone: 'auto', autoTone: null, logo: null, banner: s.banner || null, group: null,
      addedAt: Date.now(), lastPlayed: null, status: null,
    };
    if (s.icon) {
      try { rec.logo = (await api.fetchImage(s.icon)) || null; } catch {}
      if (rec.logo) rec.autoTone = await dominantColor(rec.logo);
    }
    state.servers.unshift(rec);
    persist();
    toast(`บันทึก ${s.name} ไว้ในเซิร์ฟของฉันแล้ว`);
    try { await refreshOne(rec, true); persist(); } catch {}
    drawBrowse();
    mineSide(rec);
  }

  function browseSkeleton() {
    return Array.from({ length: 6 }, () => '<div class="b-row skel"><div class="b-ic"></div><div class="b-main"><i></i><i></i></div><div></div><div></div></div>').join('');
  }

  function drawBrowse() {
    const B = state.browse, list = $('#bList');
    if (!list) return;
    $('#bRefresh')?.classList.toggle('spin', B.loading);
    if (B.error) {
      list.innerHTML = `<div class="empty"><div><div class="em-mark">${I.x}</div><b>โหลดรายชื่อเซิร์ฟไม่สำเร็จ</b>${esc(B.error)}<div style="margin-top:16px"><button class="btn" id="bRetry">${I.refresh} ลองใหม่</button></div></div></div>`;
      $('#bMore').innerHTML = '';
      $('#bRetry').onclick = () => loadBrowse(true, true);
      return;
    }
    const direct = directTarget(B.q);
    const bindDirect = () => {
      list.querySelector('[data-direct]')?.addEventListener('dblclick', () => joinDirect(direct));
      list.querySelector('[data-b="direct"]')?.addEventListener('click', () => joinDirect(direct));
      list.querySelector('[data-b="direct-save"]')?.addEventListener('click', () => addServerWith(direct));
    };
    if (B.loading && !B.items.length) {
      list.innerHTML = (direct ? directRow(direct) : '') + mineHTML(B.q) + secHead('pub', 'กำลังโหลดรายชื่อเซิร์ฟ... ครั้งแรกอาจใช้เวลาสักครู่') + browseSkeleton();
      bindMine(list);
      bindDirect();
      $('#bMore').innerHTML = '';
      return;
    }
    const t = B.updated ? new Date(B.updated * 1000).toLocaleTimeString(isEN() ? 'en-GB' : 'th-TH', { hour: '2-digit', minute: '2-digit' }) : '';
    const meta = `พบ ${fmtNum(B.total)} เซิร์ฟ · ผู้เล่นรวม ${fmtNum(B.players)} · อัปเดตเมื่อ ${t}`;
    list.innerHTML = (direct ? directRow(direct) : '') + mineHTML(B.q) + (B.items.length ? secHead('pub', meta) : '') + (B.items.length ? B.items.map(browseRow).join('') : direct ? '' : `<div class="empty"><div><div class="em-mark">${I.search}</div><b>ไม่พบเซิร์ฟที่ตรงกับคำค้น</b>ลองพิมพ์คำอื่น เปลี่ยนเป็น “ทั้งหมด” หรือวาง IP / ลิงก์ cfx.re ของเซิร์ฟ</div></div>`);
    bindDirect();
    bindMine(list);
    $('#bMore').innerHTML = B.items.length < B.total ? `<button class="btn" id="bMoreBtn" ${B.loading ? 'disabled' : ''}>แสดงเพิ่ม</button>` : '';
    $('#bMoreBtn')?.addEventListener('click', () => loadBrowse(false));
    list.querySelectorAll('.b-row[data-id]').forEach((row) => {
      const s = B.items.find((x) => x.id === row.dataset.id);
      if (!s) return;
      row.classList.toggle('sel', B.sel === s.id);
      row.querySelector('[data-b="private"]')?.addEventListener('click', (e) => { e.stopPropagation(); serverPopup(s); });
      const join = () => {
        warnNoFiveM();
        toast(`กำลังเข้า ${s.name}`, 'info');
        api.launch(targetOf(s), state.settings.after).catch(() => toast('เปิด FiveM ไม่สำเร็จ', 'err'));
      };
      const playBtn = row.querySelector('[data-b="play"]');
      if (playBtn) playBtn.onclick = (e) => { e.stopPropagation(); join(); };
      row.onclick = (e) => { if (!e.target.closest('button') && B.sel !== s.id) serverPopup(s); };
      row.ondblclick = (e) => { if (!e.target.closest('button') && !s.private) join(); };
      row.title = s.private ? '' : 'ดับเบิลคลิกเพื่อเข้าเซิร์ฟ';
    });
  }

  let browseSeq = 0;
  async function loadBrowse(reset, force = false) {
    const B = state.browse, seq = ++browseSeq;
    if (reset) { B.items = []; B.total = 0; }
    B.loading = true; B.error = null;
    drawBrowse();
    let r;
    try {
      const S = state.settings;
      r = await api.browse({ q: B.q, region: B.region, offset: B.items.length, limit: 50, force, hidePrivate: !!S.bHidePrivate, hideFull: !!S.bHideFull, sort: S.bSort === 'name' ? 'name' : 'players' });
    } catch (e) {
      r = { error: e.message };
    }
    if (seq !== browseSeq) return; // มีการค้นหาใหม่ระหว่างรอ
    B.loading = false;
    if (r.error) { B.error = r.error; drawBrowse(); return; }
    B.items = B.items.concat(r.items || []);
    B.total = r.total; B.players = r.players; B.updated = r.updated; B.loaded = true;
    drawBrowse();
  }



  function bindBrowse() {
    const B = state.browse;
    if (B.sel) setTimeout(() => {
      if (!B.sel) return;
      if (B.sel.startsWith('m:')) { const m = byId(B.sel.slice(2)); m ? mineSide(m) : closeServer(); }
      else if (B.selItem) serverPopup(B.selItem);
    }, 0);
    let t;
    const syncClear = () => $('#bSearch')?.classList.toggle('has', !!$('#bq')?.value);
    $('#bqClear').addEventListener('click', (e) => {
      e.preventDefault();
      if (!B.q) return;
      B.q = ''; $('#bq').value = ''; syncClear(); loadBrowse(true); $('#bq').focus();
    });
    $('#bq').addEventListener('input', syncClear);
    $('#bq').addEventListener('keydown', (e) => { if (e.key === 'Enter' && directTarget(B.q)) joinDirect(directTarget(B.q)); });
    $('#bq').addEventListener('input', (e) => {
      B.q = e.target.value;
      clearTimeout(t);
      t = setTimeout(() => loadBrowse(true), 300);
    });
    $$('#bRegion button').forEach((b) => b.addEventListener('click', () => {
      B.region = b.dataset.r;
      $$('#bRegion button').forEach((x) => x.classList.toggle('on', x === b));
      loadBrowse(true);
    }));
    $('#bRefresh').addEventListener('click', () => loadBrowse(true, true));
    $('#bFilter').addEventListener('click', (e) => openFilter(e.currentTarget));
    $('[data-act="dl-fivem2"]')?.addEventListener('click', () => api.openExternal(CFG.fivemDownloadUrl));
    $('[data-act="pick-fivem2"]')?.addEventListener('click', async () => {
      const r = await api.pickFiveM();
      if (r) { state.fivem = r; state.settings.fivemPath = r.path; persist(); render(); toast('ตั้งค่าตำแหน่ง FiveM แล้ว'); }
    });
    if (B.loaded) { drawBrowse(); if (Date.now() / 1000 - B.updated > 300) loadBrowse(true); }
    else loadBrowse(true);
  }

  // ---------- SETTINGS ----------
  function seg(name, opts, cur) {
    return `<div class="seg sm" data-setting="${name}">${opts.map(([v, l]) => `<button data-v="${v}" class="${String(cur) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  }
  // หน้าตั้งค่า: เมนูหมวดด้านซ้าย (แบบเมนูในเกม) + แผงเนื้อหาด้านขวา
  const SET_TABS = [
    ['general', 'ทั่วไป', 'ภาษา · หลังกดเล่น', 'sliders'],
    ['fivem', 'FiveM', 'ตำแหน่งเกม · ล้างแคช', 'gamepad'],
    ['perf', 'ประสิทธิภาพ', 'ทรัพยากร · การเคลื่อนไหว', 'bolt'],
    ['data', 'ข้อมูลของคุณ', 'สำรอง · กู้คืน · รีเซ็ต', 'folder'],
    ['about', 'เกี่ยวกับ', 'อัปเดต · ช่วยเหลือ', 'sparkle'],
  ];
  let setTab = 'general';
  const sect = (tab, title, desc, body, ic) => `<section class="sect" data-tab="${tab}"><div class="st-head"><i class="st-ic">${I[ic] || I.sliders}</i><div><h3>${title}</h3><p class="d">${desc}</p></div></div>${body}</section>`;
  function settingsHTML() {
    const S = state.settings;
    const nav = SET_TABS.map(([k, l, d, ic]) => `<button class="set-tab ${setTab === k ? 'on' : ''}" data-tab="${k}"><i class="st-ic">${I[ic]}</i><span><b>${l}</b><small>${d}</small></span></button>`).join('');
    return `
      <div class="set-wrap" data-on="${setTab}">
        <nav class="set-nav">
          <div class="b-sec"><div class="sh-ic">${I.sliders}</div><div class="sh-t"><p data-no-i18n>${isEN() ? 'Launcher<span>settings</span>' : 'ตั้งค่า<span>Launcher</span>'}</p><small>เลือกหมวดที่ต้องการ</small></div></div>
          <div class="set-tabs">${nav}</div>
          <div class="about"><div class="mark">${I.mark}</div><div><b>${esc(CFG.appName)} Launcher</b><small id="appInfo">เวอร์ชัน ${esc(state.version)}</small></div></div>
        </nav>
        <div class="set-body">
          ${sect('general', `ภาษา${isEN() ? '' : ' <span class="st-en" data-no-i18n>· Language</span>'}`, 'เลือกภาษาที่ใช้ในโปรแกรม', `<div data-no-i18n>${seg('lang', [['th', 'ไทย'], ['en', 'English']], S.lang)}</div>`, 'globe')}
          ${sect('general', 'หลังกดเล่น', 'ให้ Launcher ทำอะไรหลังเปิดเกม', seg('after', [['minimize', 'ย่อหน้าต่าง'], ['quit', 'ปิดโปรแกรม'], ['none', 'ไม่ทำอะไร']], S.after), 'play')}

          ${sect('fivem', 'ตำแหน่ง FiveM', 'โปรแกรมจะค้นหา FiveM.exe ให้อัตโนมัติ หากติดตั้งไว้ที่อื่นสามารถเลือกไฟล์เองได้', `
            <div class="path-box">${state.fivem.found ? '<span class="stc stc-ok"><i></i><span>พบแล้ว</span></span>' : '<span class="stc stc-full"><i></i><span>ไม่พบ</span></span>'}<code title="${esc(state.fivem.path)}">${esc(state.fivem.path || '—')}</code></div>
            ${state.fivem.found ? '' : '<div class="warn-box">ไม่พบ FiveM.exe — ตอนกดเล่นจะเปิดผ่านลิงก์ fivem:// แทน (ต้องติดตั้ง FiveM ก่อน)</div>'}
            <div class="btn-row">
              <button class="btn" data-act="pick-fivem">${I.folder} เลือกไฟล์ FiveM.exe</button>
              <button class="btn" data-act="dl-fivem">${I.ext} ดาวน์โหลด FiveM</button>
            </div>`, 'gamepad')}
          ${sect('fivem', 'ล้างแคช FiveM', 'แก้อาการเกมเด้ง โหลดเข้าเซิร์ฟค้าง หรือพื้นที่เต็ม — ลบ crashes, data/cache, server-cache และ server-cache-priv (ต้องปิด FiveM ก่อน)',
            '<div id="cacheBox"><div class="cache-list"><div class="cache-item none"><span class="nm">กำลังสแกน...</span></div></div></div>', 'trash')}

          ${sect('perf', 'การใช้ทรัพยากร', 'โปรแกรมจะทำงานเต็มที่เฉพาะตอนคุณกำลังใช้อยู่ — ไปเล่นเกมหรือเปิดโปรแกรมอื่น จะผ่อนแรงลงเอง และตอนย่อหน้าต่างจะหยุดรีเฟรชทั้งหมด คืนหน่วยความจำและยกความสำคัญของ CPU ให้เกม', `
            ${seg('perf', [['eco', 'ประหยัดสุด'], ['balanced', 'สมดุล (แนะนำ)'], ['full', 'เต็มที่']], S.perf)}
            <div class="metrics"><div class="metric">CPU <b id="mCpu">—</b></div><div class="metric">RAM <b id="mRam">—</b></div></div>`, 'bolt')}
          ${sect('perf', 'เอฟเฟกต์การเคลื่อนไหว', 'เต็ม = แอนิเมชันและแสงวิ่งบนปุ่มเล่นครบ / ลด = ปิดการเคลื่อนไหวทั้งหมด เหมาะกับคนที่เวียนหัวง่าย', seg('motion', [['full', 'เต็ม (ลื่นสุด)'], ['reduced', 'ลด']], S.motion), 'sparkle')}

          ${sect('data', 'ข้อมูลของคุณ', 'สำรองลิสต์เซิร์ฟเวอร์และการตั้งค่าไว้เป็นไฟล์ หรือย้ายไปเครื่องอื่น', `
            <div class="btn-row">
              <button class="btn" data-act="export">${I.download} ส่งออกข้อมูล</button>
              <button class="btn" data-act="import">${I.upload} นำเข้าข้อมูล</button>
              ${api.listBackups ? `<button class="btn" data-act="backups">${I.refresh} กู้คืนข้อมูลสำรอง</button>` : ''}
            </div>`, 'folder')}
          ${sect('data', 'รีเซ็ตทั้งหมด', 'ลบลิสต์เซิร์ฟเวอร์และการตั้งค่าทั้งหมด กลับเป็นเหมือนเพิ่งติดตั้ง (ไฟล์สำรองยังอยู่)', `<div class="btn-row"><button class="btn btn-danger" data-act="reset">${I.reset} รีเซ็ตทั้งหมด</button></div>`, 'reset')}

          ${sect('about', 'การอัปเดต', 'โปรแกรมจะตรวจหาเวอร์ชันใหม่ให้อัตโนมัติทุกครั้งที่เปิด', `
            <div class="btn-row" style="align-items:center">
              <button class="btn" data-act="check-update">${I.refresh} ตรวจหาเวอร์ชันใหม่</button>
              <span class="sub" id="updStatus" style="margin:0">เวอร์ชัน ${esc(state.version)}</span>
            </div>`, 'download')}
          ${CFG.updateRepo ? sect('about', 'ช่วยเหลือ', 'เจอปัญหา หรืออยากได้ฟีเจอร์อะไร บอกผู้พัฒนาได้ที่นี่ (ต้องมีบัญชี GitHub ฟรี)', `
            <div class="btn-row">
              <button class="btn" data-act="report" data-kind="bug">${I.x} แจ้งปัญหา</button>
              <button class="btn" data-act="report" data-kind="idea">${I.sparkle} เสนอฟีเจอร์</button>
              <button class="btn" data-act="website">${I.ext} เว็บไซต์</button>
            </div>`, 'ext') : ''}
        </div>
      </div>`;
  }

  async function loadCache() {
    const box = $('#cacheBox');
    if (!box) return;
    let r;
    try { r = await api.scanCache(); } catch { r = null; }
    if (!$('#cacheBox')) return;
    if (!r || !r.exists) {
      box.innerHTML = `<div class="cache-list"><div class="cache-item none"><span class="nm">${I.folder} ไม่พบโฟลเดอร์ FiveM.app</span><span></span><span class="sz">—</span></div></div>`;
      return;
    }
    const max = Math.max(1, ...r.items.map((i) => i.size || 0));
    box.innerHTML = `
      ${r.running ? '<div class="warn-box">FiveM กำลังเปิดอยู่ — ปิดเกมก่อนแล้วค่อยล้างแคช</div>' : ''}
      <div class="cache-list">${r.items.map((i) => `<div class="cache-item ${i.size ? '' : 'none'}"><span class="nm">${I.folder} ${esc(i.name)}</span><span class="track"><i style="width:${((i.size || 0) / max) * 100}%"></i></span><span class="sz">${fmtSize(i.size)}</span></div>`).join('')}</div>
      <div class="cache-foot"><span class="tot">รวม <b>${fmtSize(r.total)}</b></span><button class="btn btn-danger" data-act="clear-cache" ${r.total && !r.running ? '' : 'disabled'}>${I.trash} ล้างแคช</button></div>`;
    box.querySelector('[data-act="clear-cache"]')?.addEventListener('click', () => confirmClear(r));
  }

  function confirmClear(r) {
    const m = modal(`
      <div class="modal sm">
        <div class="modal-head"><h2>ล้างแคช FiveM?</h2><button class="x-btn" data-close>${I.x}</button></div>
        <div class="modal-body">
          <p class="confirm-text">จะลบ ${r.items.length} โฟลเดอร์นี้ใน FiveM.app — ไม่กระทบไฟล์เกม, การตั้งค่า หรือบัญชี</p>
          <div class="confirm-list">${r.items.map((i) => `<div><span>${esc(i.name)}</span><span>${fmtSize(i.size)}</span></div>`).join('')}</div>
          <p class="confirm-text">ครั้งถัดไปที่เข้าเซิร์ฟเวอร์ FiveM จะโหลดไฟล์ของเซิร์ฟเวอร์ใหม่ อาจใช้เวลานานขึ้นเล็กน้อย</p>
        </div>
        <div class="modal-foot"><button class="btn" data-close>ยกเลิก</button><button class="btn btn-danger" id="doClear">${I.trash} ล้าง ${fmtSize(r.total)}</button></div>
      </div>`);
    $('#doClear', m).addEventListener('click', async (e) => {
      e.currentTarget.disabled = true;
      const res = await api.clearCache();
      closeModal();
      if (res.ok) toast(`ล้างแคชเรียบร้อย คืนพื้นที่ ${fmtSize(res.freed)}`);
      else toast(res.error || 'ล้างแคชไม่สำเร็จ', 'err');
      loadCache();
    });
  }

  let metricsTimer = null;
  function startMetrics() {
    clearInterval(metricsTimer);
    const tick = async () => {
      if (state.page !== 'settings') return clearInterval(metricsTimer);
      try {
        const m = await api.metrics();
        if ($('#mCpu')) $('#mCpu').textContent = `${m.cpu.toFixed(1)}%`;
        if ($('#mRam')) $('#mRam').textContent = `${m.ram.toFixed(1)} MB`;
      } catch {}
    };
    tick();
    metricsTimer = setInterval(tick, 2000);
  }

  // ---------- binding ----------
  function bindView() {
    if (state.page === 'browse') { bindBrowse(); return; }
    if (state.page === 'settings') {
      $$('.set-tab').forEach((b) => (b.onclick = () => {
        setTab = b.dataset.tab;
        $('.set-wrap').dataset.on = setTab;
        $$('.set-tab').forEach((x) => x.classList.toggle('on', x === b));
        $('.set-body').scrollTop = 0;
      }));
      $$('[data-setting]').forEach((g) => g.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        const key = g.dataset.setting;
        const val = key === 'refresh' ? Number(b.dataset.v) : b.dataset.v;
        g.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
        setSetting(key, val, false);
      })));
      $('[data-act="pick-fivem"]').addEventListener('click', async () => {
        const r = await api.pickFiveM();
        if (r) { state.fivem = r; state.settings.fivemPath = r.path; persist(); render(); toast('ตั้งค่าตำแหน่ง FiveM แล้ว'); }
      });
      $('[data-act="dl-fivem"]').addEventListener('click', () => api.openExternal(CFG.fivemDownloadUrl));
      $('[data-act="export"]').addEventListener('click', async () => {
        if (await api.exportData({ app: 'fivem-launcher', version: 1, servers: state.servers, groups: state.groups, settings: state.settings })) toast('ส่งออกข้อมูลแล้ว');
      });
      $('[data-act="import"]').addEventListener('click', async () => {
        const d = await api.importData();
        if (!d) return;
        if (d.error || !Array.isArray(d.servers)) return toast('ไฟล์ไม่ถูกต้อง', 'err');
        state.servers = cleanServers(d.servers);
        state.groups = cleanGroups(d.groups, state.servers);
        state.settings = pickSettings(d.settings);
        applyPrefs(); persist(); render(); restartAuto(); refreshAll();
        toast(`นำเข้า ${d.servers.length} เซิร์ฟเวอร์แล้ว`);
      });
      $('[data-act="reset"]').addEventListener('click', confirmReset);
      $('[data-act="backups"]')?.addEventListener('click', openBackups);
      $('[data-act="check-update"]').addEventListener('click', () => checkUpdate(true));
      $$('[data-act="report"]').forEach((b) => b.addEventListener('click', () => openReport(b.dataset.kind)));
      $('[data-act="website"]')?.addEventListener('click', () => {
        const [o, r] = CFG.updateRepo.split('/');
        api.openExternal(`https://${o.toLowerCase()}.github.io/${r}/`);
      });
      loadCache();
      startMetrics();
    }
  }

  function confirmReset() {
    const m = modal(`
      <div class="modal sm">
        <div class="modal-head"><h2>รีเซ็ตทั้งหมด?</h2><button class="x-btn" data-close>${I.x}</button></div>
        <div class="modal-body"><p class="confirm-text">ลิสต์เซิร์ฟเวอร์ ${state.servers.length} รายการและการตั้งค่าทั้งหมดจะถูกลบ แนะนำให้ส่งออกข้อมูลเก็บไว้ก่อน</p>
          <p class="confirm-text" style="margin-top:12px">พิมพ์คำว่า <b style="color:var(--danger)" data-no-i18n>${isEN() ? 'RESET' : 'รีเซ็ต'}</b> เพื่อยืนยัน</p>
          <input class="input" id="resetWord" autocomplete="off" spellcheck="false" style="margin-top:8px"></div>
        <div class="modal-foot"><button class="btn" data-close>ยกเลิก</button><button class="btn btn-danger" id="doReset" disabled>${I.reset} รีเซ็ต</button></div>
      </div>`);
    const word = isEN() ? 'RESET' : 'รีเซ็ต';
    const inp = $('#resetWord', m), btn = $('#doReset', m);
    inp.addEventListener('input', () => { btn.disabled = inp.value.trim().toUpperCase() !== word.toUpperCase(); });
    setTimeout(() => inp.focus(), 60);
    btn.addEventListener('click', () => {
      if (inp.value.trim().toUpperCase() !== word.toUpperCase()) return;
      state.servers = [];
      state.groups = [];
      state.settings = { ...DEFAULT_SETTINGS };
      applyPrefs(); persist(); closeModal(); render(); restartAuto();
      toast('รีเซ็ตเรียบร้อย');
    });
  }

  function setSetting(key, val, rerender = true) {
    state.settings[key] = val;
    persist();
    applyPrefs();
    if (key === 'refresh' || key === 'perf') restartAuto();
    if (key === 'perf') api.setPerfMode(val);
    if (key === 'lang') {
      try { const u = new URL(location.href); u.searchParams.set('lang', val); history.replaceState(null, '', u); } catch {}
      try { sessionStorage.setItem('fl-page', state.page); } catch {}
      setTimeout(() => location.reload(), 450); // รอให้บันทึกการตั้งค่าก่อน
      return;
    }
    if (rerender) render();
  }

  function openFiveMOnly() { api.openFiveM(); toast('กำลังเปิด FiveM', 'info'); }

  const byId = (id) => state.servers.find((s) => s.id === id);

  // ---------- menu ----------
  function closeMenu() { $('#menuLayer').innerHTML = ''; }
  function showMenu(anchor, html, onPick, keep = false) {
    closeMenu();
    const r = anchor.getBoundingClientRect();
    const m = document.createElement('div');
    m.className = 'menu';
    m.innerHTML = html;
    $('#menuLayer').appendChild(m);
    // ไม่ให้เมนูลอยทับแถบหัวหน้าต่าง
    const tb = document.querySelector('.titlebar');
    const minTop = tb ? Math.max(10, tb.getBoundingClientRect().bottom + 4) : 10;
    const room = innerHeight - minTop - 10;
    const mw = m.offsetWidth, mh = Math.min(m.offsetHeight, room);
    let top = r.bottom + 8;
    if (top + mh > innerHeight - 10) top = r.top - mh - 8;
    top = Math.max(minTop, Math.min(top, innerHeight - mh - 10));
    m.style.maxHeight = `${room}px`;
    m.style.left = `${Math.max(10, Math.min(anchor.atX != null ? anchor.atX + 4 : r.right - mw, innerWidth - mw - 10))}px`;
    m.style.top = `${top}px`;
    m.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b || b.disabled) return;
      if (!keep) closeMenu();
      onPick(b.dataset.m, b, m);
    });
  }

  // จุดเมาส์ (คลิกขวา) ใช้แทนปุ่มสำหรับวางเมนู
  const atMouse = (e) => ({ atX: e.clientX, getBoundingClientRect: () => ({ top: e.clientY - 8, bottom: e.clientY - 8, left: e.clientX, right: e.clientX }) });
  // ตัวกรองรายชื่อ: เมนูเล็กค้างไว้ให้กดได้หลายอย่าง
  function openFilter(anchor) {
    const S = state.settings;
    const box = (on) => `<i class="fk ${on ? 'on' : ''}"></i>`;
    const html = () => `<div class="menu-label">ตัวกรอง</div>
      <button data-m="priv">${box(S.bHidePrivate)} ซ่อนเซิร์ฟส่วนตัว</button>
      <button data-m="full">${box(S.bHideFull)} ซ่อนเซิร์ฟเต็ม</button>
      <hr><div class="menu-label">เรียงตาม</div>
      <button data-m="players">${S.bSort !== 'name' ? I.check : '<i class="mk"></i>'} คนเยอะสุด</button>
      <button data-m="name">${S.bSort === 'name' ? I.check : '<i class="mk"></i>'} ชื่อ ก-ฮ</button>`;
    showMenu(anchor, html(), (k, b, m) => {
      if (k === 'priv') S.bHidePrivate = !S.bHidePrivate;
      if (k === 'full') S.bHideFull = !S.bHideFull;
      if (k === 'players' || k === 'name') S.bSort = k;
      persist();
      m.innerHTML = html();
      const n = $('#bFltN'); if (n) n.textContent = fltCount() || '';
      $('#bFilter')?.classList.toggle('on', !!fltCount());
      loadBrowse(true);
    }, true);
    $('.menu')?.classList.add('flt-menu');
  }
  function openMenu(anchor, s) {
    const cur = s.group && groupById(s.group) ? s.group : '';
    const mark = (on) => (on ? I.check : '<i class="mk"></i>');
    const groups = state.groups.length
      ? `<div class="menu-label">ย้ายไปกลุ่ม</div>
         ${state.groups.map((g) => `<button data-m="grp" data-g="${g.id}">${mark(cur === g.id)} <span data-no-i18n>${esc(g.name)}</span></button>`).join('')}
         ${cur ? `<button data-m="grp" data-g="">${mark(false)} ไม่ได้จัดกลุ่ม</button>` : ''}`
      : '';
    showMenu(anchor, `
      ${groups}
      <button data-m="newgrp">${I.folder2} กลุ่มใหม่...</button>
      <hr><button data-m="del" class="danger">${I.trash} ลบเซิร์ฟเวอร์</button>`, async (k, b) => {
      if (k === 'del') confirmDelete(s);
      if (k === 'grp') { s.group = b.dataset.g || null; persist(); updateHomeParts(); }
      if (k === 'newgrp') groupModal(null, s);
    });
  }
  document.addEventListener('mousedown', (e) => { if (!e.target.closest('.menu, .more-btn, .grp-more, #bFilter, #svGrp')) closeMenu(); });
  document.getElementById('scroll').addEventListener('wheel', closeMenu, { passive: true });
  window.addEventListener('resize', closeMenu);

  function confirmDelete(s) {
    const m = modal(`
      <div class="modal sm">
        <div class="modal-head"><h2>ลบเซิร์ฟเวอร์?</h2><button class="x-btn" data-close>${I.x}</button></div>
        <div class="modal-body"><p class="confirm-text">ลบ <b style="color:var(--ink)">${esc(s.name)}</b> ออกจากลิสต์ของคุณ</p></div>
        <div class="modal-foot"><button class="btn" data-close>ยกเลิก</button><button class="btn btn-danger" id="doDel">${I.trash} ลบ</button></div>
      </div>`);
    $('#doDel', m).addEventListener('click', () => {
      state.servers = state.servers.filter((x) => x.id !== s.id);
      if (state.watching[s.id]) { api.watchStop(s.id); delete state.watching[s.id]; }
      persist(); closeModal(); updateHomeParts();
      toast('ลบเซิร์ฟเวอร์แล้ว');
    });
  }

  // ---------- modal infra ----------
  function modal(html) {
    closeModal();
    const o = document.createElement('div');
    o.className = 'overlay';
    o.innerHTML = html;
    o.querySelector('.modal')?.classList.add('rp'); // ทุกหน้าต่างใช้กรอบ 2 ชั้นแบบเดียวกัน
    o.addEventListener('mousedown', (e) => { if (e.target === o) closeModal(); });
    o.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
    $('#modalRoot').appendChild(o);
    return o;
  }
  function closeModal() { $('#modalRoot').innerHTML = ''; }

  // ---------- add / edit server ----------
  // หน้าต่างเพิ่มเซิร์ฟ: เหลือแค่ช่องที่อยู่ + การ์ดตัวอย่าง (ชื่อ/โลโก้/แบนเนอร์ดึงจากเซิร์ฟเอง)
  function openServerModal(existing) {
    const d = existing
      ? { ...existing, fetched: existing.status ? { ...existing.status, name: existing.name } : null }
      : { address: '', name: '', logo: null, banner: null, autoTone: null, tone: 'auto', fetched: null };
    const m = modal(`
      <div class="modal add-pop rp">
        <div class="modal-head"><h2>${existing ? 'แก้ไขที่อยู่เซิร์ฟ' : 'เพิ่มเซิร์ฟเวอร์'}</h2><button class="x-btn" data-close>${I.x}</button></div>
        <div class="modal-body">
          <div class="field" style="margin-bottom:12px">
            <label>ที่อยู่เซิร์ฟเวอร์</label>
            <div class="row"><input class="input" id="fAddr" placeholder="เช่น 103.91.190.199:30120 หรือ cfx.re/join/abc123" value="${esc(d.address)}" spellcheck="false"><button class="btn" id="fCheck">${I.bolt} ตรวจสอบ</button></div>
            <div class="hint" id="fHint">ใส่ IP:พอร์ต, โดเมน หรือลิงก์ cfx.re/join แล้วกด “ตรวจสอบ”</div>
          </div>
          <div class="preview" id="fPreview"></div>
        </div>
        <div class="modal-foot"><button class="btn" data-close>ยกเลิก</button><button class="btn btn-dark" id="fSave">${I.check} บันทึก</button></div>
      </div>`);
    const el = (id) => $(`#${id}`, m);

    function renderPreview() {
      const f = d.fetched, logo = d.logoUrl || d.logo, banner = d.bannerUrl || d.banner;
      const t = d.tone && d.tone !== 'auto' ? d.tone : d.autoTone || '#2c2c3a';
      el('fPreview').setAttribute('style', toneStyle(t));
      el('fPreview').innerHTML = `
        <div class="pv-banner" style="${banner || logo ? `background:${t}` : ''}">${banner ? `<img src="${esc(banner)}" alt="">` : logo ? `<img class="blur-logo" src="${esc(logo)}" alt="">` : ''}</div>
        <div class="pv-row">
          <div class="pv-logo ${logo ? 'has' : ''}">${logo ? `<img src="${esc(logo)}" alt="">` : '?'}</div>
          <div class="pv-info">
            ${f?.name || d.name ? `<b data-no-i18n>${esc(f?.name || d.name)}</b>` : '<b>ชื่อเซิร์ฟเวอร์</b>'}
            ${f ? (f.online ? `<span class="pill pill-ok" style="margin-top:4px">ออนไลน์ · ${fmtNum(f.players)}/${fmtNum(f.max)}</span>` : '<span class="pill pill-off" style="margin-top:4px">ออฟไลน์</span>') : '<span>กด “ตรวจสอบ” เพื่อดึงชื่อ โลโก้ และแบนเนอร์</span>'}
          </div>
        </div>`;
    }

    async function check() {
      const addr = el('fAddr').value.trim();
      if (!addr) { el('fAddr').focus(); return; }
      const btn = el('fCheck');
      btn.disabled = true;
      btn.innerHTML = `${I.refresh} กำลังเช็ก...`;
      btn.querySelector('svg').style.animation = 'spin .8s linear infinite';
      const r = await api.query(addr, { withImages: true });
      btn.disabled = false;
      btn.innerHTML = `${I.bolt} ตรวจสอบ`;
      const hint = el('fHint');
      if (!r.ok) { hint.className = 'hint err'; hint.textContent = r.error || 'ตรวจสอบไม่สำเร็จ'; return; }
      d.fetched = r; d.connect = r.connect; d.display = r.display; d.checkedAddr = addr;
      if (r.online) {
        if (r.logo) d.logo = r.logo;
        if (r.banner) d.banner = r.banner;
        if (r.name) d.name = r.name;
        if (r.desc && !d.desc) d.desc = r.desc.slice(0, 300);
        if (d.logo) d.autoTone = await dominantColor(d.logo);
        hint.className = 'hint ok';
        hint.textContent = `ออนไลน์ · ${fmtNum(r.players)}/${fmtNum(r.max)} ผู้เล่น · ${r.ping} ms`;
      } else {
        hint.className = 'hint err';
        hint.textContent = 'ออฟไลน์ หรือเชื่อมต่อไม่ได้ (ยังบันทึกได้)';
      }
      renderPreview();
    }

    el('fCheck').addEventListener('click', check);
    el('fAddr').addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
    el('fSave').addEventListener('click', async () => {
      const address = el('fAddr').value.trim();
      if (!address) { el('fAddr').focus(); el('fHint').className = 'hint err'; el('fHint').textContent = 'กรุณาใส่ที่อยู่เซิร์ฟเวอร์'; return; }
      const checked = d.fetched && d.checkedAddr === address;
      const changed = !existing || address !== existing.address;
      const rec = {
        ...(existing || { id: uid(), category: '', desc: '', bannerUrl: '', logoUrl: '', discord: '', tone: 'auto', group: null, addedAt: Date.now(), lastPlayed: null }),
        address,
        connect: checked ? d.connect || address : changed ? address : existing.connect,
        display: checked ? d.display || address : changed ? address : existing.display,
        name: (checked && d.fetched.name) || (!changed && existing?.name) || d.name || address,
        desc: d.desc || existing?.desc || '',
        logo: d.logo || null, banner: d.banner || null, autoTone: d.autoTone || null,
        status: checked ? { online: d.fetched.online, players: d.fetched.players || 0, max: d.fetched.max || 0, ping: d.fetched.ping ?? null, checkedAt: Date.now() } : existing?.status || null,
      };
      if (existing) Object.assign(existing, rec);
      else state.servers.unshift(rec);
      persist();
      closeModal();
      updateHomeParts();
      toast(existing ? 'บันทึกแล้ว' : 'เพิ่มเซิร์ฟเวอร์แล้ว');
      if (!checked) { await refreshOne(existing || rec, true); persist(); updateHomeParts(); }
    });

    renderPreview();
    setTimeout(() => el('fAddr').focus(), 60);
  }

  // ---------- refresh ----------
  async function refreshOne(s, withImages = false) {
    const r = await api.query(s.address, { withImages: withImages || !s.logo });
    if (!r.ok) { s.status = { online: false, players: 0, max: 0, ping: null, checkedAt: Date.now() }; return; }
    s.connect = r.connect; s.display = r.display;
    s.status = { online: r.online, players: r.players || 0, max: r.max || 0, ping: r.ping ?? null, checkedAt: Date.now() };
    if (r.online) {
      if (r.logo && (!s.logo || withImages)) { s.logo = r.logo; if (!s.logoUrl) s.autoTone = (await dominantColor(r.logo)) || s.autoTone; }
      if (r.banner && !s.banner) s.banner = r.banner;
      if ((!s.name || s.name === s.address) && r.name) s.name = r.name;
    }
  }

  async function refreshAll(manual = false) {
    if (state.refreshing || !state.servers.length) {
      if (manual && !state.servers.length) toast('ยังไม่มีเซิร์ฟเวอร์ในลิสต์', 'err');
      return;
    }
    state.refreshing = true;
    $('#btnRefresh')?.classList.add('spin');
    const sig = () => state.servers.map((s) => [s.name, s.logo ? s.logo.length : 0, s.banner, s.autoTone].join('|')).join(';');
    const before = sig();
    const queue = [...state.servers];
    const worker = async () => { while (queue.length) { const s = queue.shift(); try { await refreshOne(s); } catch {} } };
    await Promise.all([worker(), worker(), worker(), worker()]);
    state.refreshing = false;
    const changed = sig() !== before;
    if (changed || manual) persist(); // ไม่เขียนดิสก์ทุกรอบ ถ้าแค่จำนวนผู้เล่นเปลี่ยน
    if (state.page !== 'settings' && !$('#modalRoot').children.length) (changed ? updateHomeParts() : patchAll());
    else $('#btnRefresh')?.classList.remove('spin');
    if (manual) toast('อัปเดตสถานะแล้ว');
  }

  let autoTimer = null;
  function restartAuto() {
    clearInterval(autoTimer);
    const sec = Number(state.settings.refresh) || 0;
    if (!sec) return;
    let tick = 0;
    autoTimer = setInterval(() => {
      const perf = state.settings.perf;
      tick++;
      if (!state.visible && perf !== 'full') return;            // ย่ออยู่ = หยุดรีเฟรช
      if (perf === 'eco' && !document.hasFocus()) return;       // ประหยัดสุด = รีเฟรชเฉพาะตอนโฟกัส
      if (perf === 'balanced' && !document.hasFocus() && tick % 4) return; // สมดุล = ช้าลง 4 เท่าตอนไปทำอย่างอื่น
      refreshAll();
    }, sec * 1000);
  }

  // ---------- กู้คืนข้อมูลสำรอง ----------
  async function openBackups() {
    let list = [];
    try { list = (await api.listBackups()) || []; } catch {}
    const when = (t) => { try { return new Date(t).toLocaleString(isEN() ? 'en-GB' : 'th-TH', { dateStyle: 'medium', timeStyle: 'short' }); } catch { return ''; } };
    const m = modal(`
      <div class="modal sm">
        <div class="modal-head"><h2>กู้คืนข้อมูลสำรอง</h2><button class="x-btn" data-close>${I.x}</button></div>
        <div class="modal-body">
          <p class="confirm-text">โปรแกรมจะสำรองลิสต์เดิมไว้อัตโนมัติทุกครั้งที่จำนวนเซิร์ฟลดลง (เก็บ 10 ครั้งล่าสุด) เลือกจุดที่ต้องการกู้คืน — การตั้งค่าปัจจุบันจะไม่เปลี่ยน</p>
          ${list.length ? `<div class="bk-list">${list.map((b) => `
            <button class="bk-item" data-bk="${esc(b.name)}">
              <span><b data-no-i18n>${esc(when(b.time))}</b><small data-no-i18n>${esc((b.names || []).join(', '))}${b.servers > (b.names || []).length ? ' …' : ''}</small></span>
              <span class="pill pill-mono">${b.servers} เซิร์ฟ</span>
            </button>`).join('')}</div>` : '<div class="empty" style="min-height:120px"><div><b>ยังไม่มีข้อมูลสำรอง</b>จะเริ่มสำรองเมื่อมีการลบเซิร์ฟออกจากลิสต์</div></div>'}
        </div>
        <div class="modal-foot"><button class="btn" data-close data-no-i18n>${isEN() ? 'Close' : 'ปิด'}</button></div>
      </div>`);
    $$('[data-bk]', m).forEach((btn) => btn.addEventListener('click', async () => {
      const d = await api.readBackup(btn.dataset.bk).catch(() => null);
      if (!d || !Array.isArray(d.servers)) return toast('อ่านไฟล์สำรองไม่ได้', 'err');
      state.servers = cleanServers(d.servers);
      state.groups = cleanGroups(d.groups, state.servers);
      persist(); closeModal(); go('home'); refreshAll();
      toast(`กู้คืน ${state.servers.length} เซิร์ฟเวอร์แล้ว`);
    }));
  }

  // ---------- play ----------
  function warnNoFiveM() { if (state.fivem && state.fivem.found === false) toast('ไม่พบ FiveM ในเครื่อง — กำลังลองเปิดผ่านลิงก์ fivem:// (ถ้าไม่ขึ้น ให้ติดตั้ง FiveM ก่อน)', 'warn'); }
  async function play(id) {
    const s = byId(id);
    if (!s) return;
    warnNoFiveM();
    s.lastPlayed = Date.now();
    persist();
    toast(`กำลังเข้า ${s.name}`, 'info');
    try {
      // ถ้ามีเซิร์ฟที่รอแจ้งเตือนอยู่ จะย่อหน้าต่างแทนการปิดโปรแกรม (ไม่งั้นการแจ้งเตือนจะหายไป)
      const after = state.settings.after === 'quit' && Object.keys(state.watching).length ? 'minimize' : state.settings.after;
      await api.launch(s.connect || s.address, after);
    } catch {
      toast('เปิด FiveM ไม่สำเร็จ', 'err');
    }
    if (state.page === 'home') setTimeout(updateHomeParts, 300);
  }

  // ---------- แจ้งปัญหา / เสนอฟีเจอร์ (GitHub Issues) ----------
  function openReport(kind) {
    const bug = kind === 'bug';
    const title = bug ? '[ปัญหา] ' : '[ฟีเจอร์] ';
    const body = bug
      ? `**เกิดอะไรขึ้น**\n\n\n**ทำอะไรก่อนเกิดปัญหา**\n1. \n\n**ภาพหน้าจอ (ถ้ามี)**\n\n\n---\nเวอร์ชัน: ${state.version}\nระบบ: ${state.os}\nภาษา: ${state.settings.lang}`
      : `**อยากได้อะไร**\n\n\n**ใช้ทำอะไร / ช่วยอะไร**\n\n\n---\nเวอร์ชัน: ${state.version}`;
    api.openExternal(`https://github.com/${CFG.updateRepo}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`);
  }

  // ---------- auto update ----------
  async function checkUpdate(manual = false) {
    const st = $('#updStatus');
    if (!CFG.updateRepo) {
      if (manual && st) st.textContent = 'ยังไม่ได้ตั้งค่าที่อยู่สำหรับอัปเดต';
      return;
    }
    if (manual && st) st.textContent = 'กำลังตรวจสอบ...';
    let r;
    try { r = await api.checkUpdate(CFG.updateRepo); } catch { r = null; }
    if (!r || r.error) {
      if (manual && st) st.textContent = 'ตรวจหาอัปเดตไม่สำเร็จ';
      return;
    }
    if (!r.available) {
      if (manual && st) st.textContent = 'คุณใช้เวอร์ชันล่าสุดแล้ว';
      return;
    }
    state.update = r;
    if (st) st.textContent = `มีเวอร์ชันใหม่ ${r.version}`;
    showUpdateBar(r);
  }

  function showUpdateBar(r) {
    $('#updBar')?.remove();
    const el = document.createElement('div');
    el.className = 'foot-upd';
    el.id = 'updBar';
    el.innerHTML = `<span class="fu-ic">${I.download}</span><span class="fu-t">มีเวอร์ชันใหม่ ${esc(r.version)}</span>
      <button class="btn btn-sm btn-dark" data-u="go">อัปเดตเลย</button><button class="btn btn-sm" data-u="later">ภายหลัง</button>`;
    $('.foot').insertBefore(el, $('#btnDiscord'));
    el.querySelector('[data-u="later"]').onclick = () => el.remove();
    el.querySelector('[data-u="go"]').onclick = async () => {
      el.querySelectorAll('button').forEach((b) => (b.disabled = true));
      el.querySelector('.fu-t').textContent = 'กำลังดาวน์โหลดอัปเดต...';
      try {
        await api.installUpdate(r.url, r.version);
      } catch {
        el.querySelector('.fu-t').textContent = 'ดาวน์โหลดอัปเดตไม่สำเร็จ';
        el.querySelectorAll('button').forEach((b) => (b.disabled = false));
      }
    };
  }

  // ---------- global ----------
  function bindGlobal() {
    $$('.nav-btn').forEach((b) => b.addEventListener('click', () => { if (state.page !== b.dataset.page) go(b.dataset.page); }));
    $('.brand')?.addEventListener('click', () => { if (state.page !== 'browse') go('browse'); });
    $('#btnMin').addEventListener('click', () => api.minimize());
    $('#btnFiveM').addEventListener('click', () => { warnNoFiveM(); openFiveMOnly(); });
    $('#btnClose').addEventListener('click', () => api.close());
    $('.titlebar').addEventListener('dblclick', (e) => { if (!e.target.closest('button')) api.toggleMax(); });
    $('#btnDiscord').addEventListener('click', () => api.openExternal(CFG.discordUrl));
    $('#btnDiscord').hidden = !CFG.discordUrl;
    $('#brandName').innerHTML = `${esc(CFG.appName)}<span>${esc(CFG.appTag || 'launcher')}</span>`;
    $('#brandName').setAttribute('data-no-i18n', '');
    $('#brandTag').firstChild.textContent = `${CFG.appTag} `;
    if (CFG.madeBy) $('#madeBy').textContent = CFG.madeBy;
    else $('.made').innerHTML = `<b>${esc(CFG.appName)} Launcher</b> <span style="opacity:.6">v${esc(state.version)}</span>`;

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { if ($('#modalRoot').innerHTML) closeModal(); else if (state.browse.sel) closeServer(); closeMenu(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (state.page === 'settings') go('browse');
        setTimeout(() => { const q = $('#q') || $('#bq'); q?.focus(); q?.select(); }, 30);
      }
      if (e.key === 'F5') { e.preventDefault(); if (state.page === 'browse') loadBrowse(true, true); }
    });
    api.onVisibility?.((v) => { state.visible = v.visible; if (v.visible) refreshAll(); });
    document.addEventListener('visibilitychange', () => { state.visible = !document.hidden; });
    const setIdle = (idle) => document.documentElement.classList.toggle('idle', idle && state.settings.perf !== 'full');
    window.addEventListener('blur', () => setIdle(true));
    window.addEventListener('focus', () => setIdle(false));
  }

  async function init() {
    const S = window.Splash || { step() {}, done() {} };
    S.step(1, 30);
    const saved = await api.load();
    if (saved) {
      state.servers = cleanServers(saved.servers);
      state.groups = cleanGroups(saved.groups, state.servers);
      state.settings = pickSettings(saved.settings);
      savedCount = Array.isArray(saved.servers) ? saved.servers.length : 0;
    }
    applyPrefs();
    try { const inf = await api.info(); state.version = inf.version || ''; state.os = inf.os || ''; } catch {}
    try { (await api.watchList?.() || []).forEach((w) => (state.watching[w.id] = w.kind)); } catch {}
    S.step(2, 55);
    try { state.fivem = await api.fivemStatus(state.settings.fivemPath); } catch {}
    api.setPerfMode?.(state.settings.perf);
    bindGlobal();
    let startPage = 'browse';
    try { startPage = sessionStorage.getItem('fl-page') || 'browse'; sessionStorage.removeItem('fl-page'); } catch {}
    S.step(3, 75);
    go(startPage === 'settings' ? 'settings' : 'browse');
    restartAuto();
    refreshAll();
    // รอรายชื่อเซิร์ฟสักครู่ (ถ้าเน็ตช้า หน้ารายชื่อจะโชว์โครงโหลดต่อเอง) แล้วปิดหน้า loading
    await new Promise((r) => { const t0 = Date.now(); const w = () => (state.browse.loaded || state.browse.error || Date.now() - t0 > 2500 ? r() : setTimeout(w, 80)); w(); });
    S.done();
    setTimeout(() => checkUpdate(false), 4000);
  }

  init();
})();
