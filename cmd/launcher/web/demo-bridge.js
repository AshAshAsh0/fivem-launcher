// โหมดพรีวิวบนเบราว์เซอร์ (ไม่ได้รันผ่าน Electron) — ใช้ข้อมูลตัวอย่าง
// ตอนรันจริงใน Electron จะมี window.api จาก preload.js อยู่แล้ว ไฟล์นี้จะไม่ทำอะไร
(() => {
  if (window.api) return;

  const KEY = 'fivem-launcher-demo';
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function art(w, h, colors, letter, round) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, w, h);
    colors.forEach((col, i) => g.addColorStop(i / (colors.length - 1), col));
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 7; i++) {
      x.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.1})`;
      x.beginPath();
      x.arc(Math.random() * w, Math.random() * h, 20 + Math.random() * (w / 3), 0, Math.PI * 2);
      x.fill();
    }
    if (letter) {
      x.fillStyle = 'rgba(255,255,255,.95)';
      x.font = `900 ${Math.round(h * 0.5)}px Prompt, sans-serif`;
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(letter, w / 2, h / 2 + 4);
    }
    return c.toDataURL('image/png');
  }

  const DEMO = {
    'play.neoncity.gg': { name: 'NEON CITY RP', colors: ['#ff5f6d', '#ffc371'], L: 'N', players: 1428, max: 2048, ping: 21 },
    'play.whitecity.in.th/s2': { name: 'WHITE CITY #2', colors: ['#0f766e', '#2dd4bf'], L: 'W', players: 54, max: 800, ping: 40 },
    'cfx.re/join/abc123': { name: 'SHARK COMMUNITY', colors: ['#2563eb', '#7dd3fc'], L: 'S', players: 2048, max: 2048, ping: 35 },
  };

  window.api = {
    minimize() {}, close() {}, toggleMax() {}, onVisibility() {},
    async load() {
      try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
    },
    async save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} return true; },
    async query(addr) {
      await wait(500);
      const key = String(addr).trim().replace(/^connect\s+/i, '').replace(/^https?:\/\//, '').replace(/\/$/, '');
      const d = DEMO[key];
      if (!d) return { ok: true, online: false, connect: addr, display: addr, players: 0, max: 0, ping: null, error: 'โหมดพรีวิว: ใช้ได้กับที่อยู่ตัวอย่างเท่านั้น' };
      d.logo ||= art(128, 128, d.colors, d.L);
      d.banner ||= art(640, 240, [...d.colors].reverse());
      const jitter = Math.round((Math.random() - 0.5) * 20);
      return { ok: true, online: true, connect: key, display: key, name: d.name, desc: '', players: Math.min(d.max, Math.max(0, d.players + jitter)), max: d.max, ping: d.ping + Math.round(Math.random() * 6), logo: d.logo, banner: d.banner, tags: [] };
    },
    async fetchImage(u) { return u; },
    async fivemStatus() { return { path: 'C:\\Users\\User\\AppData\\Local\\FiveM\\FiveM.exe', found: true }; },
    async pickFiveM() { return null; },
    async launch() { return { ok: true }; },
    async openFiveM() { return true; },
    async openExternal(u) { window.open(u, '_blank'); },
    async scanCache() {
      return { exists: true, running: false, total: 729815040, items: [
        { name: 'crashes', size: 0 }, { name: 'data/cache', size: 116444160 },
        { name: 'data/server-cache', size: 1024 }, { name: 'data/server-cache-priv', size: 613369856 } ] };
    },
    async clearCache() { await wait(600); return { ok: true, freed: 729815040 }; },
    async metrics() { return { cpu: Math.random() * 0.4, ram: 420 + Math.random() * 15 }; },
    async setPerfMode() {}, async info() { return { version: '2.1.0' }; },
    async setLang() {}, async watchStart() { return []; }, async watchStop() { return []; }, async watchList() { return []; },
    async browse(o) {
      const demoIcon = (i) => { const h = (i * 47) % 360; return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h},80%,60%)"/><stop offset="1" stop-color="hsl(${(h + 60) % 360},70%,35%)"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><circle cx="44" cy="20" r="10" fill="rgba(255,255,255,.35)"/><path d="M10 52 28 24l10 14 6-8 10 22z" fill="rgba(255,255,255,.55)"/></svg>`); };
      await wait(o.offset ? 300 : 900);
      const names = ['เมืองหลวง RP', 'Bangkok Life', 'SCHOOL CITY', 'Neon Drift', 'โรงเรียนมัธยม RP', 'Sakura Town', 'Thai Police RP', 'Racing Club TH'];
      window.__demoList ||= Array.from({ length: 140 }, (_, i) => ({ id: 'srv' + i, name: names[i % names.length] + (i > 7 ? ' #' + i : ''), desc: i % 3 ? '' : 'Roleplay เมืองไทย เปิด 24 ชม.', players: Math.max(0, 1800 - i * 13), max: 2048, locale: i % 4 ? 'th-TH' : 'en-US', tags: 'roleplay,thai,economy', icon: demoIcon(i), banner: i % 2 ? '' : demoIcon(i + 3), private: i % 5 === 1, discord: i % 2 ? '' : 'https://discord.gg/demo', website: i % 3 ? '' : 'https://example.com' }));
      const q = (o.q || '').toLowerCase();
      const all = window.__demoList.filter((s) => (o.region !== 'th' || s.locale === 'th-TH') && (!q || (s.name + s.desc + s.tags).toLowerCase().includes(q)));
      return { items: all.slice(o.offset, o.offset + o.limit), total: all.length, players: all.reduce((a, s) => a + s.players, 0), all: 140, updated: Date.now() / 1000 };
    },
    async checkUpdate() { return { available: true, version: '2.2.0', url: '#' }; }, async installUpdate() { await wait(800); throw new Error('preview'); },
    async exportData() { return false; }, async importData() { return null; },
    async setWallpaper(b64) { try { localStorage.setItem('fl-demo-wall', 'data:image/jpeg;base64,' + b64); return true; } catch { return false; } },
    img: (u) => u,
    async listBackups() { return [{ name: 'launcher-data-20261030-162217.json', time: Date.now() - 600000, servers: 3, names: ['NEON CITY RP', 'WHITE CITY', 'SHARK COMMUNITY'] }]; },
    async readBackup() { return { version: 1, servers: [{ id: 'rest1', name: 'RESTORED CITY', address: 'cfx.re/join/rest01' }, { id: 'rest2', name: 'RESTORED TOWN', address: '5.6.7.8:30120' }], groups: [] }; },
    async clearWallpaper() { try { localStorage.removeItem('fl-demo-wall'); } catch {} return true; },
    wallpaperURL() { try { return localStorage.getItem('fl-demo-wall') || ''; } catch { return ''; } },
  };
})();
