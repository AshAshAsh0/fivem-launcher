//go:build windows

package main

// แจ้งเตือนเมื่อเซิร์ฟมีที่ว่าง / เซิร์ฟเปิด
// - เช็กเฉพาะเซิร์ฟที่ผู้ใช้กดให้แจ้งเตือน ทุก 15 วินาที (ข้อมูลไม่ถึง 1 KB ต่อครั้ง)
// - แจ้งเตือนผ่านไอคอนข้างนาฬิกา (ขึ้นเป็นการแจ้งเตือนของ Windows) แล้วหยุดเช็กเอง
// - คลิกการแจ้งเตือน = เข้าเซิร์ฟทันที

import (
	"encoding/json"
	"sync"
	"time"
	"unsafe"

	"golang.org/x/sys/windows"
)

type watchItem struct {
	ID      string `json:"id"`
	Address string `json:"address"`
	Connect string `json:"connect"`
	Name    string `json:"name"`
	Kind    string `json:"kind"` // "slot" = รอที่ว่าง, "online" = รอเซิร์ฟเปิด
	stop    chan struct{}
}

var watches = struct {
	sync.Mutex
	m       map[string]*watchItem
	lastHit *watchItem
}{m: map[string]*watchItem{}}

const (
	wmTray          = 0x8000 + 1 // WM_APP+1
	ninBalloonClick = 0x0400 + 5 // NIN_BALLOONUSERCLICK
	wmLButtonUp     = 0x0202
)

// ---------- Shell_NotifyIcon ----------

type notifyIconData struct {
	cbSize           uint32
	hWnd             uintptr
	uID              uint32
	uFlags           uint32
	uCallbackMessage uint32
	hIcon            uintptr
	szTip            [128]uint16
	dwState          uint32
	dwStateMask      uint32
	szInfo           [256]uint16
	uVersion         uint32
	szInfoTitle      [64]uint16
	dwInfoFlags      uint32
	guidItem         windows.GUID
	hBalloonIcon     uintptr
}

var (
	pShellNotifyIcon = shell32.NewProc("Shell_NotifyIconW")
	pLoadImage       = user32.NewProc("LoadImageW")
	trayAdded        bool
	trayIcon         uintptr
)

func putStr(dst []uint16, s string) {
	u := utf16Encode(s)
	if len(u) >= len(dst) {
		u = u[:len(dst)-1]
	}
	copy(dst, u)
	dst[len(u)] = 0
}

func appIcon() uintptr {
	if trayIcon == 0 {
		var h windows.Handle
		_ = windows.GetModuleHandleEx(0, nil, &h)
		trayIcon, _, _ = pLoadImage.Call(uintptr(h), 1, 1, 16, 16, 0) // IMAGE_ICON, 16px
	}
	return trayIcon
}

func baseNID() notifyIconData {
	var d notifyIconData
	d.cbSize = uint32(unsafe.Sizeof(d))
	d.hWnd = hwnd
	d.uID = 1
	return d
}

// ต้องเรียกบน UI thread
func trayEnsure(tip string) {
	d := baseNID()
	d.uFlags = 0x1 | 0x2 | 0x4 | 0x80 // MESSAGE | ICON | TIP | SHOWTIP
	d.uCallbackMessage = wmTray
	d.hIcon = appIcon()
	putStr(d.szTip[:], tip)
	if !trayAdded {
		if r, _, _ := pShellNotifyIcon.Call(0, uintptr(unsafe.Pointer(&d))); r != 0 { // NIM_ADD
			trayAdded = true
			d.uVersion = 4
			pShellNotifyIcon.Call(4, uintptr(unsafe.Pointer(&d))) // NIM_SETVERSION
		}
		return
	}
	pShellNotifyIcon.Call(1, uintptr(unsafe.Pointer(&d))) // NIM_MODIFY
}

func trayRemove() {
	if !trayAdded {
		return
	}
	d := baseNID()
	pShellNotifyIcon.Call(2, uintptr(unsafe.Pointer(&d))) // NIM_DELETE
	trayAdded = false
}

func trayBalloon(title, text string) {
	trayEnsure(appTitle)
	d := baseNID()
	d.uFlags = 0x10 // NIF_INFO
	putStr(d.szInfoTitle[:], title)
	putStr(d.szInfo[:], text)
	d.dwInfoFlags = 0x1 // NIIF_INFO
	pShellNotifyIcon.Call(1, uintptr(unsafe.Pointer(&d)))
}

// handleTrayMessage ถูกเรียกจาก wndproc
func handleTrayMessage(msg, wp, lp uintptr) bool {
	if msg != wmTray {
		return false
	}
	switch lp & 0xFFFF {
	case ninBalloonClick:
		watches.Lock()
		hit := watches.lastHit
		watches.Unlock()
		if hit != nil {
			openViaExplorer("fivem://connect/" + hit.Connect)
		}
		cleanupTray()
	case 0x0403, 0x0404: // NIN_BALLOONHIDE, NIN_BALLOONTIMEOUT: แจ้งเตือนหายไปแล้ว
		cleanupTray()
	case wmLButtonUp:
		pShowWindow.Call(hwnd, swRestore)
		pSetForeground.Call(hwnd)
	}
	return true
}

func cleanupTray() {
	watches.Lock()
	n := len(watches.m)
	watches.Unlock()
	if n == 0 {
		trayRemove()
	}
}

// ---------- watcher ----------

func watchList() []map[string]string {
	watches.Lock()
	defer watches.Unlock()
	out := []map[string]string{}
	for _, w := range watches.m {
		out = append(out, map[string]string{"id": w.ID, "kind": w.Kind})
	}
	return out
}

func watchStart(w *watchItem) {
	watchStop(w.ID)
	w.stop = make(chan struct{})
	watches.Lock()
	watches.m[w.ID] = w
	n := len(watches.m)
	watches.Unlock()
	tip := appTitle + " — กำลังรอ " + clip(w.Name, 40)
	if n > 1 {
		tip = appTitle + " — กำลังรอเซิร์ฟ"
	}
	wv.Dispatch(func() { trayEnsure(tip) })
	go watchLoop(w)
}

func watchStop(id string) {
	watches.Lock()
	if w, ok := watches.m[id]; ok {
		close(w.stop)
		delete(watches.m, id)
	}
	watches.Unlock()
	if wv != nil {
		wv.Dispatch(cleanupTray)
	}
}

func watchLoop(w *watchItem) {
	t := time.NewTicker(15 * time.Second)
	defer t.Stop()
	check := func() bool {
		r := queryServer(w.Address, false)
		online, _ := r["online"].(bool)
		if !online {
			return false
		}
		if w.Kind == "online" {
			return true
		}
		players := toInt(r["players"])
		max := toInt(r["max"])
		return max > 0 && players < max
	}
	for {
		if check() {
			watches.Lock()
			if watches.m[w.ID] != w { // ถูกยกเลิกไปแล้ว
				watches.Unlock()
				return
			}
			delete(watches.m, w.ID)
			watches.lastHit = w
			watches.Unlock()
			title, text := "เซิร์ฟมีที่ว่างแล้ว!", w.Name+" — คลิกเพื่อเข้าเกมทันที"
			if w.Kind == "online" {
				title = "เซิร์ฟเปิดแล้ว!"
			}
			if uiLang() == "en" {
				title, text = "A slot just opened!", w.Name+" — click to join now"
				if w.Kind == "online" {
					title = "Server is online!"
				}
			}
			b, _ := json.Marshal(map[string]string{"id": w.ID, "kind": w.Kind})
			wv.Dispatch(func() {
				trayBalloon(title, text)
				wv.Eval("window.__goWatchHit && window.__goWatchHit(" + string(b) + ")")
			})
			return
		}
		select {
		case <-w.stop:
			return
		case <-t.C:
		}
	}
}

func toInt(v any) int {
	switch n := v.(type) {
	case float64:
		return int(n)
	case int:
		return n
	case int64:
		return int(n)
	}
	return 0
}

var currentLang = "th"

func uiLang() string { return currentLang }
