// หน้า loading: ตั้งธีม/ภาษาจากพารามิเตอร์ที่ตัวโปรแกรมส่งมา ก่อนหน้าเว็บวาดเฟรมแรก
(() => {
  const q = new URLSearchParams(location.search);
  const theme = q.get('theme');
  if (theme === 'mono' || theme === 'sakura' || theme === 'hud') document.documentElement.dataset.theme = theme;
  const lang = q.get('lang') || ((navigator.language || '').toLowerCase().startsWith('th') ? 'th' : 'en');
  const en = lang === 'en';
  const v = (q.get('v') || '').replace(/[^0-9.]/g, '');
  const T = en
    ? { s0: 'Starting up', s1: 'Loading settings', s2: 'Looking for FiveM', s3: 'Loading server list', s4: 'Ready', tip: 'Tip: double-click a server to join instantly' }
    : { s0: 'กำลังเริ่มต้น', s1: 'กำลังโหลดการตั้งค่า', s2: 'กำลังตรวจหา FiveM', s3: 'กำลังโหลดรายชื่อเซิร์ฟ', s4: 'พร้อมแล้ว', tip: 'ทิป: ดับเบิลคลิกที่เซิร์ฟเพื่อเข้าเกมได้ทันที' };
  const MIN = 1000, t0 = performance.now();
  let pct = 0, shown = 0, raf = 0, label = -1;
  const marks = [[0, 0]]; // [เปอร์เซ็นต์ที่แถบต้องถึง, ขั้น] — ข้อความเปลี่ยนตามแถบ ไม่กระโดดล้ำหน้า
  const $ = (id) => document.getElementById(id);
  // แถบวิ่งเอง (เวลาขั้นต่ำ) แต่ไม่เกินขั้นที่งานจริงทำถึงแล้ว
  const tick = () => {
    const el = $('splash');
    if (!el) return;
    const timeCap = Math.min(100, ((performance.now() - t0) / MIN) * 100);
    shown += (Math.min(pct, timeCap) - shown) * 0.18;
    $('spBar').style.width = shown.toFixed(1) + '%';
    let n = 0;
    for (const [at, k] of marks) if (shown + 6 >= at) n = k;
    if (n !== label) { label = n; $('spStatus').textContent = (T['s' + n] || '') + (n < 4 ? ' ...' : ''); }
    raf = requestAnimationFrame(tick);
  };
  window.Splash = {
    step(n, p) { marks.push([n === 4 ? 96 : Math.max(0, p - 22), n]); pct = Math.max(pct, p); },
    done() {
      Splash.step(4, 100);
      const wait = Math.max(0, MIN - (performance.now() - t0));
      setTimeout(() => {
        const el = $('splash');
        if (!el) return;
        $('spBar').style.width = '100%';
        el.classList.add('out');
        setTimeout(() => { cancelAnimationFrame(raf); el.remove(); }, 320);
      }, wait);
    },
  };
  document.addEventListener('DOMContentLoaded', () => {
    $('spTip').textContent = T.tip;
    $('spVer').textContent = v ? 'v' + v : '';
    pct = 8;
    raf = requestAnimationFrame(tick);
  });
  // กันค้าง: ถ้ามีอะไรผิดพลาด หน้า loading จะหายเองภายใน 8 วินาที
  setTimeout(() => window.Splash && Splash.done(), 8000);
})();
