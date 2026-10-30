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
    users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M21.5 20a6.5 6.5 0 0 0-4-6"/></svg>',
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>',
    refresh: '<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18" cy="12" r="1.3" fill="currentColor"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="m7 7 10 10M17 7 7 17"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    signal: '<svg viewBox="0 0 24 24"><path d="M5 19v-3M10 19v-6M15 19v-9M20 19V6"/></svg>',
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
    chev: '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
    grip: '<svg viewBox="0 0 24 24"><circle cx="9" cy="6" r="1.2" fill="currentColor"/><circle cx="15" cy="6" r="1.2" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><circle cx="9" cy="18" r="1.2" fill="currentColor"/><circle cx="15" cy="18" r="1.2" fill="currentColor"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24"><path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7Z" fill="currentColor" stroke="none"/></svg>',
    mark: '<svg viewBox="0 0 40 40"><path d="M13 30 21.2 9.5c.5-1.3 2.3-1.3 2.8 0L32 30" fill="none" stroke="currentColor" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 30h7.5" stroke="currentColor" stroke-width="4.4" stroke-linecap="round"/><path d="M22.6 21.5v8.5" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg>',
  };
  const SQUIGGLE = '<svg viewBox="0 0 120 12" preserveAspectRatio="none"><path d="M2 7c8-6 14 4 22 0s14-6 22 0 14 4 22 0 14-6 22 0 14 4 22 0"/></svg>';

  // ---------- state ----------
  const DEFAULT_SETTINGS = { lang: null, theme: 'mono', after: 'minimize', refresh: 15, perf: 'balanced', cursor: 'theme', motion: 'full', fivemPath: null };
  const state = {
    servers: [],
    groups: [],
    settings: { ...DEFAULT_SETTINGS },
    page: 'home',
    filter: 'all',
    q: '',
    refreshing: false,
    fivem: { path: '', found: false },
    visible: true,
    version: '',
    update: null,
    watching: {},
    os: '',
    browse: { q: '', region: 'th', items: [], total: 0, players: 0, updated: 0, loading: false, error: null, loaded: false },
  };

  function persist() {
    api.save({ version: 1, servers: state.servers, groups: state.groups, settings: state.settings });
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
        fav: !!x.fav, group: typeof x.group === 'string' ? x.group : null, lastPlayed: Number(x.lastPlayed) || null, addedAt: Number(x.addedAt) || Date.now(),
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
  function toast(msg, type = 'ok') {
    const el = document.createElement('div');
    el.className = `toast ${type === 'err' ? 'err' : ''}`;
    el.innerHTML = `<span class="ti">${type === 'err' ? I.x : I.check}</span><span>${esc(msg)}</span>`;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 2600);
  }

  // ---------- theme / prefs ----------
  function applyPrefs() {
    const r = document.documentElement;
    r.dataset.theme = state.settings.theme;
    r.dataset.motion = state.settings.motion;
    r.dataset.cursor = state.settings.cursor;
    r.dataset.perf = state.settings.perf;
    if (!state.settings.lang) state.settings.lang = window.I18N?.detect() || 'th';
    window.I18N?.set(state.settings.lang);
    api.setLang?.(state.settings.lang);
  }
  const isEN = () => state.settings.lang === 'en';

  // ---------- navigation ----------
  function go(page) {
    closeMenu();
    closeModal();
    state.page = page;
    $$('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.page === page));
    render(true);
    $('#scroll').scrollTop = 0;
  }

  function render(animate = false) {
    const v = $('#view');
    if (state.page === 'settings') v.innerHTML = settingsHTML();
    else if (state.page === 'browse') v.innerHTML = browseHTML();
    else v.innerHTML = homeHTML(state.page === 'favorites');
    v.classList.toggle('enter', animate);
    if (animate) setTimeout(() => v.classList.remove('enter'), 700);
    bindView();
  }

  // ---------- HOME ----------
  function featured() {
    if (!state.servers.length) return null;
    const played = state.servers.filter((s) => s.lastPlayed).sort((a, b) => b.lastPlayed - a.lastPlayed);
    return played[0] || state.servers[0];
  }

  function heroHTML() {
    const s = featured();
    if (!s) {
      return `<section class="hero">
        <div>
          <span class="badge">เริ่มกันเลย ✦</span>
          <h2 class="hero-title" style="text-transform:none">ยังไม่มีเซิร์ฟเวอร์</h2>
          <p class="hero-desc">เพิ่มเซิร์ฟเวอร์แรกของคุณ แล้วเข้าเกมได้ในคลิกเดียว</p>
          <div class="hero-actions">
            <button class="btn btn-dark btn-lg" data-act="add">${I.plus} เพิ่มเซิร์ฟเวอร์</button>
            <button class="btn btn-lg" data-act="open-fivem">เปิด FiveM เฉย ๆ</button>
          </div>
        </div>
        <div class="hero-art"><div class="tilt-card"><span class="ph-mark">${I.mark.replace('<svg', '<svg style="width:74px;height:74px"')}</span></div></div>
      </section>`;
    }
    const t = toneOf(s), S = st(s), p = loadPct(s), logo = logoOf(s), banner = bannerOf(s);
    return `<section class="hero" style="${toneStyle(t)}">
      <div style="min-width:0">
        <span class="badge soft">เซิร์ฟของคุณ ✦</span>
        <h2 class="hero-title${[...String(s.name)].length > 34 ? ' xlong' : [...String(s.name)].length > 20 ? ' long' : ''}" data-no-i18n title="${esc(s.name)}">${esc(s.name)}</h2>
        <div class="hero-chips">
          <span class="js-st">${S.online ? '<span class="pill pill-ok">ออนไลน์</span>' : '<span class="pill pill-off">ออฟไลน์</span>'}</span>
          <span class="js-ping">${S.ping != null ? `<span class="pill pill-mono">${I.signal} ${S.ping}ms</span>` : ''}</span>
          ${s.category ? `<span class="pill pill-tone">${esc(s.category)}</span>` : ''}
        </div>
        <div class="players" style="margin:4px 0 8px"><span>${I.user}<b class="js-pl">${fmtNum(S.players)}</b> / <span class="js-max">${fmtNum(S.max)}</span> ผู้เล่น</span><span class="pct js-pct" style="color:${pctColor(p)}">${p}%</span></div>
        <div class="bar" style="max-width:420px"><i class="js-bar" style="width:${p}%;--barc:${barColor(p)}"></i></div>
        <div class="hero-actions">
          <button class="btn btn-tone btn-lg" data-act="play" data-id="${s.id}">${I.play} เล่นเลย</button>
          <button class="btn btn-lg" data-act="open-fivem">เปิด FiveM เฉย ๆ</button>
        </div>
      </div>
      <div class="hero-art">
        <div class="tilt-card" style="background:linear-gradient(135deg, ${shade(t, 0.35)}, ${t})">
          ${banner ? `<img class="bn" src="${esc(banner)}" alt="">` : logo ? `<img class="bn" src="${esc(logo)}" alt="" style="filter:blur(28px) saturate(1.4);transform:scale(1.6)">` : ''}
        </div>
        <div class="hero-logo" style="background:${t}">${logo ? `<img src="${esc(logo)}" alt="">` : `<div style="display:grid;place-items:center;height:100%;font:800 34px Prompt,'Segoe UI',sans-serif;color:var(--tone-ink)">${esc(initial(s.name))}</div>`}</div>
      </div>
    </section>`;
  }

  function statsHTML() {
    const online = state.servers.filter((s) => st(s).online).length;
    const total = state.servers.length;
    const players = state.servers.reduce((a, s) => a + (st(s).online ? st(s).players : 0), 0);
    return `<div class="stats">
      <div class="stat stat-dark">
        <span class="ico">${I.bolt}</span>
        <span class="lbl">ออนไลน์ตอนนี้</span>
        <span class="num" id="statOnline">${online}<small>/${total}</small></span>
        <span class="cap">${total ? `จาก ${total} เซิร์ฟในลิสต์ของคุณ` : 'ยังว่างอยู่เลย เพิ่มเซิร์ฟกัน'}</span>
      </div>
      <div class="stat stat-line">
        <span class="ico">${I.users}</span>
        <span class="lbl">ผู้เล่นรวม</span>
        <span class="num" id="statPlayers" data-count="${players}">${fmtNum(players)}</span>
        <span class="cap">คนกำลังเล่นอยู่ในลิสต์ของคุณ</span>
      </div>
    </div>`;
  }

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

  function cardHTML(s, i) {
    const t = toneOf(s), S = st(s), p = loadPct(s), logo = logoOf(s), banner = bannerOf(s);
    const full = S.online && S.max && S.players >= S.max;
    return `<article class="card ${S.online ? '' : 'offline'}" ${state.page === 'home' ? 'draggable="true"' : ''} style="${toneStyle(t)};--i:${i}" data-id="${s.id}" data-bell="${bellKind(s)}|${state.watching[s.id] || ''}">
      <div class="banner">
        ${banner ? `<img class="bimg" src="${esc(banner)}" alt="">` : logo ? `<img class="blur-logo" src="${esc(logo)}" alt="">` : ''}
        <span class="js-st">${S.online ? '<span class="pill pill-ok">ออนไลน์</span>' : '<span class="pill pill-off">ออฟไลน์</span>'}</span>
        <button class="fav-btn ${s.fav ? 'on' : ''}" data-act="fav" data-id="${s.id}" title="เซิร์ฟโปรด">${I.heart}</button>
      </div>
      <div class="logo">${logo ? `<img src="${esc(logo)}" alt="">` : esc(initial(s.name))}</div>
      <div class="card-body">
        <div class="card-name" title="${esc(s.name)}" data-no-i18n>${esc(s.name)}</div>
        ${s.desc ? `<div class="card-sub desc" title="${esc(s.desc)}" data-no-i18n>${esc(s.desc)}</div>` : `<div class="card-sub" data-no-i18n>${esc(s.display || s.address)}</div>`}
        <div class="players"><span>${I.user}<b class="js-pl">${fmtNum(S.players)}</b> / <span class="js-max">${fmtNum(S.max)}</span> ผู้เล่น</span><span class="pct js-pct" style="color:${pctColor(p)}">${full ? 'เต็ม · ' : ''}${p}%</span></div>
        <div class="bar"><i class="js-bar" style="width:${p}%;--barc:${barColor(p)}"></i></div>
        <div class="chips">
          <span class="pill pill-mono js-ping">${I.signal} ${S.ping != null ? `${S.ping}ms` : '—'}</span>
          ${s.category ? `<span class="pill pill-tone">${esc(s.category)}</span>` : ''}
          ${bellHTML(s)}
        </div>
        <div class="card-actions">
          <button class="btn btn-tone" data-act="play" data-id="${s.id}">${I.play} ${S.online ? 'เล่น' : 'ลองเข้า'}</button>
          <button class="more-btn" data-act="more" data-id="${s.id}" title="เพิ่มเติม">${I.more}</button>
        </div>
      </div>
    </article>`;
  }

  function filtered(favOnly) {
    const q = state.q.trim().toLowerCase();
    return state.servers.filter((s) => {
      if (favOnly && !s.fav) return false;
      if (!favOnly && state.filter === 'online' && !st(s).online) return false;
      if (!favOnly && state.filter === 'fav' && !s.fav) return false;
      if (q && ![s.name, s.display, s.address, s.category, s.desc].join(' ').toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function gridHTML(favOnly) {
    const list = filtered(favOnly);
    if (!state.servers.length) {
      return `<div class="empty"><div><div class="em-mark">${I.mark}</div><b>ลิสต์ยังว่างอยู่</b>กด “เพิ่มเซิร์ฟเวอร์” เพื่อเริ่มต้น หรือหาเซิร์ฟจากรายชื่อของ FiveM<div style="margin-top:16px"><button class="btn" data-act="go-browse">${I.search} ค้นหาเซิร์ฟ</button></div></div></div>`;
    }
    if (!list.length) {
      return `<div class="empty"><div><div class="em-mark">${favOnly ? I.heart : I.search}</div><b>${favOnly && !state.q ? 'ยังไม่มีเซิร์ฟโปรด' : 'ไม่พบเซิร์ฟเวอร์'}</b>${favOnly && !state.q ? 'กดหัวใจบนการ์ดเพื่อเพิ่มเข้าลิสต์นี้' : 'ลองเปลี่ยนคำค้นหรือตัวกรองดู'}</div></div>`;
    }
    if (favOnly || !state.groups.length) return `<div class="grid" data-gid="">${list.map(cardHTML).join('')}</div>`;
    // แบ่งตามกลุ่ม
    const ids = new Set(state.groups.map((g) => g.id));
    const searching = !!state.q.trim() || state.filter !== 'all';
    let i = 0;
    const section = (gid, name, items, g) => {
      if (searching && !items.length) return '';
      const cards = items.map((s) => cardHTML(s, i++)).join('');
      return `<section class="grp ${g?.collapsed ? 'collapsed' : ''}" data-gid="${gid}">
        <div class="grp-head" data-gid="${gid}">
          ${g ? `<button class="grp-tog" data-grp="toggle" data-gid="${gid}" title="ย่อ/ขยายกลุ่ม">${I.chev}</button>` : ''}
          <span class="grp-name" ${g ? 'data-no-i18n' : ''}>${esc(name)}</span><span class="grp-count">${items.length}</span>
          ${g ? `<button class="grp-more" data-grp="menu" data-gid="${gid}" title="จัดการกลุ่ม">${I.more}</button>` : ''}
        </div>
        <div class="grid" data-gid="${gid}">${cards || '<div class="grp-empty">ลากการ์ดเซิร์ฟมาวางที่นี่</div>'}</div>
      </section>`;
    };
    return state.groups.map((g) => section(g.id, g.name, list.filter((s) => s.group === g.id), g)).join('')
      + section('', 'ไม่ได้จัดกลุ่ม', list.filter((s) => !s.group || !ids.has(s.group)), null);
  }

  // ---------- กลุ่ม & ลากเรียง ----------
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

  // ย้ายเซิร์ฟ id ไปไว้ก่อน/หลัง targetId (หรือท้ายกลุ่ม gid ถ้าไม่มี target)
  function moveServer(id, targetId, after, gid) {
    const s = byId(id);
    endDrag();
    if (!s || id === targetId) return;
    const arr = state.servers.filter((x) => x !== s);
    if (targetId) {
      const t = byId(targetId);
      s.group = t.group && groupById(t.group) ? t.group : null;
      const ti = arr.indexOf(t);
      arr.splice(after ? ti + 1 : ti, 0, s);
    } else {
      s.group = gid || null;
      let last = -1;
      arr.forEach((x, i) => { if ((x.group && groupById(x.group) ? x.group : '') === (gid || '')) last = i; });
      arr.splice(last + 1, 0, s);
    }
    state.servers = arr;
    persist();
    updateHomeParts();
  }

  let dragId = null;
  // จบสถานะลาก (ต้องเรียกเองด้วย เพราะการ์ดที่ถูกลากอาจถูกวาดใหม่ก่อน dragend จะมาถึง)
  function endDrag() {
    dragId = null; dragY = -1;
    document.body.classList.remove('dnd');
    $$('.dragging').forEach((e) => e.classList.remove('dragging'));
    clearDropMarks();
  }
  document.addEventListener('dragend', endDrag, true);
  document.addEventListener('drop', () => setTimeout(endDrag, 0), true);
  // เลื่อนหน้าอัตโนมัติเมื่อลากการ์ดไปใกล้ขอบบน/ล่าง (ระหว่างลากบน Windows ใช้ล้อเมาส์ไม่ได้)
  let dragY = -1, autoScrolling = false;
  function autoScrollStep() {
    const sc = $('#scroll');
    if (!dragId || !sc || dragY < 0) { autoScrolling = false; return; }
    const r = sc.getBoundingClientRect(), edge = 90;
    let v = 0;
    if (dragY < r.top + edge) v = -Math.ceil(((r.top + edge - dragY) / edge) * 22);
    else if (dragY > r.bottom - edge) v = Math.ceil(((dragY - (r.bottom - edge)) / edge) * 22);
    if (!v) { autoScrolling = false; return; }
    sc.scrollTop += Math.max(-30, Math.min(30, v));
    requestAnimationFrame(autoScrollStep);
  }
  document.addEventListener('dragover', (e) => {
    if (!dragId) return;
    dragY = e.clientY;
    if (!autoScrolling) { autoScrolling = true; requestAnimationFrame(autoScrollStep); }
  }, true);
  function clearDropMarks() {
    $$('.drop-before, .drop-after, .drop-into').forEach((e) => e.classList.remove('drop-before', 'drop-after', 'drop-into'));
  }
  function bindDnD() {
    $$('.card[draggable]').forEach((c) => {
      c.addEventListener('dragstart', (e) => {
        if (e.target.closest('button')) { e.preventDefault(); return; }
        dragId = c.dataset.id;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/x-fl-server', dragId);
        c.style.transform = '';
        document.body.classList.add('dnd');
        setTimeout(() => c.classList.add('dragging'), 0);
      });
      c.addEventListener('dragend', () => {
        dragId = null;
        c.classList.remove('dragging');
        document.body.classList.remove('dnd');
        clearDropMarks();
      });
      c.addEventListener('dragover', (e) => {
        if (!dragId || dragId === c.dataset.id) return;
        e.preventDefault(); e.stopPropagation();
        const r = c.getBoundingClientRect();
        const after = e.clientX > r.left + r.width / 2;
        clearDropMarks();
        c.classList.add(after ? 'drop-after' : 'drop-before');
      });
      c.addEventListener('drop', (e) => {
        if (!dragId) return;
        e.preventDefault(); e.stopPropagation();
        const after = c.classList.contains('drop-after');
        const id = dragId;
        clearDropMarks();
        moveServer(id, c.dataset.id, after);
      });
    });
    $$('.grid[data-gid], .grp-head').forEach((z) => {
      z.addEventListener('dragover', (e) => {
        if (!dragId) return;
        e.preventDefault();
        clearDropMarks();
        (z.classList.contains('grid') ? z : z.nextElementSibling)?.classList.add('drop-into');
      });
      z.addEventListener('drop', (e) => {
        if (!dragId) return;
        e.preventDefault();
        const id = dragId;
        clearDropMarks();
        moveServer(id, null, true, z.dataset.gid || '');
      });
    });
    $$('[data-grp="toggle"]').forEach((b) => (b.onclick = () => {
      const g = groupById(b.dataset.gid);
      if (!g) return;
      g.collapsed = !g.collapsed;
      b.closest('.grp').classList.toggle('collapsed', g.collapsed);
      persist();
    }));
    $$('[data-grp="menu"]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); const g = groupById(b.dataset.gid); if (g) groupMenu(b, g); }));
  }

  function homeHTML(favOnly) {
    const title = favOnly
      ? (isEN() ? `<h1 class="h1">My <span class="sq">favorite${SQUIGGLE}</span> servers</h1>` : `<h1 class="h1">เซิร์ฟ<span class="sq">โปรด${SQUIGGLE}</span>ของฉัน</h1>`) + '<p class="sub">รวมเซิร์ฟที่คุณกดหัวใจไว้</p>'
      : (isEN() ? `<h1 class="h1">Ready to <span class="sq">roll${SQUIGGLE}</span>?</h1>` : `<h1 class="h1">พร้อม<span class="sq">ลุย${SQUIGGLE}</span>หรือยัง?</h1>`) + '<p class="sub">เลือกเซิร์ฟที่ชอบ แล้วกดเล่นได้เลย</p>';
    return `
      <div class="page-head"><div>${title}</div><button class="btn btn-dark btn-lg" data-act="add">${I.plus} เพิ่มเซิร์ฟเวอร์</button></div>
      ${favOnly ? '' : `<div class="hero-grid">${heroHTML()}${statsHTML()}</div>`}
      <div class="toolbar">
        <label class="search">${I.search}<input id="q" placeholder="หาเซิร์ฟเวอร์..." value="${esc(state.q)}" spellcheck="false"><span class="kbd">Ctrl F</span></label>
        ${favOnly ? '' : `<div class="seg" id="filters">
          <button data-f="all" class="${state.filter === 'all' ? 'on' : ''}">ทั้งหมด</button>
          <button data-f="online" class="${state.filter === 'online' ? 'on' : ''}">ออนไลน์</button>
          <button data-f="fav" class="${state.filter === 'fav' ? 'on' : ''}">โปรด</button>
        </div>`}
        ${favOnly ? '' : `<button class="icon-btn" data-act="new-group" title="สร้างกลุ่ม">${I.folder2}</button>`}
        <button class="icon-btn ${state.refreshing ? 'spin' : ''}" data-act="refresh" id="btnRefresh" title="รีเฟรชสถานะ">${I.refresh}</button>
      </div>
      <div id="gridWrap">${gridHTML(favOnly)}</div>`;
  }

  // อัปเดตเฉพาะตัวเลข/สถานะ โดยไม่สร้างการ์ดใหม่ (ไม่โหลดรูป/GIF ซ้ำ ไม่กระตุก)
  function patchStatus(root, s, isCard) {
    const S = st(s), p = loadPct(s), full = S.online && S.max && S.players >= S.max;
    const set = (sel, fn) => { const el = root.querySelector(sel); if (el) fn(el); };
    set('.js-st', (el) => { el.innerHTML = S.online ? '<span class="pill pill-ok">ออนไลน์</span>' : '<span class="pill pill-off">ออฟไลน์</span>'; });
    set('.js-pl', (el) => { el.textContent = fmtNum(S.players); });
    set('.js-max', (el) => { el.textContent = fmtNum(S.max); });
    set('.js-pct', (el) => { el.textContent = `${isCard && full ? 'เต็ม · ' : ''}${p}%`; el.style.color = pctColor(p); });
    set('.js-bar', (el) => { el.style.width = `${p}%`; el.style.setProperty('--barc', barColor(p)); });
    set('.js-ping', (el) => { el.innerHTML = isCard ? `${I.signal} ${S.ping != null ? `${S.ping}ms` : '—'}` : S.ping != null ? `<span class="pill pill-mono">${I.signal} ${S.ping}ms</span>` : ''; });
    if (isCard) root.classList.toggle('offline', !S.online);
  }
  function patchAll() {
    if (state.page === 'settings' || state.page === 'browse') return;
    const cards = $$('.card');
    const fav = state.page === 'favorites';
    const want = filtered(fav).map((s) => s.id).join(',');
    const have = cards.map((c) => c.dataset.id).join(',');
    const f = featured();
    const heroId = $('.hero [data-act="play"]')?.dataset.id || null;
    if (want !== have || (state.page === 'home' && (f?.id || null) !== heroId)) return updateHomeParts();
    if (cards.some((c) => { const s = byId(c.dataset.id); return s && c.dataset.bell !== `${bellKind(s)}|${state.watching[s.id] || ''}`; })) return updateHomeParts();
    cards.forEach((c) => patchStatus(c, byId(c.dataset.id), true));
    const hero = $('.hero');
    if (hero && f) patchStatus(hero, f, false);
    const online = state.servers.filter((s) => st(s).online).length;
    const players = state.servers.reduce((a, s) => a + (st(s).online ? st(s).players : 0), 0);
    if ($('#statOnline')) $('#statOnline').innerHTML = `${online}<small>/${state.servers.length}</small>`;
    if ($('#statPlayers')) $('#statPlayers').textContent = fmtNum(players);
    $('#btnRefresh')?.classList.toggle('spin', state.refreshing);
  }

  function updateHomeParts() {
    if (state.page === 'settings') return;
    const fav = state.page === 'favorites';
    const gw = $('#gridWrap');
    if (gw) gw.innerHTML = gridHTML(fav);
    const hg = $('.hero-grid');
    if (hg) hg.innerHTML = heroHTML() + statsHTML();
    $('#btnRefresh')?.classList.toggle('spin', state.refreshing);
    bindCards();
  }

  // ---------- BROWSE (รายชื่อเซิร์ฟสาธารณะ) ----------
  const joinOf = (id) => `cfx.re/join/${id}`;
  // ใช้ที่อยู่ตรงของเซิร์ฟถ้ามี (ไม่ต้องผ่านระบบลิงก์ cfx.re) ไม่งั้นใช้ cfx.re/join
  const targetOf = (s) => s.endpoint || joinOf(s.id);
  const norm = (x) => String(x || '').toLowerCase().replace(/^https?:\/\//, '').replace(/:30120$/, '').replace(/\/+$/, '');
  const inList = (s) => {
    const keys = [norm(joinOf(s.id)), s.endpoint ? norm(s.endpoint) : null].filter(Boolean);
    return state.servers.some((x) => keys.includes(norm(x.connect)) || keys.includes(norm(x.address)) || x.cfxId === s.id);
  };

  function browseHTML() {
    const B = state.browse;
    const title = isEN()
      ? `<h1 class="h1">Browse <span class="sq">servers${SQUIGGLE}</span></h1>`
      : `<h1 class="h1">ค้นหา<span class="sq">เซิร์ฟ${SQUIGGLE}</span></h1>`;
    return `
      <div class="page-head"><div>${title}<p class="sub">จากรายชื่อเซิร์ฟสาธารณะของ FiveM</p></div></div>
      <div class="toolbar">
        <label class="search">${I.search}<input id="bq" placeholder="พิมพ์ชื่อเซิร์ฟ หรือแนวเซิร์ฟ เช่น roleplay" value="${esc(B.q)}" spellcheck="false"></label>
        <div class="seg" id="bRegion">
          <button data-r="th" class="${B.region === 'th' ? 'on' : ''}">เซิร์ฟไทย</button>
          <button data-r="all" class="${B.region === 'all' ? 'on' : ''}">ทั้งหมด</button>
        </div>
        <button class="icon-btn ${B.loading ? 'spin' : ''}" id="bRefresh" title="โหลดรายชื่อใหม่">${I.refresh}</button>
      </div>
      <div class="b-meta" id="bMeta"></div>
      <div class="b-list" id="bList"></div>
      <div class="b-more" id="bMore"></div>`;
  }

  function browseRow(s) {
    const p = s.max ? Math.min(100, Math.round((s.players / s.max) * 100)) : 0;
    const sub = s.desc || s.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 6).join(' · ') || joinOf(s.id);
    const added = inList(s);
    return `<div class="b-row" data-id="${esc(s.id)}">
      <div class="b-ic">${s.icon ? `<img src="${esc(s.icon)}" alt="" loading="lazy">` : ''}<span>${esc(initial(s.name))}</span></div>
      <div class="b-main"><div class="b-name" title="${esc(s.name)}">${s.private ? '<span class="b-lock">🔒 ส่วนตัว</span>' : ''}<span data-no-i18n>${esc(s.name)}</span></div><div class="b-sub" title="${esc(sub)}" data-no-i18n>${esc(sub)}</div></div>
      <div class="b-pl"><div><b>${fmtNum(s.players)}</b> / ${fmtNum(s.max)}</div><div class="bar"><i style="width:${p}%;--barc:${barColor(p)}"></i></div></div>
      <div class="b-act">
        ${s.private
          ? `<button class="btn btn-sm" data-b="private" title="เซิร์ฟนี้ตั้งเป็นส่วนตัว">ทำไมเข้าไม่ได้?</button>`
          : `<button class="btn btn-sm" data-b="play" title="เข้าเซิร์ฟนี้เลย">${I.play} เล่น</button>
        ${added ? `<button class="btn btn-sm" disabled>${I.check} อยู่ในลิสต์แล้ว</button>` : `<button class="btn btn-sm btn-dark" data-b="add">${I.plus} เพิ่ม</button>`}`}
      </div>
    </div>`;
  }

  function browseSkeleton() {
    return Array.from({ length: 6 }, () => '<div class="b-row skel"><div class="b-ic"></div><div class="b-main"><i></i><i></i></div><div></div><div></div></div>').join('');
  }

  function drawBrowse() {
    const B = state.browse, list = $('#bList');
    if (!list) return;
    $('#bRefresh')?.classList.toggle('spin', B.loading);
    if (B.error) {
      $('#bMeta').textContent = '';
      list.innerHTML = `<div class="empty"><div><div class="em-mark">${I.x}</div><b>โหลดรายชื่อเซิร์ฟไม่สำเร็จ</b>${esc(B.error)}<div style="margin-top:16px"><button class="btn" id="bRetry">${I.refresh} ลองใหม่</button></div></div></div>`;
      $('#bMore').innerHTML = '';
      $('#bRetry').onclick = () => loadBrowse(true, true);
      return;
    }
    if (B.loading && !B.items.length) {
      $('#bMeta').textContent = 'กำลังโหลดรายชื่อเซิร์ฟ... ครั้งแรกอาจใช้เวลาสักครู่';
      list.innerHTML = browseSkeleton();
      $('#bMore').innerHTML = '';
      return;
    }
    const t = B.updated ? new Date(B.updated * 1000).toLocaleTimeString(isEN() ? 'en-GB' : 'th-TH', { hour: '2-digit', minute: '2-digit' }) : '';
    $('#bMeta').textContent = `พบ ${fmtNum(B.total)} เซิร์ฟ · ผู้เล่นรวม ${fmtNum(B.players)} · อัปเดตเมื่อ ${t}`;
    list.innerHTML = B.items.length ? B.items.map(browseRow).join('') : `<div class="empty"><div><div class="em-mark">${I.search}</div><b>ไม่พบเซิร์ฟที่ตรงกับคำค้น</b>ลองพิมพ์คำอื่น หรือเปลี่ยนเป็น “ทั้งหมด”</div></div>`;
    $('#bMore').innerHTML = B.items.length < B.total ? `<button class="btn" id="bMoreBtn" ${B.loading ? 'disabled' : ''}>แสดงเพิ่ม</button>` : '';
    $('#bMoreBtn')?.addEventListener('click', () => loadBrowse(false));
    list.querySelectorAll('.b-row').forEach((row) => {
      const s = B.items.find((x) => x.id === row.dataset.id);
      row.querySelector('[data-b="private"]')?.addEventListener('click', () => privateInfo(s));
      const playBtn = row.querySelector('[data-b="play"]');
      if (playBtn) playBtn.onclick = () => {
        toast(`กำลังเข้า ${s.name}`);
        api.launch(targetOf(s), state.settings.after).catch(() => toast('เปิด FiveM ไม่สำเร็จ', 'err'));
      };
      row.querySelector('[data-b="add"]')?.addEventListener('click', () => addFromBrowse(s));
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
      r = await api.browse({ q: B.q, region: B.region, offset: B.items.length, limit: 50, force });
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

  function privateInfo(s) {
    modal(`
      <div class="modal sm">
        <div class="modal-head"><h2>🔒 เซิร์ฟส่วนตัว</h2><button class="x-btn" data-close>${I.x}</button></div>
        <div class="modal-body">
          <p class="confirm-text"><b style="color:var(--ink)">${esc(s.name)}</b> ตั้งค่าเป็นเซิร์ฟส่วนตัว จึงเข้าจากรายชื่อของ FiveM ไม่ได้ (ปุ่ม Connect ในตัว FiveM เองก็กดไม่ได้เช่นกัน)</p>
          <p class="confirm-text" style="margin-top:12px">ต้องเข้าผ่านช่องทางของเซิร์ฟเอง เช่น Launcher เฉพาะของเซิร์ฟ หรือลิงก์/IP ที่แจกใน Discord ของเซิร์ฟ — ถ้ามีที่อยู่แล้ว กด “เพิ่มเซิร์ฟเวอร์” ที่หน้าหลักแล้ววางที่อยู่นั้นได้เลย</p>
        </div>
        <div class="modal-foot"><button class="btn btn-dark" data-close>เข้าใจแล้ว</button></div>
      </div>`);
  }

  const adding = new Set();
  async function addFromBrowse(s) {
    if (inList(s) || adding.has(s.id)) return;
    adding.add(s.id);
    const t = targetOf(s);
    const rec = {
      id: uid(), address: t, connect: t, display: t.replace(/^https?:\/\//, ''), cfxId: s.id,
      name: s.name, category: '', desc: '', bannerUrl: '', logoUrl: '', discord: '',
      tone: 'auto', autoTone: null, logo: null, banner: s.banner || null, fav: false,
      addedAt: Date.now(), lastPlayed: null,
      status: { online: true, players: s.players, max: s.max, ping: null, checkedAt: Date.now() },
    };
    if (s.icon) {
      try { rec.logo = (await api.fetchImage(s.icon)) || null; } catch {}
      if (rec.logo) rec.autoTone = await dominantColor(rec.logo);
    }
    state.servers.push(rec);
    adding.delete(s.id);
    persist();
    toast(`เพิ่ม ${s.name} แล้ว`);
    drawBrowse();
    try { await refreshOne(rec, true); persist(); } catch {}
  }

  function bindBrowse() {
    const B = state.browse;
    let t;
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
    if (B.loaded) { drawBrowse(); if (Date.now() / 1000 - B.updated > 300) loadBrowse(true); }
    else loadBrowse(true);
  }

  // ---------- SETTINGS ----------
  function seg(name, opts, cur) {
    return `<div class="seg sm" data-setting="${name}">${opts.map(([v, l]) => `<button data-v="${v}" class="${String(cur) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  }
  function settingsHTML() {
    const S = state.settings;
    return `
      <div class="page-head"><div><h1 class="h1"><span class="sq">ตั้งค่า${SQUIGGLE}</span></h1><p class="sub">ปรับให้เข้ากับสไตล์คุณ</p></div></div>

      <section class="sect">
        <h3>ภาษา${isEN() ? '' : ' <span style="opacity:.45;font-weight:600" data-no-i18n>· Language</span>'}</h3>
        <p class="d">เลือกภาษาที่ใช้ในโปรแกรม</p>
        <div data-no-i18n>${seg('lang', [['th', 'ไทย'], ['en', 'English']], S.lang)}</div>
      </section>

      <section class="sect">
        <h3>ธีมโปรแกรม</h3>
        <p class="d">เลือกสไตล์ที่ใช่ — เท่ ๆ คูล ๆ หรือคาวาอิ น่ารัก ๆ เปลี่ยนได้ทันที</p>
        <div class="theme-opts">
          <button class="theme-opt ${S.theme === 'mono' ? 'on' : ''}" data-theme-pick="mono">
            <span class="check">${I.check}</span>
            <div class="mini mono"><span class="t"></span><span class="a"></span><span class="b"></span><span class="c"></span></div>
            <div class="theme-meta"><div><b>ขาว-เทา</b><small>ขาวสะอาด เทาละมุน เรียบหรู</small></div><span class="pill">มินิมอล</span></div>
          </button>
          <button class="theme-opt ${S.theme === 'sakura' ? 'on' : ''}" data-theme-pick="sakura">
            <span class="check">${I.check}</span>
            <div class="mini sakura"><span class="t"></span><span class="a"></span><span class="b"></span><span class="c"></span></div>
            <div class="theme-meta"><div><b style="font-family:Mali,var(--font-head)">ซากุระ</b><small>พาสเทลชมพู สว่าง สดใส</small></div><span class="pill pill-sakura">คาวาอิ</span></div>
          </button>
        </div>
      </section>

      <section class="sect">
        <h3>ตำแหน่ง FiveM</h3>
        <p class="d">โปรแกรมจะค้นหา FiveM.exe ให้อัตโนมัติ หากติดตั้งไว้ที่อื่นสามารถเลือกไฟล์เองได้</p>
        <div class="path-box">${state.fivem.found ? '<span class="pill pill-ok">พบแล้ว</span>' : '<span class="pill pill-off">ไม่พบ</span>'}<code title="${esc(state.fivem.path)}">${esc(state.fivem.path || '—')}</code></div>
        ${state.fivem.found ? '' : '<div class="warn-box">ไม่พบ FiveM.exe — ตอนกดเล่นจะเปิดผ่านลิงก์ fivem:// แทน (ต้องติดตั้ง FiveM ก่อน)</div>'}
        <div class="btn-row">
          <button class="btn" data-act="pick-fivem">${I.folder} เลือกไฟล์ FiveM.exe</button>
          <button class="btn" data-act="dl-fivem">${I.ext} ดาวน์โหลด FiveM</button>
        </div>
      </section>

      <div class="sect-row">
        <section class="sect"><h3>หลังกดเล่น</h3><p class="d">ให้ Launcher ทำอะไรหลังเปิดเกม</p>${seg('after', [['minimize', 'ย่อหน้าต่าง'], ['quit', 'ปิดโปรแกรม'], ['none', 'ไม่ทำอะไร']], S.after)}</section>
        <section class="sect"><h3>รีเฟรชสถานะอัตโนมัติ</h3><p class="d">อัปเดตจำนวนผู้เล่นและปิงทุก ๆ</p>${seg('refresh', [[0, 'ปิด'], [15, '15 วิ'], [30, '30 วิ'], [60, '60 วิ']], S.refresh)}</section>
      </div>

      <section class="sect">
        <h3>การใช้ทรัพยากร</h3>
        <p class="d">โปรแกรมจะทำงานเต็มที่เฉพาะตอนคุณกำลังใช้อยู่ — ไปเล่นเกมหรือเปิดโปรแกรมอื่น จะผ่อนแรงลงเอง และตอนย่อหน้าต่างจะหยุดรีเฟรชทั้งหมด คืนหน่วยความจำและยกความสำคัญของ CPU ให้เกม</p>
        ${seg('perf', [['eco', 'ประหยัดสุด'], ['balanced', 'สมดุล (แนะนำ)'], ['full', 'เต็มที่']], S.perf)}
        <div class="metrics"><div class="metric">CPU <b id="mCpu">—</b></div><div class="metric">RAM <b id="mRam">—</b></div></div>
      </section>

      <section class="sect"><h3>เคอร์เซอร์เมาส์</h3><p class="d">เปลี่ยนรูปเมาส์ตามธีมที่เลือก</p>${seg('cursor', [['theme', 'ตามธีม'], ['normal', 'แบบปกติ']], S.cursor)}</section>

      <section class="sect"><h3>เอฟเฟกต์การเคลื่อนไหว</h3><p class="d">เต็ม = เลื่อนหน้าจอแบบนุ่ม การ์ดเอียงตามเมาส์ และแอนิเมชันครบ / ลด = ปิดการเคลื่อนไหวทั้งหมด เหมาะกับคนที่เวียนหัวง่าย</p>${seg('motion', [['full', 'เต็ม (ลื่นสุด)'], ['reduced', 'ลด']], S.motion)}</section>

      <section class="sect">
        <h3>ล้างแคช FiveM</h3>
        <p class="d">แก้อาการเกมเด้ง โหลดเข้าเซิร์ฟค้าง หรือพื้นที่เต็ม — ลบ crashes, data/cache, server-cache และ server-cache-priv (ต้องปิด FiveM ก่อน)</p>
        <div id="cacheBox"><div class="cache-list"><div class="cache-item none"><span class="nm">กำลังสแกน...</span></div></div></div>
      </section>

      <section class="sect">
        <h3>การอัปเดต</h3>
        <p class="d">โปรแกรมจะตรวจหาเวอร์ชันใหม่ให้อัตโนมัติทุกครั้งที่เปิด</p>
        <div class="btn-row" style="align-items:center">
          <button class="btn" data-act="check-update">${I.refresh} ตรวจหาเวอร์ชันใหม่</button>
          <span class="sub" id="updStatus" style="margin:0">เวอร์ชัน ${esc(state.version)}</span>
        </div>
      </section>

      ${CFG.updateRepo ? `<section class="sect">
        <h3>ช่วยเหลือ</h3>
        <p class="d">เจอปัญหา หรืออยากได้ฟีเจอร์อะไร บอกผู้พัฒนาได้ที่นี่ (ต้องมีบัญชี GitHub ฟรี)</p>
        <div class="btn-row">
          <button class="btn" data-act="report" data-kind="bug">${I.x} แจ้งปัญหา</button>
          <button class="btn" data-act="report" data-kind="idea">${I.sparkle} เสนอฟีเจอร์</button>
          <button class="btn" data-act="website">${I.ext} เว็บไซต์</button>
        </div>
      </section>` : ''}

      <section class="sect">
        <h3>ข้อมูลของคุณ</h3>
        <p class="d">สำรองลิสต์เซิร์ฟเวอร์และการตั้งค่าไว้เป็นไฟล์ หรือย้ายไปเครื่องอื่น</p>
        <div class="btn-row">
          <button class="btn" data-act="export">${I.download} ส่งออกข้อมูล</button>
          <button class="btn" data-act="import">${I.upload} นำเข้าข้อมูล</button>
          <button class="btn" data-act="reset" style="color:var(--danger)">${I.reset} รีเซ็ตทั้งหมด</button>
        </div>
        <div class="about"><div class="mark">${I.mark}</div><div><b>${esc(CFG.appName)} Launcher</b><small id="appInfo">เวอร์ชัน ${esc(state.version)}</small></div></div>
      </section>`;
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
    $$('[data-act="go-browse"]').forEach((b) => b.addEventListener('click', () => go('browse')));
    if (state.page === 'browse') { bindBrowse(); return; }
    $$('[data-act="add"]').forEach((b) => b.addEventListener('click', () => openServerModal()));
    $$('[data-act="open-fivem"]').forEach((b) => b.addEventListener('click', () => { api.openFiveM(); toast('กำลังเปิด FiveM'); }));
    $('[data-act="refresh"]')?.addEventListener('click', () => refreshAll(true));
    $('[data-act="new-group"]')?.addEventListener('click', () => groupModal(null));
    const q = $('#q');
    if (q) q.addEventListener('input', () => { state.q = q.value; const gw = $('#gridWrap'); gw.innerHTML = gridHTML(state.page === 'favorites'); bindCards(); });
    $$('#filters button').forEach((b) => b.addEventListener('click', () => {
      state.filter = b.dataset.f;
      $$('#filters button').forEach((x) => x.classList.toggle('on', x === b));
      $('#gridWrap').innerHTML = gridHTML(false);
      bindCards();
    }));
    bindCards();

    if (state.page === 'settings') {
      $$('[data-theme-pick]').forEach((b) => b.addEventListener('click', () => setSetting('theme', b.dataset.themePick)));
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
        state.settings = { ...DEFAULT_SETTINGS, ...(d.settings || {}) };
        applyPrefs(); persist(); render(); restartAuto(); refreshAll();
        toast(`นำเข้า ${d.servers.length} เซิร์ฟเวอร์แล้ว`);
      });
      $('[data-act="reset"]').addEventListener('click', confirmReset);
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
        <div class="modal-body"><p class="confirm-text">ลิสต์เซิร์ฟเวอร์ ${state.servers.length} รายการและการตั้งค่าทั้งหมดจะถูกลบ แนะนำให้ส่งออกข้อมูลเก็บไว้ก่อน</p></div>
        <div class="modal-foot"><button class="btn" data-close>ยกเลิก</button><button class="btn btn-danger" id="doReset">${I.reset} รีเซ็ต</button></div>
      </div>`);
    $('#doReset', m).addEventListener('click', () => {
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
      try { sessionStorage.setItem('fl-page', state.page); } catch {}
      setTimeout(() => location.reload(), 450); // รอให้บันทึกการตั้งค่าก่อน
      return;
    }
    if (rerender) render();
  }

  function bindCards() {
    $$('[data-act="play"]').forEach((b) => (b.onclick = () => play(b.dataset.id)));
    $$('[data-act="fav"]').forEach((b) => (b.onclick = (e) => {
      e.stopPropagation();
      const s = byId(b.dataset.id);
      s.fav = !s.fav;
      persist();
      b.classList.toggle('on', s.fav);
      if (state.page === 'favorites' || state.filter === 'fav') updateHomeParts();
    }));
    $$('[data-act="more"]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); openMenu(b, byId(b.dataset.id)); }));
    $$('[data-act="watch"]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); toggleWatch(byId(b.dataset.id)); }));
    if (state.settings.motion === 'full') {
      $$('.card').forEach((c) => {
        c.onmousemove = (e) => {
          if (document.body.classList.contains('dnd')) return;
          const r = c.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          c.style.transform = `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-4px)`;
        };
        c.onmouseleave = () => { c.style.transform = ''; };
      });
    }
    bindDnD();
  }

  const byId = (id) => state.servers.find((s) => s.id === id);

  // ---------- menu ----------
  function closeMenu() { $('#menuLayer').innerHTML = ''; }
  function showMenu(anchor, html, onPick) {
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
    m.style.left = `${Math.max(10, Math.min(r.right - mw, innerWidth - mw - 10))}px`;
    m.style.top = `${top}px`;
    m.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b || b.disabled) return;
      closeMenu();
      onPick(b.dataset.m, b);
    });
  }

  function openMenu(anchor, s) {
    const cur = s.group && groupById(s.group) ? s.group : '';
    const mark = (on) => (on ? I.check : '<i class="mk"></i>');
    const groups = state.groups.length
      ? `<hr><div class="menu-label">ย้ายไปกลุ่ม</div>
         ${state.groups.map((g) => `<button data-m="grp" data-g="${g.id}">${mark(cur === g.id)} <span data-no-i18n>${esc(g.name)}</span></button>`).join('')}
         <button data-m="grp" data-g="">${mark(!cur)} ไม่ได้จัดกลุ่ม</button>
         <button data-m="newgrp">${I.folder2} กลุ่มใหม่...</button>`
      : `<button data-m="newgrp">${I.folder2} ย้ายไปกลุ่มใหม่...</button>`;
    showMenu(anchor, `
      <button data-m="edit">${I.edit} แก้ไข</button>
      <button data-m="copy">${I.copy} คัดลอกที่อยู่</button>
      ${s.discord ? `<button data-m="discord">${I.discord} เปิด Discord</button>` : ''}
      <button data-m="refresh">${I.refresh} รีเฟรชเซิร์ฟนี้</button>
      ${state.watching[s.id] ? `<button data-m="watch">🔔 ยกเลิกการแจ้งเตือน</button>` : bellKind(s) ? `<button data-m="watch">🔔 ${bellKind(s) === 'online' ? 'แจ้งเตือนเมื่อเซิร์ฟเปิด' : 'แจ้งเตือนเมื่อมีที่ว่าง'}</button>` : ''}
      ${groups}
      <hr><button data-m="del" class="danger">${I.trash} ลบเซิร์ฟเวอร์</button>`, async (k, b) => {
      if (k === 'edit') openServerModal(s);
      if (k === 'copy') { try { await navigator.clipboard.writeText(s.connect || s.address); toast('คัดลอกที่อยู่แล้ว'); } catch { toast('คัดลอกไม่สำเร็จ', 'err'); } }
      if (k === 'discord') api.openExternal(normUrl(s.discord));
      if (k === 'refresh') { await refreshOne(s, true); persist(); updateHomeParts(); }
      if (k === 'del') confirmDelete(s);
      if (k === 'watch') toggleWatch(s);
      if (k === 'grp') { s.group = b.dataset.g || null; persist(); updateHomeParts(); }
      if (k === 'newgrp') groupModal(null, s);
    });
  }
  document.addEventListener('mousedown', (e) => { if (!e.target.closest('.menu, .more-btn, .grp-more')) closeMenu(); });
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
    o.addEventListener('mousedown', (e) => { if (e.target === o) closeModal(); });
    o.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
    $('#modalRoot').appendChild(o);
    return o;
  }
  function closeModal() { $('#modalRoot').innerHTML = ''; }

  // ---------- add / edit server ----------
  function openServerModal(existing) {
    const d = existing
      ? { ...existing, fetched: existing.status ? { ...existing.status, name: existing.name, logo: existing.logo, banner: existing.banner } : null }
      : { address: '', name: '', category: '', desc: '', bannerUrl: '', logoUrl: '', discord: '', tone: 'auto', autoTone: null, logo: null, banner: null, fetched: null };
    const cats = CFG.categories;

    const m = modal(`
      <div class="modal">
        <div class="modal-head"><h2>${existing ? 'แก้ไขเซิร์ฟเวอร์' : 'เพิ่มเซิร์ฟเวอร์ใหม่'}</h2><button class="x-btn" data-close>${I.x}</button></div>
        <div class="modal-body">
          <div class="field">
            <label>ที่อยู่เซิร์ฟเวอร์</label>
            <div class="row"><input class="input" id="fAddr" placeholder="play.yourserver.com หรือ 127.0.0.1:30120" value="${esc(d.address)}" spellcheck="false"><button class="btn" id="fCheck" style="height:50px">${I.bolt} ตรวจสอบ</button></div>
            <div class="hint" id="fHint">รองรับโดเมนทุกแบบ (เช่น play.yourserver.com), IP:Port (ไม่ใส่พอร์ต = 30120), ลิงก์แบบมี path (เช่น https://play.city.co.th/server1), คำสั่ง connect จาก F8 และลิงก์/โค้ด cfx.re/join</div>
          </div>
          <div class="preview" id="fPreview"></div>
          <div class="field"><label>ชื่อเซิร์ฟเวอร์</label><input class="input" id="fName" placeholder="เช่น เมืองหลวง RP" value="${esc(d.name)}"></div>
          <div class="field"><label>หมวดหมู่ <small>เลือก 1 อย่าง</small></label>
            <div class="chip-grid" id="fCats">${cats.map((c) => `<button class="chip-opt ${d.category === c ? 'on' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>
          </div>
          <div class="field"><label>คำอธิบาย <small>ไม่บังคับ</small></label><textarea class="input" id="fDesc" placeholder="บอกสั้น ๆ ว่าเซิร์ฟเวอร์นี้เป็นแบบไหน">${esc(d.desc)}</textarea></div>
          <div class="cols-2">
            <div class="field" style="margin-bottom:0"><label>รูปแบนเนอร์ (URL) <small>ไม่บังคับ</small></label><input class="input" id="fBanner" placeholder="https://.../banner.gif" value="${esc(d.bannerUrl)}" spellcheck="false"></div>
            <div class="field" style="margin-bottom:0"><label>รูปโลโก้ (URL) <small>ไม่บังคับ</small></label><input class="input" id="fLogo" placeholder="https://.../logo.gif" value="${esc(d.logoUrl)}" spellcheck="false"></div>
          </div>
          <div class="hint" style="margin-bottom:18px">รองรับ PNG, JPG, WEBP และ GIF แบบขยับได้ — เว้นว่างไว้จะใช้แบนเนอร์/โลโก้ที่ดึงจากเซิร์ฟเวอร์</div>
          <div class="field"><label>ลิงก์ Discord <small>ไม่บังคับ</small></label><input class="input" id="fDiscord" placeholder="discord.gg/yourserver" value="${esc(d.discord)}" spellcheck="false"></div>
          <div class="field" style="margin-bottom:4px"><label>โทนการ์ด <span class="tone-now" id="fToneNow"></span></label>
            <div class="swatches" id="fTones"></div>
          </div>
        </div>
        <div class="modal-foot"><button class="btn" data-close>ยกเลิก</button><button class="btn btn-dark" id="fSave">${I.check} บันทึก</button></div>
      </div>`);

    const el = (id) => $(`#${id}`, m);

    function renderPreview() {
      const f = d.fetched;
      const logo = d.logoUrl || d.logo;
      const banner = d.bannerUrl || d.banner;
      const t = d.tone !== 'auto' ? d.tone : d.autoTone || '#2c2c3a';
      el('fPreview').setAttribute('style', toneStyle(t));
      const bannerInner = banner ? `<img src="${esc(banner)}" alt="">` : logo ? `<img class="blur-logo" src="${esc(logo)}" alt="">` : '';
      el('fPreview').innerHTML = `
        <div class="pv-banner" style="${banner || logo ? `background:${t}` : ''}">${bannerInner}</div>
        <div class="pv-row">
          <div class="pv-logo ${logo ? 'has' : ''}">${logo ? `<img src="${esc(logo)}" alt="">` : '?'}</div>
          <div class="pv-info">
            <b>${esc(el('fName')?.value || f?.name || 'ชื่อเซิร์ฟเวอร์')}</b>
            ${f ? (f.online ? `<span class="pill pill-ok" style="margin-top:4px">ออนไลน์ · ${fmtNum(f.players)}/${fmtNum(f.max)}</span>` : '<span class="pill pill-off" style="margin-top:4px">ออฟไลน์</span>') : '<span>กด “ตรวจสอบ” เพื่อดึงชื่อ โลโก้ และแบนเนอร์</span>'}
          </div>
          ${d.logo && !d.logoUrl ? `<button class="btn btn-sm" id="fRmLogo">${I.trash} ลบโลโก้</button>` : ''}
        </div>`;
      el('fRmLogo')?.addEventListener('click', () => { d.logo = null; d.autoTone = null; renderPreview(); renderTones(); });
    }

    function renderTones() {
      const cur = d.tone;
      const autoC = d.autoTone || '#2c2c3a';
      const isCustom = cur !== 'auto' && !CFG.tones.includes(cur);
      el('fTones').innerHTML = `
        <button class="swatch auto ${cur === 'auto' ? 'on' : ''}" data-t="auto" title="อัตโนมัติจากโลโก้"></button>
        ${CFG.tones.map((c) => `<button class="swatch ${cur === c ? 'on' : ''}" data-t="${c}" style="--c:${c}"></button>`).join('')}
        <label class="swatch custom ${isCustom ? 'on' : ''}" style="--c:${isCustom ? cur : 'transparent'}" title="เลือกสีเอง">+<input type="color" value="${isCustom ? cur : '#ec6fa3'}"></label>`;
      const now = cur === 'auto' ? autoC : cur;
      el('fToneNow').innerHTML = `<i style="--c:${now}"></i>${cur === 'auto' ? 'อัตโนมัติ' : 'กำหนดเอง'} — <code>${now}</code>`;
      el('fTones').querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => { d.tone = b.dataset.t; renderTones(); renderPreview(); }));
      const ci = el('fTones').querySelector('input[type=color]');
      ci.addEventListener('input', () => { d.tone = ci.value; el('fToneNow').innerHTML = `<i style="--c:${ci.value}"></i>กำหนดเอง — <code>${ci.value}</code>`; renderPreview(); });
      ci.addEventListener('change', () => renderTones());
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
      d.fetched = r;
      d.connect = r.connect; d.display = r.display;
      if (r.online) {
        if (r.logo) d.logo = r.logo;
        if (r.banner) d.banner = r.banner;
        if (!el('fName').value.trim() && r.name) el('fName').value = r.name;
        if (!el('fDesc').value.trim() && r.desc && r.desc.length < 140) el('fDesc').value = r.desc;
        hint.className = 'hint ok';
        hint.textContent = `ออนไลน์ · ${fmtNum(r.players)}/${fmtNum(r.max)} ผู้เล่น · ${r.ping} ms · ${r.logo ? 'พบโลโก้' : 'ไม่พบโลโก้'} · ${r.banner ? 'พบแบนเนอร์' : 'ไม่พบแบนเนอร์'} — ${r.connect}`;
        if (d.logo) d.autoTone = await dominantColor(d.logo);
      } else {
        hint.className = 'hint err';
        hint.textContent = `ออฟไลน์ หรือเชื่อมต่อไม่ได้ — ${r.error || ''} (ยังบันทึกได้)`;
      }
      renderPreview(); renderTones();
    }

    el('fCheck').addEventListener('click', check);
    el('fAddr').addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
    el('fName').addEventListener('input', () => { const b = $('.pv-info b', m); if (b) b.textContent = el('fName').value || d.fetched?.name || 'ชื่อเซิร์ฟเวอร์'; });
    el('fCats').querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => {
      d.category = d.category === b.dataset.c ? '' : b.dataset.c;
      el('fCats').querySelectorAll('[data-c]').forEach((x) => x.classList.toggle('on', x.dataset.c === d.category));
    }));
    let imgT;
    const onImg = () => {
      clearTimeout(imgT);
      imgT = setTimeout(async () => {
        d.bannerUrl = el('fBanner').value.trim();
        d.logoUrl = el('fLogo').value.trim();
        if (d.logoUrl) d.autoTone = (await dominantColor(d.logoUrl)) || d.autoTone;
        else if (d.logo) d.autoTone = await dominantColor(d.logo);
        renderPreview(); renderTones();
      }, 450);
    };
    el('fBanner').addEventListener('input', onImg);
    el('fLogo').addEventListener('input', onImg);

    el('fSave').addEventListener('click', async () => {
      const address = el('fAddr').value.trim();
      if (!address) { el('fAddr').focus(); el('fHint').className = 'hint err'; el('fHint').textContent = 'กรุณาใส่ที่อยู่เซิร์ฟเวอร์'; return; }
      const needsCheck = !d.fetched || address !== d.address;
      const rec = {
        id: existing?.id || uid(),
        address,
        connect: needsCheck ? address : d.connect || address,
        display: needsCheck ? address : d.display || address,
        name: el('fName').value.trim() || d.fetched?.name || address,
        category: d.category || '',
        desc: el('fDesc').value.trim(),
        bannerUrl: el('fBanner').value.trim(),
        logoUrl: el('fLogo').value.trim(),
        discord: el('fDiscord').value.trim(),
        tone: d.tone,
        autoTone: d.autoTone,
        logo: d.logo || null,
        banner: d.banner || null,
        fav: existing?.fav || false,
        addedAt: existing?.addedAt || Date.now(),
        lastPlayed: existing?.lastPlayed || null,
        status: d.fetched && !needsCheck ? { online: d.fetched.online, players: d.fetched.players, max: d.fetched.max, ping: d.fetched.ping, checkedAt: Date.now() } : existing?.status || null,
      };
      if (existing) Object.assign(existing, rec);
      else state.servers.push(rec);
      persist();
      closeModal();
      updateHomeParts();
      toast(existing ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มเซิร์ฟเวอร์แล้ว');
      if (needsCheck) { await refreshOne(existing || rec, true); updateHomeParts(); }
    });

    renderPreview();
    renderTones();
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

  // ---------- play ----------
  async function play(id) {
    const s = byId(id);
    if (!s) return;
    s.lastPlayed = Date.now();
    persist();
    toast(`กำลังเข้า ${s.name}`);
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
      ? `**เกิดอะไรขึ้น**\n\n\n**ทำอะไรก่อนเกิดปัญหา**\n1. \n\n**ภาพหน้าจอ (ถ้ามี)**\n\n\n---\nเวอร์ชัน: ${state.version}\nระบบ: ${state.os}\nภาษา: ${state.settings.lang} · ธีม: ${state.settings.theme}`
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
    $$('.nav-btn').forEach((b) => b.addEventListener('click', () => go(b.dataset.page)));
    $('#btnMin').addEventListener('click', () => api.minimize());
    $('#btnClose').addEventListener('click', () => api.close());
    $('.titlebar').addEventListener('dblclick', (e) => { if (!e.target.closest('button')) api.toggleMax(); });
    $('#btnTheme').addEventListener('click', () => {
      setSetting('theme', state.settings.theme === 'mono' ? 'sakura' : 'mono', state.page === 'settings');
      toast(state.settings.theme === 'sakura' ? 'ธีมซากุระ 🌸' : 'ธีมขาว-เทา');
    });
    $('#btnDiscord').addEventListener('click', () => api.openExternal(CFG.discordUrl));
    $('#btnDiscord').hidden = !CFG.discordUrl;
    $('#brandName').textContent = CFG.appName;
    $('#brandTag').firstChild.textContent = `${CFG.appTag} `;
    if (CFG.madeBy) $('#madeBy').textContent = CFG.madeBy;
    else $('.made').innerHTML = `<b>${esc(CFG.appName)} Launcher</b> <span style="opacity:.6">v${esc(state.version)}</span>`;

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeMenu(); closeModal(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (state.page === 'settings') go('home');
        setTimeout(() => { const q = $('#q') || $('#bq'); q?.focus(); q?.select(); }, 30);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') { e.preventDefault(); openServerModal(); }
      if (e.key === 'F5') { e.preventDefault(); refreshAll(true); }
    });
    api.onVisibility?.((v) => { state.visible = v.visible; if (v.visible) refreshAll(); });
    document.addEventListener('visibilitychange', () => { state.visible = !document.hidden; });
    const setIdle = (idle) => document.documentElement.classList.toggle('idle', idle && state.settings.perf !== 'full');
    window.addEventListener('blur', () => setIdle(true));
    window.addEventListener('focus', () => setIdle(false));
  }

  async function init() {
    const saved = await api.load();
    if (saved) {
      state.servers = cleanServers(saved.servers);
      state.groups = cleanGroups(saved.groups, state.servers);
      state.settings = { ...DEFAULT_SETTINGS, ...(saved.settings || {}) };
    }
    applyPrefs();
    try { const inf = await api.info(); state.version = inf.version || ''; state.os = inf.os || ''; } catch {}
    try { (await api.watchList?.() || []).forEach((w) => (state.watching[w.id] = w.kind)); } catch {}
    try { state.fivem = await api.fivemStatus(state.settings.fivemPath); } catch {}
    api.setPerfMode?.(state.settings.perf);
    bindGlobal();
    let startPage = 'home';
    try { startPage = sessionStorage.getItem('fl-page') || 'home'; sessionStorage.removeItem('fl-page'); } catch {}
    go(['home', 'browse', 'favorites', 'settings'].includes(startPage) ? startPage : 'home');
    restartAuto();
    refreshAll();
    setTimeout(() => checkUpdate(false), 4000);
  }

  init();
})();
