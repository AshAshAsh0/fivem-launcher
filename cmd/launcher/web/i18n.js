// ระบบสองภาษา (ไทย / English)
// ข้อความในโค้ดเขียนเป็นภาษาไทย เมื่อเลือก English จะแปลข้อความบนหน้าจอให้อัตโนมัติ
(() => {
  const EN = {
    // nav / chrome
    'หน้าหลัก': 'Home', 'เซิร์ฟโปรด': 'Favorite servers', 'ตั้งค่า': 'Settings', 'สลับธีม': 'Switch theme',
    'ย่อหน้าต่าง': 'Minimize', 'ปิดหน้าต่าง': 'Close',
    // home
    'เลือกเซิร์ฟที่ชอบ แล้วกดเล่นได้เลย': 'Pick a server and hit play',
    'รวมเซิร์ฟที่คุณกดหัวใจไว้': 'Servers you have hearted',
    'เพิ่มเซิร์ฟเวอร์': 'Add server', 'เริ่มกันเลย ✦': "Let's go ✦", 'ยังไม่มีเซิร์ฟเวอร์': 'No servers yet',
    'เพิ่มเซิร์ฟเวอร์แรกของคุณ แล้วเข้าเกมได้ในคลิกเดียว': 'Add your first server and join in one click',
    'เปิด FiveM เฉย ๆ': 'Just open FiveM', 'เซิร์ฟของคุณ ✦': 'Your server ✦', 'เล่นล่าสุด ✦': 'Last played ✦', 'เล่นล่าสุด': 'Last played', 'ล่าสุด': 'Recent',
    'ยังไม่ได้เล่นเซิร์ฟไหนเลย': "You haven't played any server yet", 'กดเล่นเซิร์ฟสักตัว แล้วจะขึ้นที่นี่ เรียงจากเล่นล่าสุด': 'Play a server and it shows up here, most recent first',
    'ออนไลน์': 'Online', 'ออฟไลน์': 'Offline', 'ผู้เล่น': 'players', 'เล่นเลย': 'Play now', 'เล่น': 'Play', 'ลองเข้า': 'Try join',
    'ออนไลน์ตอนนี้': 'Online now', 'ยังว่างอยู่เลย เพิ่มเซิร์ฟกัน': 'Nothing here yet — add a server',
    'ผู้เล่นรวม': 'Total players', 'คนกำลังเล่นอยู่ในลิสต์ของคุณ': 'playing on your servers',
    'หาเซิร์ฟเวอร์...': 'Search servers...', 'ทั้งหมด': 'All', 'โปรด': 'Favorites', 'รีเฟรชสถานะ': 'Refresh status',
    'ลิสต์ยังว่างอยู่': 'Your list is empty', 'กด “เพิ่มเซิร์ฟเวอร์” เพื่อเริ่มต้น': 'Click “Add server” to get started',
    'ยังไม่มีเซิร์ฟโปรด': 'No favorites yet', 'กดหัวใจบนการ์ดเพื่อเพิ่มเข้าลิสต์นี้': 'Tap the heart on a card to add it here',
    'ไม่พบเซิร์ฟเวอร์': 'No servers found', 'ลองเปลี่ยนคำค้นหรือตัวกรองดู': 'Try a different search or filter',
    'เพิ่มเติม': 'More', 'เต็ม': 'Full',
    // menu
    'แก้ไข': 'Edit', 'คัดลอกที่อยู่': 'Copy address', 'เปิด Discord': 'Open Discord', 'รีเฟรชเซิร์ฟนี้': 'Refresh this server',
    'ลบเซิร์ฟเวอร์': 'Delete server', 'ลบเซิร์ฟเวอร์?': 'Delete server?', 'ลบ': 'Delete', 'ออกจากลิสต์ของคุณ': 'from your list',
    // modal
    'เพิ่มเซิร์ฟเวอร์ใหม่': 'Add new server', 'แก้ไขเซิร์ฟเวอร์': 'Edit server', 'ที่อยู่เซิร์ฟเวอร์': 'Server address',
    'ตรวจสอบ': 'Check', 'กำลังเช็ก...': 'Checking...',
    'รองรับโดเมนทุกแบบ (เช่น play.yourserver.com), IP:Port (ไม่ใส่พอร์ต = 30120), ลิงก์แบบมี path (เช่น https://play.city.co.th/server1), คำสั่ง connect จาก F8 และลิงก์/โค้ด cfx.re/join':
      'Accepts any domain (e.g. play.yourserver.com), IP:Port (default port 30120), links with a path (e.g. https://play.city.co.th/server1), the F8 connect command and cfx.re/join links/codes',
    'play.yourserver.com หรือ 127.0.0.1:30120': 'play.yourserver.com or 127.0.0.1:30120',
    'ชื่อเซิร์ฟเวอร์': 'Server name', 'เช่น เมืองหลวง RP': 'e.g. Capital City RP',
    'กด “ตรวจสอบ” เพื่อดึงชื่อ โลโก้ และแบนเนอร์': 'Click “Check” to fetch the name, logo and banner',
    'หมวดหมู่': 'Category', 'เลือก 1 อย่าง': 'pick one', 'คำอธิบาย': 'Description', 'ไม่บังคับ': 'optional',
    'บอกสั้น ๆ ว่าเซิร์ฟเวอร์นี้เป็นแบบไหน': 'A short description of this server',
    'รูปแบนเนอร์ (URL)': 'Banner image (URL)', 'รูปโลโก้ (URL)': 'Logo image (URL)',
    'รองรับ PNG, JPG, WEBP และ GIF แบบขยับได้ — เว้นว่างไว้จะใช้แบนเนอร์/โลโก้ที่ดึงจากเซิร์ฟเวอร์': 'PNG, JPG, WEBP and animated GIF supported — leave empty to use the banner/logo from the server',
    'ลิงก์ Discord': 'Discord link', 'โทนการ์ด': 'Card color', 'อัตโนมัติ': 'Auto', 'กำหนดเอง': 'Custom',
    'อัตโนมัติจากโลโก้': 'Auto from logo', 'เลือกสีเอง': 'Pick a color', 'ลบโลโก้': 'Remove logo',
    'ยกเลิก': 'Cancel', 'บันทึก': 'Save', 'กรุณาใส่ที่อยู่เซิร์ฟเวอร์': 'Please enter a server address',
    'ตรวจสอบไม่สำเร็จ': 'Check failed', 'พบโลโก้': 'logo found', 'ไม่พบโลโก้': 'no logo', 'พบแบนเนอร์': 'banner found', 'ไม่พบแบนเนอร์': 'no banner',
    '(ยังบันทึกได้)': '(you can still save it)',
    // toasts
    'เพิ่มเซิร์ฟเวอร์แล้ว': 'Server added', 'บันทึกการแก้ไขแล้ว': 'Changes saved', 'ลบเซิร์ฟเวอร์แล้ว': 'Server deleted',
    'คัดลอกที่อยู่แล้ว': 'Address copied', 'อัปเดตสถานะแล้ว': 'Status updated', 'ยังไม่มีเซิร์ฟเวอร์ในลิสต์': 'No servers in your list yet',
    'กำลังเปิด FiveM': 'Opening FiveM', 'เปิด FiveM ไม่สำเร็จ': 'Could not open FiveM', 'ธีมซากุระ 🌸': 'Sakura theme 🌸', 'ธีมขาว-เทา': 'Mono theme', 'ธีม HUD': 'HUD theme', 'เลือกเซิร์ฟแล้วกดเล่น หรือดับเบิลคลิกเพื่อเข้าทันที': 'Pick a server and hit play, or double-click to join instantly', 'พิมพ์ชื่อเซิร์ฟ แนวเซิร์ฟ หรือวาง IP / ลิงก์ cfx.re': 'Type a server name or style, or paste an IP / cfx.re link', 'เข้าเซิร์ฟจากที่อยู่นี้โดยตรง': 'Join this address directly', 'เข้าเลย': 'Join', 'ที่อยู่ไม่ถูกต้อง หรือเปิด FiveM ไม่สำเร็จ': 'Invalid address, or FiveM could not be opened', 'ลองพิมพ์คำอื่น เปลี่ยนเป็น “ทั้งหมด” หรือวาง IP / ลิงก์ cfx.re ของเซิร์ฟ': 'Try another word, switch to “All”, or paste the server IP / cfx.re link', 'ถ้ามีที่อยู่แล้ว วาง IP หรือลิงก์นั้นในช่องค้นหาด้านบน แล้วกด “เข้าเลย” ได้ทันที': 'If you have its address, paste the IP or link into the search box above and click “Join”.', 'ปิง': 'Ping', 'ความจุ': 'Capacity', 'ลากเซิร์ฟมาวางที่นี่': 'Drag servers here', 'กู้คืนข้อมูลสำรอง': 'Restore backup', 'โปรแกรมจะสำรองลิสต์เดิมไว้อัตโนมัติทุกครั้งที่จำนวนเซิร์ฟลดลง (เก็บ 10 ครั้งล่าสุด) เลือกจุดที่ต้องการกู้คืน — การตั้งค่าปัจจุบันจะไม่เปลี่ยน': 'The launcher automatically backs up your list whenever the number of servers goes down (last 10 kept). Pick one to restore — your current settings stay as they are.', 'ยังไม่มีข้อมูลสำรอง': 'No backups yet', 'จะเริ่มสำรองเมื่อมีการลบเซิร์ฟออกจากลิสต์': 'Backups are made when servers are removed from your list', 'ปิด': 'Close', 'อ่านไฟล์สำรองไม่ได้': "Couldn't read that backup", 'รูปพื้นหลัง': 'Background image', 'ใช้รูปของคุณเป็นพื้นหลังหลังแผงกระจก เช่น ภาพแคปจากในเกม — โปรแกรมจะเบลอให้อัตโนมัติ (แสดงเฉพาะธีม HUD)': 'Use your own picture behind the glass panels, like an in-game screenshot — it gets blurred automatically (HUD theme only)', 'ไม่มีรูป': 'No image', 'เลือกรูป...': 'Choose image...', 'ลบรูป': 'Remove', 'ใช้ธีม HUD': 'Use HUD theme', 'ลบรูปพื้นหลังแล้ว': 'Background image removed', 'ตั้งรูปพื้นหลังแล้ว': 'Background image set', 'ใช้รูปนี้ไม่ได้ ลองรูปอื่นดูนะ': "Couldn't use that image — try another one", 'เทาดำโปร่ง ฟ้านีออน สไตล์เมนูในเกม': 'Smoky charcoal and neon blue, like an in-game menu', 'เกมมิ่ง': 'Gaming',
    'เลือกสไตล์ที่ใช่ — เรียบหรู น่ารัก หรือมืดแบบเมนูในเกม เปลี่ยนได้ทันที': 'Pick your style — clean, cute, or dark like an in-game menu. Switches instantly.',
    'ตั้งค่าตำแหน่ง FiveM แล้ว': 'FiveM location set', 'ส่งออกข้อมูลแล้ว': 'Data exported', 'ไฟล์ไม่ถูกต้อง': 'Invalid file',
    'รีเซ็ตเรียบร้อย': 'Reset complete', 'ล้างแคชไม่สำเร็จ': 'Could not clear cache',
    // backend errors
    'รูปแบบที่อยู่ไม่ถูกต้อง': 'Invalid address format', 'เชื่อมต่อไม่ได้ (ออฟไลน์หรือปิด info)': 'Cannot connect (offline or info disabled)',
    'หมดเวลาเชื่อมต่อ': 'Connection timed out', 'ไม่พบเซิร์ฟเวอร์': 'Server not found', 'กรุณาปิด FiveM ก่อนล้างแคช': 'Please close FiveM before clearing the cache',
    'เปิด FiveM ไม่สำเร็จ (ติดตั้ง FiveM แล้วหรือยัง?)': 'Could not open FiveM (is FiveM installed?)',
    // settings
    'ปรับให้เข้ากับสไตล์คุณ': 'Make it yours', 'ธีมโปรแกรม': 'Theme',
    'เลือกสไตล์ที่ใช่ — เท่ ๆ คูล ๆ หรือคาวาอิ น่ารัก ๆ เปลี่ยนได้ทันที': 'Pick your style — clean and cool, or cute and kawaii. Switches instantly.',
    'ขาว-เทา': 'Mono', 'ขาวสะอาด เทาละมุน เรียบหรู': 'Clean white, soft gray, understated', 'มินิมอล': 'Minimal',
    'ซากุระ': 'Sakura', 'พาสเทลชมพู สว่าง สดใส': 'Pastel pink, bright and cheerful', 'คาวาอิ': 'Kawaii',
    'ภาษา': 'Language', 'เลือกภาษาที่ใช้ในโปรแกรม': 'Choose the language used in the app',
    'ตำแหน่ง FiveM': 'FiveM location', 'โปรแกรมจะค้นหา FiveM.exe ให้อัตโนมัติ หากติดตั้งไว้ที่อื่นสามารถเลือกไฟล์เองได้': 'FiveM.exe is detected automatically. If you installed it elsewhere, pick the file yourself.',
    'พบแล้ว': 'Found', 'ไม่พบ': 'Not found', 'ไม่พบ FiveM.exe — ตอนกดเล่นจะเปิดผ่านลิงก์ fivem:// แทน (ต้องติดตั้ง FiveM ก่อน)': 'FiveM.exe not found — Play will use the fivem:// link instead (FiveM must be installed)',
    'เลือกไฟล์ FiveM.exe': 'Choose FiveM.exe', 'ดาวน์โหลด FiveM': 'Download FiveM',
    'หลังกดเล่น': 'After pressing Play', 'ให้ Launcher ทำอะไรหลังเปิดเกม': 'What the launcher does after starting the game',
    'ย่อหน้าต่าง': 'Minimize', 'ปิดโปรแกรม': 'Quit', 'ไม่ทำอะไร': 'Nothing',
    'รีเฟรชสถานะอัตโนมัติ': 'Auto refresh', 'อัปเดตจำนวนผู้เล่นและปิงทุก ๆ': 'Update player counts and ping every',
    'ปิด': 'Off', '15 วิ': '15s', '30 วิ': '30s', '60 วิ': '60s',
    'การใช้ทรัพยากร': 'Resource usage',
    'โปรแกรมจะทำงานเต็มที่เฉพาะตอนคุณกำลังใช้อยู่ — ไปเล่นเกมหรือเปิดโปรแกรมอื่น จะผ่อนแรงลงเอง และตอนย่อหน้าต่างจะหยุดรีเฟรชทั้งหมด คืนหน่วยความจำและยกความสำคัญของ CPU ให้เกม':
      'The launcher only works at full speed while you are using it — when you switch to the game or another app it slows down, and when minimized it stops refreshing entirely to give memory and CPU priority to the game.',
    'ประหยัดสุด': 'Eco', 'สมดุล (แนะนำ)': 'Balanced (recommended)', 'เต็มที่': 'Full',
    'เคอร์เซอร์เมาส์': 'Mouse cursor', 'เปลี่ยนรูปเมาส์ตามธีมที่เลือก': 'Change the cursor to match the theme', 'ตามธีม': 'Themed', 'แบบปกติ': 'Default',
    'เอฟเฟกต์การเคลื่อนไหว': 'Motion effects',
    'เต็ม = เลื่อนหน้าจอแบบนุ่ม การ์ดเอียงตามเมาส์ และแอนิเมชันครบ / ลด = ปิดการเคลื่อนไหวทั้งหมด เหมาะกับคนที่เวียนหัวง่าย': 'Full = smooth scrolling, cards tilt with the mouse and all animations / Reduced = no motion, better if motion makes you dizzy',
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
    'ค้นหาเซิร์ฟ': 'Browse servers', 'จากรายชื่อเซิร์ฟสาธารณะของ FiveM': 'From the public FiveM server list',
    'พิมพ์ชื่อเซิร์ฟ หรือแนวเซิร์ฟ เช่น roleplay': 'Type a server name or style, e.g. roleplay',
    'เซิร์ฟไทย': 'Thai servers', 'โหลดรายชื่อใหม่': 'Reload list', 'เข้าเซิร์ฟนี้เลย': 'Join this server',
    'อยู่ในลิสต์แล้ว': 'In your list', 'เพิ่ม': 'Add', 'แสดงเพิ่ม': 'Show more', 'ลองใหม่': 'Retry',
    'โหลดรายชื่อเซิร์ฟไม่สำเร็จ': 'Could not load the server list',
    'กำลังโหลดรายชื่อเซิร์ฟ... ครั้งแรกอาจใช้เวลาสักครู่': 'Loading the server list... the first load may take a moment',
    'ไม่พบเซิร์ฟที่ตรงกับคำค้น': 'No servers match your search', 'ลองพิมพ์คำอื่น หรือเปลี่ยนเป็น “ทั้งหมด”': 'Try another word, or switch to “All”',
    'กด “เพิ่มเซิร์ฟเวอร์” เพื่อเริ่มต้น หรือหาเซิร์ฟจากรายชื่อของ FiveM': 'Click “Add server” to get started, or find one in the FiveM server list',
    '🔒 ส่วนตัว': '🔒 Private', 'ทำไมเข้าไม่ได้?': "Why can't I join?", 'เซิร์ฟนี้ตั้งเป็นส่วนตัว': 'This server is private',
    '🔒 เซิร์ฟส่วนตัว': '🔒 Private server', 'เข้าใจแล้ว': 'Got it',
    'ตั้งค่าเป็นเซิร์ฟส่วนตัว จึงเข้าจากรายชื่อของ FiveM ไม่ได้ (ปุ่ม Connect ในตัว FiveM เองก็กดไม่ได้เช่นกัน)': "is set to private, so it can't be joined from the FiveM server list (FiveM's own Connect button is disabled too).",
    'ต้องเข้าผ่านช่องทางของเซิร์ฟเอง เช่น Launcher เฉพาะของเซิร์ฟ หรือลิงก์/IP ที่แจกใน Discord ของเซิร์ฟ — ถ้ามีที่อยู่แล้ว กด “เพิ่มเซิร์ฟเวอร์” ที่หน้าหลักแล้ววางที่อยู่นั้นได้เลย': "Join through the server's own channel instead — its own launcher, or the link/IP shared in its Discord. If you have the address, click “Add server” on the home page and paste it.",
    // watch / help
    'แจ้งเมื่อว่าง': 'Notify when free', '🔔 แจ้งเมื่อว่าง': '🔔 Notify when free', '🔔 แจ้งเมื่อเปิด': '🔔 Notify when online', '🔔 รอที่ว่าง · ยกเลิก': '🔔 Waiting for a slot · Cancel', '🔔 รอเซิร์ฟเปิด · ยกเลิก': '🔔 Waiting to go online · Cancel', 'แจ้งเมื่อเปิด': 'Notify when online', 'รอที่ว่าง': 'Waiting for a slot', 'รอเซิร์ฟเปิด': 'Waiting to go online',
    'ยกเลิก': 'Cancel', 'กดเพื่อยกเลิก': 'Click to cancel', 'ยกเลิกการแจ้งเตือนแล้ว': 'Notification cancelled', 'ตั้งแจ้งเตือนไม่สำเร็จ': 'Could not set the notification',
    'ยกเลิกการแจ้งเตือน': 'Cancel notification', 'แจ้งเตือนเมื่อเซิร์ฟเปิด': 'Notify when online', 'แจ้งเตือนเมื่อมีที่ว่าง': 'Notify when a slot opens',
    'ช่วยเหลือ': 'Help', 'เจอปัญหา หรืออยากได้ฟีเจอร์อะไร บอกผู้พัฒนาได้ที่นี่ (ต้องมีบัญชี GitHub ฟรี)': 'Found a problem or want a feature? Tell the developer here (requires a free GitHub account)',
    'แจ้งปัญหา': 'Report a problem', 'เสนอฟีเจอร์': 'Suggest a feature', 'เว็บไซต์': 'Website',
    // groups
    'สร้างกลุ่ม': 'New group', 'สร้างกลุ่มใหม่': 'New group', 'เปลี่ยนชื่อกลุ่ม': 'Rename group', 'ชื่อกลุ่ม': 'Group name',
    'เช่น เซิร์ฟหลัก, ลองเล่น': 'e.g. Main, Trying out', 'สร้างกลุ่มแล้ว': 'Group created', 'เปลี่ยนชื่อกลุ่มแล้ว': 'Group renamed',
    '↑ เลื่อนกลุ่มขึ้น': '↑ Move group up', '↓ เลื่อนกลุ่มลง': '↓ Move group down', 'ลบกลุ่ม': 'Delete group',
    'ลบกลุ่มแล้ว (เซิร์ฟในกลุ่มย้ายไป “ไม่ได้จัดกลุ่ม”)': 'Group deleted (its servers moved to “Ungrouped”)',
    'ไม่ได้จัดกลุ่ม': 'Ungrouped', 'ย้ายไปกลุ่ม': 'Move to group', 'กลุ่มใหม่...': 'New group...', 'ย้ายไปกลุ่มใหม่...': 'Move to a new group...',
    'ลากการ์ดเซิร์ฟมาวางที่นี่': 'Drag server cards here', 'ย่อ/ขยายกลุ่ม': 'Collapse/expand', 'จัดการกลุ่ม': 'Group options',
    'คัดลอกไม่สำเร็จ': 'Copy failed',
  };

  // ข้อความที่มีตัวเลข/ชื่อแทรกอยู่
  const RX = [
    [/^จาก (\d+) เซิร์ฟในลิสต์ของคุณ$/, (m) => `from ${m[1]} server${m[1] === '1' ? '' : 's'} in your list`],
    [/^กำลังเข้า (.+)$/, (m) => `Joining ${m[1]}`],
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
