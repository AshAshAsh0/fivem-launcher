// ระบบสองภาษา (ไทย / English)
// ข้อความในโค้ดเขียนเป็นภาษาไทย เมื่อเลือก English จะแปลข้อความบนหน้าจอให้อัตโนมัติ
(() => {
  const EN = {
    // nav / chrome
    'หน้าหลัก': 'Home', 'ตั้งค่า': 'Settings', 
    'ย่อหน้าต่าง': 'Minimize', 'ปิดหน้าต่าง': 'Close',
    // home
    'เพิ่มเซิร์ฟเวอร์': 'Add server', 'ยังไม่มีเซิร์ฟเวอร์': 'No servers yet',
    'เล่นล่าสุด': 'Last played', 'ล่าสุด': 'Recent',
    'ออนไลน์': 'Online', 'ออฟไลน์': 'Offline', 'ผู้เล่น': 'players', 'เล่นเลย': 'Play now', 'เล่น': 'Play', 'ลองเข้า': 'Try join',
    'ผู้เล่นรวม': 'Total players', 
    'ทั้งหมด': 'All', 
    'ไม่พบเซิร์ฟเวอร์': 'No servers found', 
    'เต็ม': 'Full',
    // menu
    'แก้ไข': 'Edit', 'คัดลอกที่อยู่': 'Copy address', 
    'ลบเซิร์ฟเวอร์': 'Delete server', 'ลบเซิร์ฟเวอร์?': 'Delete server?', 'ลบ': 'Delete', 'ออกจากลิสต์ของคุณ': 'from your list',
    // modal
    'ที่อยู่เซิร์ฟเวอร์': 'Server address',
    'ตรวจสอบ': 'Check', 'กำลังเช็ก...': 'Checking...',
    'ชื่อเซิร์ฟเวอร์': 'Server name', 
    'กด “ตรวจสอบ” เพื่อดึงชื่อ โลโก้ และแบนเนอร์': 'Click “Check” to fetch the name, logo and banner',
    'อัตโนมัติ': 'Auto', 
    'ยกเลิก': 'Cancel', 'บันทึก': 'Save', 'กรุณาใส่ที่อยู่เซิร์ฟเวอร์': 'Please enter a server address',
    'ตรวจสอบไม่สำเร็จ': 'Check failed', 
    '(ยังบันทึกได้)': '(you can still save it)',
    // toasts
    'เพิ่มเซิร์ฟเวอร์แล้ว': 'Server added', 'ลบเซิร์ฟเวอร์แล้ว': 'Server deleted',
    'คัดลอกที่อยู่แล้ว': 'Address copied', 'อัปเดตสถานะแล้ว': 'Status updated', 'ยังไม่มีเซิร์ฟเวอร์ในลิสต์': 'No servers in your list yet',
    'กำลังเปิด FiveM': 'Opening FiveM', 'เปิด FiveM ไม่สำเร็จ': 'Could not open FiveM', 'เปิด FiveM': 'Open FiveM', 'ล้างคำค้นหา': 'Clear search', 'ค้นหาชื่อเซิร์ฟ หรือวาง IP / ลิงก์ cfx.re': 'Search servers, or paste an IP / cfx.re link', 'ใกล้เต็ม': 'Almost full', 'ส่วนตัว': 'Private', 'สำเร็จ': 'Success', 'ผิดพลาด': 'Error', 'ข้อมูล': 'Information', 'คำเตือน': 'Warning', 'ซ่อนเซิร์ฟส่วนตัว': 'Hide private', 'ซ่อนเซิร์ฟเต็ม': 'Hide full', 'คนเยอะสุด': 'Most players', 'ชื่อ ก-ฮ': 'Name A-Z', 'ไม่พบ FiveM ในเครื่องนี้': 'FiveM was not found on this PC', 'ต้องติดตั้ง FiveM ก่อนถึงจะเข้าเซิร์ฟได้ ถ้าติดตั้งไว้ที่อื่น เลือกไฟล์ FiveM.exe เองได้': 'Install FiveM to join servers. If it is installed somewhere else, pick FiveM.exe yourself.', 'เลือกไฟล์': 'Pick file', 'เพื่อยืนยัน': 'to confirm', 'พิมพ์คำว่า': 'Type', 'ไม่พบ FiveM ในเครื่อง — กำลังลองเปิดผ่านลิงก์ fivem:// (ถ้าไม่ขึ้น ให้ติดตั้ง FiveM ก่อน)': 'FiveM not found — trying the fivem:// link (install FiveM if nothing opens)', 'แก้ไขที่อยู่เซิร์ฟ': 'Edit server address', 'เช่น 103.91.190.199:30120 หรือ cfx.re/join/abc123': 'e.g. 103.91.190.199:30120 or cfx.re/join/abc123', 'ใส่ IP:พอร์ต, โดเมน หรือลิงก์ cfx.re/join แล้วกด “ตรวจสอบ”': 'Enter an IP:port, domain or cfx.re/join link, then click “Check”', 'ออฟไลน์ หรือเชื่อมต่อไม่ได้ (ยังบันทึกได้)': 'Offline or unreachable (you can still save it)', 'บันทึกแล้ว': 'Saved', 'เซิร์ฟของฉัน': 'My servers', 'เซิร์ฟสาธารณะ': 'Public servers', 'เพิ่มเซิร์ฟ / IP': 'Add server / IP', 'เพิ่มเซิร์ฟของคุณ': 'Add your server', 'ใส่ IP หรือลิงก์ของเซิร์ฟ (รวมเซิร์ฟส่วนตัว) แล้วจะอยู่ตรงนี้ กดเข้าได้ทุกครั้ง': 'Add a server IP or link (private servers too) and it stays here, ready to join', 'ดับเบิลคลิกเพื่อเข้าเซิร์ฟ': 'Double-click to join', 'บันทึกเซิร์ฟนี้ไว้ใน “เซิร์ฟของฉัน” แล้ว — กดเล่นจากรายการด้านบนได้เลย': 'This server is saved in “My servers” — play it from the top of the list', '★ ไปที่เซิร์ฟของฉัน': '★ Go to my server', 'เซิร์ฟนี้ตั้งเป็นส่วนตัว เข้าจากรายชื่อไม่ได้ — ขอ IP หรือลิงก์จาก Discord ของเซิร์ฟ แล้ววางด้านล่าง ระบบจะบันทึกไว้ใน “เซิร์ฟของฉัน” ให้กดเข้าได้ทุกครั้ง': 'This server is private and cannot be joined from the list — get its IP or link from the server’s Discord and paste it below. It will be saved in “My servers” so you can join anytime.', 'เช่น 103.91.190.199:30120': 'e.g. 103.91.190.199:30120', 'ที่อยู่ไม่ถูกต้อง ลองวาง IP:พอร์ต หรือลิงก์ cfx.re/join': 'Invalid address — paste an IP:port or a cfx.re/join link', 'จำนวนผู้เล่น': 'Players', 'คัดลอก': 'Copy', 'เข้าเซิร์ฟจากที่อยู่นี้โดยตรง': 'Join this address directly', 'เข้าเลย': 'Join', 'ที่อยู่ไม่ถูกต้อง หรือเปิด FiveM ไม่สำเร็จ': 'Invalid address, or FiveM could not be opened', 'ลองพิมพ์คำอื่น เปลี่ยนเป็น “ทั้งหมด” หรือวาง IP / ลิงก์ cfx.re ของเซิร์ฟ': 'Try another word, switch to “All”, or paste the server IP / cfx.re link', 'ปิง': 'Ping', 'ความจุ': 'Capacity', 'กู้คืนข้อมูลสำรอง': 'Restore backup', 'โปรแกรมจะสำรองลิสต์เดิมไว้อัตโนมัติทุกครั้งที่จำนวนเซิร์ฟลดลง (เก็บ 10 ครั้งล่าสุด) เลือกจุดที่ต้องการกู้คืน — การตั้งค่าปัจจุบันจะไม่เปลี่ยน': 'The launcher automatically backs up your list whenever the number of servers goes down (last 10 kept). Pick one to restore — your current settings stay as they are.', 'ยังไม่มีข้อมูลสำรอง': 'No backups yet', 'จะเริ่มสำรองเมื่อมีการลบเซิร์ฟออกจากลิสต์': 'Backups are made when servers are removed from your list', 'ปิด': 'Close', 'อ่านไฟล์สำรองไม่ได้': "Couldn't read that backup", 'รูปพื้นหลัง': 'Background image', 'ลบรูป': 'Remove', 
    'ตั้งค่าตำแหน่ง FiveM แล้ว': 'FiveM location set', 'ส่งออกข้อมูลแล้ว': 'Data exported', 'ไฟล์ไม่ถูกต้อง': 'Invalid file',
    'รีเซ็ตเรียบร้อย': 'Reset complete', 'ล้างแคชไม่สำเร็จ': 'Could not clear cache',
    // backend errors
    'รูปแบบที่อยู่ไม่ถูกต้อง': 'Invalid address format', 'เชื่อมต่อไม่ได้ (ออฟไลน์หรือปิด info)': 'Cannot connect (offline or info disabled)',
    'หมดเวลาเชื่อมต่อ': 'Connection timed out', 'ไม่พบเซิร์ฟเวอร์': 'Server not found', 'กรุณาปิด FiveM ก่อนล้างแคช': 'Please close FiveM before clearing the cache',
    'เปิด FiveM ไม่สำเร็จ (ติดตั้ง FiveM แล้วหรือยัง?)': 'Could not open FiveM (is FiveM installed?)',
    // settings
    'ภาษา': 'Language', 'เลือกภาษาที่ใช้ในโปรแกรม': 'Choose the language used in the app',
    'ตำแหน่ง FiveM': 'FiveM location', 'โปรแกรมจะค้นหา FiveM.exe ให้อัตโนมัติ หากติดตั้งไว้ที่อื่นสามารถเลือกไฟล์เองได้': 'FiveM.exe is detected automatically. If you installed it elsewhere, pick the file yourself.',
    'พบแล้ว': 'Found', 'ไม่พบ': 'Not found', 'ไม่พบ FiveM.exe — ตอนกดเล่นจะเปิดผ่านลิงก์ fivem:// แทน (ต้องติดตั้ง FiveM ก่อน)': 'FiveM.exe not found — Play will use the fivem:// link instead (FiveM must be installed)',
    'เลือกไฟล์ FiveM.exe': 'Choose FiveM.exe', 'ดาวน์โหลด FiveM': 'Download FiveM',
    'หลังกดเล่น': 'After pressing Play', 'ให้ Launcher ทำอะไรหลังเปิดเกม': 'What the launcher does after starting the game',
    'ย่อหน้าต่าง': 'Minimize', 'ปิดโปรแกรม': 'Quit', 'ไม่ทำอะไร': 'Nothing',
    'ปิด': 'Off', '15 วิ': '15s', 
    'การใช้ทรัพยากร': 'Resource usage',
    'โปรแกรมจะทำงานเต็มที่เฉพาะตอนคุณกำลังใช้อยู่ — ไปเล่นเกมหรือเปิดโปรแกรมอื่น จะผ่อนแรงลงเอง และตอนย่อหน้าต่างจะหยุดรีเฟรชทั้งหมด คืนหน่วยความจำและยกความสำคัญของ CPU ให้เกม':
      'The launcher only works at full speed while you are using it — when you switch to the game or another app it slows down, and when minimized it stops refreshing entirely to give memory and CPU priority to the game.',
    'ประหยัดสุด': 'Eco', 'สมดุล (แนะนำ)': 'Balanced (recommended)', 'เต็มที่': 'Full',
    'เอฟเฟกต์การเคลื่อนไหว': 'Motion effects',
    'เต็ม (ลื่นสุด)': 'Full (smoothest)', 'ลด': 'Reduced',
    'ล้างแคช FiveM': 'Clear FiveM cache', 'ล้างแคช FiveM?': 'Clear FiveM cache?', 'ล้างแคช': 'Clear cache',
    'แก้อาการเกมเด้ง โหลดเข้าเซิร์ฟค้าง หรือพื้นที่เต็ม — ลบ crashes, data/cache, server-cache และ server-cache-priv (ต้องปิด FiveM ก่อน)': 'Fixes crashes, stuck loading screens or a full disk — deletes crashes, data/cache, server-cache and server-cache-priv (close FiveM first)',
    'กำลังสแกน...': 'Scanning...', 'ไม่พบโฟลเดอร์ FiveM.app': 'FiveM.app folder not found', 'ไม่มี': 'none', 'รวม': 'Total',
    'FiveM กำลังเปิดอยู่ — ปิดเกมก่อนแล้วค่อยล้างแคช': 'FiveM is running — close the game before clearing the cache',
    'ครั้งถัดไปที่เข้าเซิร์ฟเวอร์ FiveM จะโหลดไฟล์ของเซิร์ฟเวอร์ใหม่ อาจใช้เวลานานขึ้นเล็กน้อย': 'The next time you join a server, FiveM will re-download its files, which may take a little longer.',
    'ข้อมูลของคุณ': 'Your data', 'สำรองลิสต์เซิร์ฟเวอร์และการตั้งค่าไว้เป็นไฟล์ หรือย้ายไปเครื่องอื่น': 'Back up your server list and settings to a file, or move them to another PC',
    'ส่งออกข้อมูล': 'Export data', 'นำเข้าข้อมูล': 'Import data', 'รีเซ็ตทั้งหมด': 'Reset everything', 'รีเซ็ตทั้งหมด?': 'Reset everything?', 'รีเซ็ต': 'Reset',
    'การอัปเดต': 'Updates', 'ตรวจหาเวอร์ชันใหม่': 'Check for updates', 'กำลังตรวจสอบ...': 'Checking...',
    'คุณใช้เวอร์ชันล่าสุดแล้ว': 'You are on the latest version', 'ยังไม่ได้ตั้งค่าที่อยู่สำหรับอัปเดต': 'Update source is not configured yet',
    'ตรวจหาอัปเดตไม่สำเร็จ': 'Could not check for updates', 'อัปเดตเลย': 'Update now', 'ภายหลัง': 'Later',
    'กำลังดาวน์โหลดอัปเดต...': 'Downloading update...', 'ดาวน์โหลดอัปเดตไม่สำเร็จ': 'Update download failed',
    'โปรแกรมจะตรวจหาเวอร์ชันใหม่ให้อัตโนมัติทุกครั้งที่เปิด': 'The launcher checks for a new version automatically every time it starts',
    // browse
    'เซิร์ฟไทย': 'Thai servers', 'โหลดรายชื่อใหม่': 'Reload list', 
    'เพิ่ม': 'Add', 'แสดงเพิ่ม': 'Show more', 'ลองใหม่': 'Retry',
    'โหลดรายชื่อเซิร์ฟไม่สำเร็จ': 'Could not load the server list',
    'กำลังโหลดรายชื่อเซิร์ฟ... ครั้งแรกอาจใช้เวลาสักครู่': 'Loading the server list... the first load may take a moment',
    'ไม่พบเซิร์ฟที่ตรงกับคำค้น': 'No servers match your search', 
    'เซิร์ฟนี้ตั้งเป็นส่วนตัว': 'This server is private',
    // watch / help
    'แจ้งเมื่อว่าง': 'Notify when free', '🔔 แจ้งเมื่อว่าง': '🔔 Notify when free', '🔔 แจ้งเมื่อเปิด': '🔔 Notify when online', '🔔 รอที่ว่าง · ยกเลิก': '🔔 Waiting for a slot · Cancel', '🔔 รอเซิร์ฟเปิด · ยกเลิก': '🔔 Waiting to go online · Cancel', 'แจ้งเมื่อเปิด': 'Notify when online', 'รอที่ว่าง': 'Waiting for a slot', 'รอเซิร์ฟเปิด': 'Waiting to go online',
    'ยกเลิก': 'Cancel', 'กดเพื่อยกเลิก': 'Click to cancel', 'ยกเลิกการแจ้งเตือนแล้ว': 'Notification cancelled', 'ตั้งแจ้งเตือนไม่สำเร็จ': 'Could not set the notification',
    'ยกเลิกการแจ้งเตือน': 'Cancel notification', 'แจ้งเตือนเมื่อมีที่ว่าง': 'Notify when a slot opens',
    'ช่วยเหลือ': 'Help', 'เจอปัญหา หรืออยากได้ฟีเจอร์อะไร บอกผู้พัฒนาได้ที่นี่ (ต้องมีบัญชี GitHub ฟรี)': 'Found a problem or want a feature? Tell the developer here (requires a free GitHub account)',
    'แจ้งปัญหา': 'Report a problem', 'เสนอฟีเจอร์': 'Suggest a feature', 'เว็บไซต์': 'Website',
    // groups
    'สร้างกลุ่ม': 'New group', 'สร้างกลุ่มใหม่': 'New group', 'เปลี่ยนชื่อกลุ่ม': 'Rename group', 'ชื่อกลุ่ม': 'Group name',
    'เช่น เซิร์ฟหลัก, ลองเล่น': 'e.g. Main, Trying out', 'สร้างกลุ่มแล้ว': 'Group created', 'เปลี่ยนชื่อกลุ่มแล้ว': 'Group renamed',
    '↑ เลื่อนกลุ่มขึ้น': '↑ Move group up', '↓ เลื่อนกลุ่มลง': '↓ Move group down', 'ลบกลุ่ม': 'Delete group',
    'ลบกลุ่มแล้ว (เซิร์ฟในกลุ่มย้ายไป “ไม่ได้จัดกลุ่ม”)': 'Group deleted (its servers moved to “Ungrouped”)',
    'ไม่ได้จัดกลุ่ม': 'Ungrouped', 'ตัวกรอง': 'Filter', 'ข้อมูลเซิร์ฟ': 'Server info', 'เรียงตาม': 'Sort by', 'กลุ่ม': 'Group', 'เซิร์ฟที่คุณบันทึกไว้': 'Servers you saved', 'ยังไม่มีเซิร์ฟในกลุ่มนี้ — คลิกขวาที่เซิร์ฟแล้วเลือกกลุ่ม': 'No servers here yet — right-click a server to move it into this group', 'ดับเบิลคลิกเพื่อเข้า': 'double-click to join', 'ย้ายไปกลุ่ม': 'Move to group', 'กลุ่มใหม่...': 'New group...', 
    'จัดการกลุ่ม': 'Group options',
    'คัดลอกไม่สำเร็จ': 'Copy failed',
  };

  // ข้อความที่มีตัวเลข/ชื่อแทรกอยู่
  const RX = [
    [/^จาก (\d+) เซิร์ฟในลิสต์ของคุณ$/, (m) => `from ${m[1]} server${m[1] === '1' ? '' : 's'} in your list`],
    [/^กำลังเข้า (.+)$/, (m) => `Joining ${m[1]}`],
    [/^ออนไลน์ · ([\d,]+)\/([\d,]+) ผู้เล่น · (\d+) ms$/, (m) => `Online · ${m[1]}/${m[2]} players · ${m[3]} ms`],
    [/^บันทึก (.+) ไว้ในเซิร์ฟของฉันแล้ว$/, (m) => `Saved ${m[1]} to My servers`],
    [/^บันทึกไว้ (\d+) เซิร์ฟ$/, (m) => `${m[1]} saved`],
    [/^(\d+) เซิร์ฟ$/, (m) => `${m[1]} servers`],
    [/^กู้คืน (\d+) เซิร์ฟเวอร์แล้ว$/, (m) => `Restored ${m[1]} servers`],
    [/^นำเข้า (\d+) เซิร์ฟเวอร์แล้ว$/, (m) => `Imported ${m[1]} servers`],
    [/^ล้าง (.+)$/, (m) => `Clear ${m[1]}`],
    [/^ล้างแคชเรียบร้อย คืนพื้นที่ (.+)$/, (m) => `Cache cleared — freed ${m[1]}`],
    [/^จะลบ (\d+) โฟลเดอร์นี้ใน FiveM\.app — ไม่กระทบไฟล์เกม, การตั้งค่า หรือบัญชี$/, (m) => `This deletes these ${m[1]} folders inside FiveM.app — your game files, settings and account are not affected.`],
    [/^ลิสต์เซิร์ฟเวอร์ (\d+) รายการและการตั้งค่าทั้งหมดจะถูกลบ แนะนำให้ส่งออกข้อมูลเก็บไว้ก่อน$/, (m) => `Your ${m[1]} servers and all settings will be deleted. Consider exporting your data first.`],
    [/^เซิร์ฟในลิสต์ (\d+) รายการ$/, (m) => `${m[1]} servers in your list`],
    [/^มีเวอร์ชันใหม่ (.+)$/, (m) => `New version ${m[1]} available`],
    [/^เวอร์ชัน (.+)$/, (m) => `Version ${m[1]}`],
    [/^(\d+) ms$/, (m) => `${m[1]} ms`],
    [/^พบ ([\d,]+) เซิร์ฟ$/, (m) => `${m[1]} servers found`],
    [/^ผู้เล่นรวม ([\d,]+)$/, (m) => `${m[1]} players`],
    [/^อัปเดตเมื่อ (.*)$/, (m) => `updated ${m[1]}`],
    [/^เพิ่ม (.+) แล้ว$/, (m) => `Added ${m[1]}`],
    [/^จะแจ้งเตือนเมื่อ (.+) มีที่ว่าง$/, (m) => `You'll be notified when ${m[1]} has a free slot`],
    [/^จะแจ้งเตือนเมื่อ (.+) เปิด$/, (m) => `You'll be notified when ${m[1]} is online`],
    [/^(.+) มีที่ว่างแล้ว!$/, (m) => `${m[1]} has a free slot!`],
    [/^(.+) เปิดแล้ว!$/, (m) => `${m[1]} is online!`],
    [/^([\d,]+\/[\d,]+) ผู้เล่น$/, (m) => `${m[1]} players`],
    [/^(.+) —$/, (m) => `${tr(m[1])} —`],
  ];

  const hasThai = (s) => /[฀-๿]/.test(s);

  function tr(core) {
    if (!hasThai(core)) return core;
    if (EN[core] != null) return EN[core];
    for (const [re, fn] of RX) { const m = core.match(re); if (m) return fn(m); }
    // ข้อความยาวที่ต่อกันด้วย · หรือ —
    for (const sep of [' — ', ' · ']) {
      if (core.includes(sep)) return core.split(sep).map((p) => tr(p.trim())).join(sep);
    }
    if (/^ผู้เล่น (.+)$/.test(core)) return core.replace(/^ผู้เล่น/, 'players');
    return core;
  }

  // แปลข้อความทั้งก้อน (เก็บช่องว่างหัว/ท้ายไว้)
  function translate(s) {
    if (!s || !hasThai(s)) return s;
    const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const out = tr(m[2]);
    return out === m[2] ? s : m[1] + out + m[3];
  }

  let lang = 'th';
  const ATTRS = ['placeholder', 'title', 'aria-label'];
  function walk(root) {
    if (lang !== 'en' || !root) return;
    if (root.nodeType === 3) {
      if (hasThai(root.nodeValue)) { const v = translate(root.nodeValue); if (v !== root.nodeValue) root.nodeValue = v; }
      return;
    }
    if (root.nodeType !== 1 || root.closest?.('[data-no-i18n]')) return;
    for (const a of ATTRS) { const v = root.getAttribute?.(a); if (v && hasThai(v)) root.setAttribute(a, translate(v)); }
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = tw.nextNode())) {
      if (n.nodeType === 3) {
        if (hasThai(n.nodeValue) && !n.parentElement?.closest('[data-no-i18n], input, textarea')) {
          const v = translate(n.nodeValue);
          if (v !== n.nodeValue) n.nodeValue = v;
        }
      } else if (!n.closest('[data-no-i18n]')) {
        for (const a of ATTRS) { const v = n.getAttribute(a); if (v && hasThai(v)) n.setAttribute(a, translate(v)); }
      }
    }
  }

  const obs = new MutationObserver((muts) => {
    if (lang !== 'en') return;
    for (const m of muts) {
      if (m.type === 'characterData') walk(m.target);
      else m.addedNodes.forEach(walk);
    }
  });

  window.I18N = {
    get lang() { return lang; },
    detect() { return /^th/i.test(navigator.language || '') ? 'th' : 'en'; },
    set(l) {
      lang = l === 'en' ? 'en' : 'th';
      document.documentElement.lang = lang;
      obs.disconnect();
      if (lang === 'en') {
        walk(document.body);
        obs.observe(document.body, { childList: true, subtree: true, characterData: true });
      }
    },
    t: translate,
  };
})();
