//go:build windows

package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"syscall"
	"time"
	"unsafe"

	"golang.org/x/sys/windows"
)

var (
	user32   = windows.NewLazySystemDLL("user32.dll")
	shell32  = windows.NewLazySystemDLL("shell32.dll")
	comdlg32 = windows.NewLazySystemDLL("comdlg32.dll")
	kernel32 = windows.NewLazySystemDLL("kernel32.dll")
	dwmapi   = windows.NewLazySystemDLL("dwmapi.dll")

	pShowWindow          = user32.NewProc("ShowWindow")
	pPostMessage         = user32.NewProc("PostMessageW")
	pReleaseCapture      = user32.NewProc("ReleaseCapture")
	pSetWindowPos        = user32.NewProc("SetWindowPos")
	pFindWindow          = user32.NewProc("FindWindowW")
	pSetForeground       = user32.NewProc("SetForegroundWindow")
	pIsIconic            = user32.NewProc("IsIconic")
	pGetDpiForWindow     = user32.NewProc("GetDpiForWindow")
	pGetSystemMetrics    = user32.NewProc("GetSystemMetrics")
	pMessageBox          = user32.NewProc("MessageBoxW")
	pShellExecute        = shell32.NewProc("ShellExecuteW")
	pGetOpenFileName     = comdlg32.NewProc("GetOpenFileNameW")
	pGetSaveFileName     = comdlg32.NewProc("GetSaveFileNameW")
	pCreateMutex         = kernel32.NewProc("CreateMutexW")
	pGetProcessMemInfo   = kernel32.NewProc("K32GetProcessMemoryInfo")
	pDwmSetWindowAttr    = dwmapi.NewProc("DwmSetWindowAttribute")
)

const (
	swMinimize   = 6
	swRestore    = 9
	wmClose      = 0x0010
	wmNCLButton  = 0x00A1
	htCaption    = 2
)

func u16(s string) *uint16 { p, _ := windows.UTF16PtrFromString(s); return p }

func messageBox(hwnd uintptr, text, title string, flags uintptr) int {
	r, _, _ := pMessageBox.Call(hwnd, uintptr(unsafe.Pointer(u16(text))), uintptr(unsafe.Pointer(u16(title))), flags)
	return int(r)
}

func shellOpen(target string, args string) bool {
	var a uintptr
	if args != "" {
		a = uintptr(unsafe.Pointer(u16(args)))
	}
	dir := ""
	if !strings.Contains(target, "://") {
		dir = filepath.Dir(target)
	}
	var d uintptr
	if dir != "" {
		d = uintptr(unsafe.Pointer(u16(dir)))
	}
	r, _, _ := pShellExecute.Call(0, uintptr(unsafe.Pointer(u16("open"))), uintptr(unsafe.Pointer(u16(target))), a, d, 1)
	return r > 32
}

// openViaExplorer ให้ Windows Explorer เป็นคนเปิดแทน
// (FiveM ยอมเปิดเฉพาะเมื่อถูกเรียกจาก Explorer หรือเบราว์เซอร์ เหมือนกดปุ่ม Connect บนเว็บ)
func openViaExplorer(target string) bool {
	win := os.Getenv("WINDIR")
	if win == "" {
		win = `C:\Windows`
	}
	cmd := exec.Command(filepath.Join(win, "explorer.exe"), target)
	if err := cmd.Start(); err != nil {
		return shellOpen(target, "")
	}
	go cmd.Wait() // explorer.exe ส่งต่อให้ตัวหลักแล้วปิดตัวเอง
	return true
}

// ---------- window ----------
func minimizeWindow(hwnd uintptr) { pShowWindow.Call(hwnd, swMinimize) }
func closeWindow(hwnd uintptr)    { pPostMessage.Call(hwnd, wmClose, 0, 0) }
func startDrag(hwnd uintptr) {
	pReleaseCapture.Call()
	pPostMessage.Call(hwnd, wmNCLButton, htCaption, 0)
}
func isMinimized(hwnd uintptr) bool { r, _, _ := pIsIconic.Call(hwnd); return r != 0 }

func dpiScale(hwnd uintptr) float64 {
	if pGetDpiForWindow.Find() == nil {
		if r, _, _ := pGetDpiForWindow.Call(hwnd); r > 0 {
			return float64(r) / 96.0
		}
	}
	return 1
}

// placeWindow ตั้งขนาดตาม DPI และจัดกลางจอ + มุมโค้ง Windows 11
func placeWindow(hwnd uintptr, w, h int) {
	s := dpiScale(hwnd)
	pw, ph := int(float64(w)*s), int(float64(h)*s)
	sw, _, _ := pGetSystemMetrics.Call(16) // SM_CXFULLSCREEN
	sh, _, _ := pGetSystemMetrics.Call(17)
	if pw > int(sw) {
		pw = int(sw)
	}
	if ph > int(sh) {
		ph = int(sh)
	}
	x, y := (int(sw)-pw)/2, (int(sh)-ph)/2
	if x < 0 {
		x = 0
	}
	if y < 0 {
		y = 0
	}
	pSetWindowPos.Call(hwnd, 0, uintptr(x), uintptr(y), uintptr(pw), uintptr(ph), 0x0004|0x0020|0x0040) // NOZORDER|FRAMECHANGED|SHOWWINDOW
	if pDwmSetWindowAttr.Find() == nil {
		pref := uint32(2) // DWMWCP_ROUND
		pDwmSetWindowAttr.Call(hwnd, 33, uintptr(unsafe.Pointer(&pref)), 4)
	}
}

// ---------- single instance ----------
func singleInstance(title string) bool {
	h, _, err := pCreateMutex.Call(0, 0, uintptr(unsafe.Pointer(u16("Local\\FiveMLauncherSingleInstance"))))
	if h != 0 && err == windows.ERROR_ALREADY_EXISTS {
		if w, _, _ := pFindWindow.Call(uintptr(unsafe.Pointer(u16("webview"))), uintptr(unsafe.Pointer(u16(title)))); w != 0 {
			pShowWindow.Call(w, swRestore)
			pSetForeground.Call(w)
		}
		return false
	}
	return true
}

// ---------- file dialogs ----------
type openFileName struct {
	lStructSize       uint32
	hwndOwner         uintptr
	hInstance         uintptr
	lpstrFilter       *uint16
	lpstrCustomFilter *uint16
	nMaxCustFilter    uint32
	nFilterIndex      uint32
	lpstrFile         *uint16
	nMaxFile          uint32
	lpstrFileTitle    *uint16
	nMaxFileTitle     uint32
	lpstrInitialDir   *uint16
	lpstrTitle        *uint16
	flags             uint32
	nFileOffset       uint16
	nFileExtension    uint16
	lpstrDefExt       *uint16
	lCustData         uintptr
	lpfnHook          uintptr
	lpTemplateName    *uint16
	pvReserved        uintptr
	dwReserved        uint32
	flagsEx           uint32
}

func filterStr(name, pattern string) *uint16 {
	s := name + "\x00" + pattern + "\x00\x00"
	b := utf16Encode(s)
	return &b[0]
}

func utf16Encode(s string) []uint16 {
	r := []uint16{}
	for _, c := range s {
		if c >= 0x10000 {
			c -= 0x10000
			r = append(r, uint16(0xD800+(c>>10)), uint16(0xDC00+(c&0x3FF)))
		} else {
			r = append(r, uint16(c))
		}
	}
	return r
}

func fileDialog(hwnd uintptr, save bool, title, filterName, pattern, defName, defExt string) string {
	runtime.LockOSThread()
	defer runtime.UnlockOSThread()
	buf := make([]uint16, 1024)
	copy(buf, utf16Encode(defName))
	ofn := openFileName{
		hwndOwner:   hwnd,
		lpstrFilter: filterStr(filterName, pattern),
		lpstrFile:   &buf[0],
		nMaxFile:    uint32(len(buf)),
		lpstrTitle:  u16(title),
	}
	ofn.lStructSize = uint32(unsafe.Sizeof(ofn))
	if defExt != "" {
		ofn.lpstrDefExt = u16(defExt)
	}
	var r uintptr
	if save {
		ofn.flags = 0x00000002 | 0x00000800 | 0x00080000 // OVERWRITEPROMPT|PATHMUSTEXIST|EXPLORER
		r, _, _ = pGetSaveFileName.Call(uintptr(unsafe.Pointer(&ofn)))
	} else {
		ofn.flags = 0x00001000 | 0x00000800 | 0x00080000 // FILEMUSTEXIST|PATHMUSTEXIST|EXPLORER
		r, _, _ = pGetOpenFileName.Call(uintptr(unsafe.Pointer(&ofn)))
	}
	if r == 0 {
		return ""
	}
	return windows.UTF16ToString(buf)
}

// ---------- processes ----------
type procInfo struct {
	pid, parent uint32
	name        string
}

func listProcesses() []procInfo {
	snap, err := windows.CreateToolhelp32Snapshot(windows.TH32CS_SNAPPROCESS, 0)
	if err != nil {
		return nil
	}
	defer windows.CloseHandle(snap)
	var e windows.ProcessEntry32
	e.Size = uint32(unsafe.Sizeof(e))
	out := []procInfo{}
	for err = windows.Process32First(snap, &e); err == nil; err = windows.Process32Next(snap, &e) {
		out = append(out, procInfo{pid: e.ProcessID, parent: e.ParentProcessID, name: windows.UTF16ToString(e.ExeFile[:])})
	}
	return out
}

func isFiveMRunning() bool {
	for _, p := range listProcesses() {
		n := strings.ToLower(p.name)
		if n == "fivem.exe" || strings.HasPrefix(n, "fivem_") {
			return true
		}
	}
	return false
}

// descendants = ตัวเรา + WebView2 ทุก process ที่เป็นลูกหลาน
func myProcessTree() []uint32 {
	me := uint32(os.Getpid())
	ps := listProcesses()
	set := map[uint32]bool{me: true}
	for changed := true; changed; {
		changed = false
		for _, p := range ps {
			if !set[p.pid] && set[p.parent] {
				set[p.pid] = true
				changed = true
			}
		}
	}
	out := make([]uint32, 0, len(set))
	for pid := range set {
		out = append(out, pid)
	}
	return out
}

type memCounters struct {
	cb                         uint32
	pageFaultCount             uint32
	peakWorkingSetSize         uintptr
	workingSetSize             uintptr
	quotaPeakPagedPoolUsage    uintptr
	quotaPagedPoolUsage        uintptr
	quotaPeakNonPagedPoolUsage uintptr
	quotaNonPagedPoolUsage     uintptr
	pagefileUsage              uintptr
	peakPagefileUsage          uintptr
	privateUsage               uintptr
}

var lastCPU struct {
	total time.Duration
	at    time.Time
}

func metrics() map[string]any {
	var cpuTotal time.Duration
	var mem uint64
	for _, pid := range myProcessTree() {
		h, err := windows.OpenProcess(windows.PROCESS_QUERY_LIMITED_INFORMATION, false, pid)
		if err != nil {
			continue
		}
		var c, e, k, u windows.Filetime
		if windows.GetProcessTimes(h, &c, &e, &k, &u) == nil {
			cpuTotal += time.Duration((int64(k.HighDateTime)<<32|int64(k.LowDateTime))+(int64(u.HighDateTime)<<32|int64(u.LowDateTime))) * 100
		}
		var mc memCounters
		mc.cb = uint32(unsafe.Sizeof(mc))
		if r, _, _ := pGetProcessMemInfo.Call(uintptr(h), uintptr(unsafe.Pointer(&mc)), uintptr(mc.cb)); r != 0 {
			mem += uint64(mc.privateUsage)
		}
		windows.CloseHandle(h)
	}
	now := time.Now()
	cpu := 0.0
	if !lastCPU.at.IsZero() {
		el := now.Sub(lastCPU.at)
		if el > 0 {
			cpu = float64(cpuTotal-lastCPU.total) / float64(el) / float64(runtime.NumCPU()) * 100
		}
	}
	if cpu < 0 {
		cpu = 0
	}
	lastCPU.total, lastCPU.at = cpuTotal, now
	return map[string]any{"cpu": cpu, "ram": float64(mem) / 1024 / 1024}
}

func setPriority(mode string) {
	cls := uint32(windows.NORMAL_PRIORITY_CLASS)
	if mode == "eco" {
		cls = windows.BELOW_NORMAL_PRIORITY_CLASS
	}
	windows.SetPriorityClass(windows.CurrentProcess(), cls)
}

var _ = syscall.Getpid
