//go:build windows

package main

import (
	"os"
	"path/filepath"
	"strings"
	"unsafe"

	"golang.org/x/sys/windows"
)

var (
	user32  = windows.NewLazySystemDLL("user32.dll")
	shell32 = windows.NewLazySystemDLL("shell32.dll")
	ole32   = windows.NewLazySystemDLL("ole32.dll")
	dwmapi  = windows.NewLazySystemDLL("dwmapi.dll")

	pMessageBox       = user32.NewProc("MessageBoxW")
	pShowWindow       = user32.NewProc("ShowWindow")
	pPostMessage      = user32.NewProc("PostMessageW")
	pReleaseCapture   = user32.NewProc("ReleaseCapture")
	pSetWindowPos     = user32.NewProc("SetWindowPos")
	pGetDpiForWindow  = user32.NewProc("GetDpiForWindow")
	pGetSystemMetrics = user32.NewProc("GetSystemMetrics")
	pShellExec        = shell32.NewProc("ShellExecuteW")
	pBrowseForFolder  = shell32.NewProc("SHBrowseForFolderW")
	pGetPathFromID    = shell32.NewProc("SHGetPathFromIDListW")
	pCoTaskMemFree    = ole32.NewProc("CoTaskMemFree")
	pDwmSetWindowAttr = dwmapi.NewProc("DwmSetWindowAttribute")
	pGetWindowRect    = user32.NewProc("GetWindowRect")
	pGetClientRect    = user32.NewProc("GetClientRect")
	pMessageBoxOwner  = user32.NewProc("MessageBoxW")
	kernel32          = windows.NewLazySystemDLL("kernel32.dll")
	pGetDiskFree      = kernel32.NewProc("GetDiskFreeSpaceExW")
	pGetUILang        = kernel32.NewProc("GetUserDefaultUILanguage")
)

// ภาษาของตัวติดตั้ง: ไทยถ้า Windows เป็นภาษาไทย นอกนั้นอังกฤษ
var uiLang = func() string {
	if r, _, _ := pGetUILang.Call(); r&0x3FF == 0x1E {
		return "th"
	}
	return "en"
}()

func L(th, en string) string {
	if uiLang == "th" {
		return th
	}
	return en
}

type rect struct{ l, t, r, b int32 }

// placeClient ตั้งขนาดพื้นที่ภายใน (ไม่รวมแถบชื่อ) ตาม DPI แล้วจัดกลางจอ
func placeClient(h uintptr, w, ht int) {
	s := 1.0
	if pGetDpiForWindow.Find() == nil {
		if r, _, _ := pGetDpiForWindow.Call(h); r > 0 {
			s = float64(r) / 96
		}
	}
	var wr, cr rect
	pGetWindowRect.Call(h, uintptr(unsafe.Pointer(&wr)))
	pGetClientRect.Call(h, uintptr(unsafe.Pointer(&cr)))
	fw := int((wr.r - wr.l) - (cr.r - cr.l))
	fh := int((wr.b - wr.t) - (cr.b - cr.t))
	pw, ph := int(float64(w)*s)+fw, int(float64(ht)*s)+fh
	sw, _, _ := pGetSystemMetrics.Call(16)
	sh, _, _ := pGetSystemMetrics.Call(17)
	x, y := (int(sw)-pw)/2, (int(sh)-ph)/2
	if x < 0 {
		x = 0
	}
	if y < 0 {
		y = 0
	}
	pSetWindowPos.Call(h, 0, uintptr(x), uintptr(y), uintptr(pw), uintptr(ph), 0x0004|0x0020|0x0040)
}

func msgOwner(h uintptr, text string, flags uintptr) int {
	r, _, _ := pMessageBoxOwner.Call(h, uintptr(unsafe.Pointer(u16(text))), uintptr(unsafe.Pointer(u16(appName+" Setup"))), flags)
	return int(r)
}

// freeSpace คืนพื้นที่ว่าง (ไบต์) ของไดรฟ์ที่โฟลเดอร์นั้นอยู่
func freeSpace(dir string) uint64 {
	p := dir
	for p != "" {
		if st, err := os.Stat(p); err == nil && st.IsDir() {
			break
		}
		np := filepath.Dir(p)
		if np == p {
			break
		}
		p = np
	}
	var free uint64
	pGetDiskFree.Call(uintptr(unsafe.Pointer(u16(p))), uintptr(unsafe.Pointer(&free)), 0, 0)
	return free
}

func u16(s string) *uint16 { p, _ := windows.UTF16PtrFromString(s); return p }

const (
	mbYesNo    = 0x4
	mbIconInfo = 0x40
	mbIconQ    = 0x20
	mbIconErr  = 0x10
	mbIconWarn = 0x30
	idYes      = 6
)

func msg(text string, flags uintptr) int {
	r, _, _ := pMessageBox.Call(0, uintptr(unsafe.Pointer(u16(text))), uintptr(unsafe.Pointer(u16(appName+" Setup"))), flags|0x00010000)
	return int(r)
}

func open(target string) {
	pShellExec.Call(0, uintptr(unsafe.Pointer(u16("open"))), uintptr(unsafe.Pointer(u16(target))), 0, 0, 1)
}

func minimizeWindow(h uintptr) { pShowWindow.Call(h, 6) }
func closeWindow(h uintptr)    { pPostMessage.Call(h, 0x0010, 0, 0) }
func startDrag(h uintptr) {
	pReleaseCapture.Call()
	pPostMessage.Call(h, 0x00A1, 2, 0)
}

func placeWindow(h uintptr, w, ht int) {
	s := 1.0
	if pGetDpiForWindow.Find() == nil {
		if r, _, _ := pGetDpiForWindow.Call(h); r > 0 {
			s = float64(r) / 96
		}
	}
	pw, ph := int(float64(w)*s), int(float64(ht)*s)
	sw, _, _ := pGetSystemMetrics.Call(16)
	sh, _, _ := pGetSystemMetrics.Call(17)
	x, y := (int(sw)-pw)/2, (int(sh)-ph)/2
	if x < 0 {
		x = 0
	}
	if y < 0 {
		y = 0
	}
	pSetWindowPos.Call(h, 0, uintptr(x), uintptr(y), uintptr(pw), uintptr(ph), 0x0004|0x0020|0x0040)
	if pDwmSetWindowAttr.Find() == nil {
		pref := uint32(2)
		pDwmSetWindowAttr.Call(h, 33, uintptr(unsafe.Pointer(&pref)), 4)
	}
}

type browseInfo struct {
	hwndOwner      uintptr
	pidlRoot       uintptr
	pszDisplayName *uint16
	lpszTitle      *uint16
	ulFlags        uint32
	lpfn           uintptr
	lParam         uintptr
	iImage         int32
}

// pickFolder เลือกโฟลเดอร์ แล้วต่อท้ายด้วย "\FiveM Launcher" ให้อัตโนมัติ
func pickFolder(h uintptr) string {
	name := make([]uint16, 260)
	bi := browseInfo{
		hwndOwner:      h,
		pszDisplayName: &name[0],
		lpszTitle:      u16("เลือกโฟลเดอร์ที่จะติดตั้ง " + appName),
		ulFlags:        0x0001 | 0x0040 | 0x0010, // RETURNONLYFSDIRS | NEWDIALOGSTYLE | EDITBOX
	}
	pidl, _, _ := pBrowseForFolder.Call(uintptr(unsafe.Pointer(&bi)))
	if pidl == 0 {
		return ""
	}
	defer pCoTaskMemFree.Call(pidl)
	buf := make([]uint16, 1024)
	if r, _, _ := pGetPathFromID.Call(pidl, uintptr(unsafe.Pointer(&buf[0]))); r == 0 {
		return ""
	}
	p := windows.UTF16ToString(buf)
	if !strings.EqualFold(filepath.Base(p), appName) {
		p = filepath.Join(p, appName)
	}
	return p
}

// fallback: ใช้กล่องข้อความธรรมดา (กรณีเครื่องไม่มี WebView2)
func fallback(uninst bool, selfDir string) {
	noop := func(int, string) {}
	if uninst {
		if msg(L("ถอนการติดตั้ง "+appName+" ออกจากเครื่องนี้?", "Uninstall "+appName+" from this computer?"), mbYesNo|mbIconQ) != idYes {
			return
		}
		data := msg(L("ลบรายการเซิร์ฟเวอร์และการตั้งค่าที่บันทึกไว้ด้วยไหม?", "Also delete your saved servers and settings?"), mbYesNo|mbIconQ) == idYes
		doUninstall(selfDir, data, noop)
		scheduleSelfDelete(selfDir)
		msg(L(appName+" ถูกถอนการติดตั้งแล้ว", appName+" has been uninstalled."), mbIconInfo)
		return
	}
	if !hasWebView2() {
		if msg(L("เครื่องนี้ยังไม่มี Microsoft Edge WebView2 Runtime ซึ่งโปรแกรมต้องใช้\n\nกด Yes เพื่อเปิดหน้าดาวน์โหลด (ติดตั้งเสร็จแล้วเปิดตัวติดตั้งนี้อีกครั้ง)\nกด No เพื่อติดตั้งต่อเลย",
			"This computer does not have the Microsoft Edge WebView2 Runtime, which "+appName+" needs.\n\nClick Yes to open the download page (run this installer again afterwards).\nClick No to continue anyway."), mbYesNo|mbIconWarn) == idYes {
			open("https://go.microsoft.com/fwlink/p/?LinkId=2124703")
			return
		}
	}
	if msg(L("ติดตั้ง "+appName+" "+version+" ลงในเครื่องนี้?\n\nตำแหน่ง: ", "Install "+appName+" "+version+" on this computer?\n\nLocation: ")+defaultDir(), mbYesNo|mbIconQ) != idYes {
		return
	}
	target, err := doInstall(installOpts{Dir: defaultDir(), Desktop: true, StartMenu: true}, noop)
	if err != nil {
		msg(err.Error(), mbIconErr)
		return
	}
	launchApp(target)
}
