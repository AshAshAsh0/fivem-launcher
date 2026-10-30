//go:build windows

package main

// ฟังก์ชันระบบที่เรียก Windows API โดยตรง (ไม่เรียก PowerShell / taskkill / cmd)
// เพื่อให้พฤติกรรมของตัวติดตั้งตรงไปตรงมาและไม่ถูกแอนตี้ไวรัสเข้าใจผิด

import (
	"errors"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"syscall"
	"time"
	"unsafe"

	"golang.org/x/sys/windows"
)

var (
	ole32p            = windows.NewLazySystemDLL("ole32.dll")
	pCoInitializeEx   = ole32p.NewProc("CoInitializeEx")
	pCoUninitialize   = ole32p.NewProc("CoUninitialize")
	pCoCreateInstance = ole32p.NewProc("CoCreateInstance")
	pFindWindowW      = user32.NewProc("FindWindowW")
	pGetWindowPid     = user32.NewProc("GetWindowThreadProcessId")

	clsidShellLink  = windows.GUID{Data1: 0x00021401, Data4: [8]byte{0xC0, 0, 0, 0, 0, 0, 0, 0x46}}
	iidIShellLinkW  = windows.GUID{Data1: 0x000214F9, Data4: [8]byte{0xC0, 0, 0, 0, 0, 0, 0, 0x46}}
	iidIPersistFile = windows.GUID{Data1: 0x0000010B, Data4: [8]byte{0xC0, 0, 0, 0, 0, 0, 0, 0x46}}
)

// เรียกเมธอดลำดับที่ idx ใน vtable ของ COM object
func comCall(obj uintptr, idx int, args ...uintptr) uintptr {
	vtbl := *(*uintptr)(unsafe.Pointer(obj))
	fn := *(*uintptr)(unsafe.Pointer(vtbl + uintptr(idx)*unsafe.Sizeof(uintptr(0))))
	r, _, _ := syscall.SyscallN(fn, append([]uintptr{obj}, args...)...)
	return r
}

func comRelease(obj uintptr) { comCall(obj, 2) }

// createShortcut สร้างไฟล์ .lnk ผ่าน IShellLink ของ Windows
func createShortcut(lnk, target, workDir, desc string) error {
	runtime.LockOSThread()
	defer runtime.UnlockOSThread()
	if hr, _, _ := pCoInitializeEx.Call(0, 0x2); int32(hr) >= 0 { // COINIT_APARTMENTTHREADED
		defer pCoUninitialize.Call()
	}
	var sl uintptr
	if hr, _, _ := pCoCreateInstance.Call(uintptr(unsafe.Pointer(&clsidShellLink)), 0, 1, // CLSCTX_INPROC_SERVER
		uintptr(unsafe.Pointer(&iidIShellLinkW)), uintptr(unsafe.Pointer(&sl))); int32(hr) < 0 || sl == 0 {
		return errors.New("CoCreateInstance(ShellLink) failed")
	}
	defer comRelease(sl)
	comCall(sl, 20, uintptr(unsafe.Pointer(u16(target))))     // SetPath
	comCall(sl, 9, uintptr(unsafe.Pointer(u16(workDir))))     // SetWorkingDirectory
	comCall(sl, 17, uintptr(unsafe.Pointer(u16(target))), 0)  // SetIconLocation
	comCall(sl, 7, uintptr(unsafe.Pointer(u16(desc))))        // SetDescription

	var pf uintptr
	if hr := comCall(sl, 0, uintptr(unsafe.Pointer(&iidIPersistFile)), uintptr(unsafe.Pointer(&pf))); int32(hr) < 0 || pf == 0 {
		return errors.New("QueryInterface(IPersistFile) failed")
	}
	defer comRelease(pf)
	if hr := comCall(pf, 6, uintptr(unsafe.Pointer(u16(lnk))), 1); int32(hr) < 0 { // Save
		return errors.New("IPersistFile.Save failed")
	}
	return nil
}

func shortcutDirs(desktop, startMenu bool) []string {
	out := []string{}
	if desktop {
		if p, err := windows.KnownFolderPath(windows.FOLDERID_Desktop, 0); err == nil {
			out = append(out, p)
		}
	}
	if startMenu {
		if p, err := windows.KnownFolderPath(windows.FOLDERID_Programs, 0); err == nil {
			out = append(out, p)
		}
	}
	return out
}

func shortcuts(desktop, startMenu bool, target, dir string) {
	for _, d := range shortcutDirs(desktop, startMenu) {
		_ = createShortcut(filepath.Join(d, appName+".lnk"), target, dir, appName)
	}
}

func removeShortcuts() {
	for _, d := range shortcutDirs(true, true) {
		_ = os.Remove(filepath.Join(d, appName+".lnk"))
	}
}

// killApp ขอให้ FiveM Launcher ปิดตัวเองก่อน ถ้าไม่ปิดภายในเวลาที่กำหนดจึงบังคับปิด
func killApp() {
	if h, _, _ := pFindWindowW.Call(uintptr(unsafe.Pointer(u16("webview"))), uintptr(unsafe.Pointer(u16(appName)))); h != 0 {
		pPostMessage.Call(h, 0x0010, 0, 0) // WM_CLOSE
	}
	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) {
		if len(appPids()) == 0 {
			return
		}
		time.Sleep(150 * time.Millisecond)
	}
	for _, pid := range appPids() {
		if h, err := windows.OpenProcess(windows.PROCESS_TERMINATE|windows.SYNCHRONIZE, false, pid); err == nil {
			_ = windows.TerminateProcess(h, 0)
			_, _ = windows.WaitForSingleObject(h, 3000)
			windows.CloseHandle(h)
		}
	}
}

func appPids() []uint32 {
	snap, err := windows.CreateToolhelp32Snapshot(windows.TH32CS_SNAPPROCESS, 0)
	if err != nil {
		return nil
	}
	defer windows.CloseHandle(snap)
	var e windows.ProcessEntry32
	e.Size = uint32(unsafe.Sizeof(e))
	out := []uint32{}
	for err = windows.Process32First(snap, &e); err == nil; err = windows.Process32Next(snap, &e) {
		if strings.EqualFold(windows.UTF16ToString(e.ExeFile[:]), exeName) {
			out = append(out, e.ProcessID)
		}
	}
	return out
}

// relaunchFromTemp: ตัวถอนการติดตั้งคัดลอกตัวเองไปไว้ใน TEMP แล้วรันจากที่นั่น
// เพื่อให้ลบโฟลเดอร์ติดตั้ง (รวม Uninstall.exe) ได้ครบ — วิธีเดียวกับตัวติดตั้งมาตรฐานทั่วไป
func relaunchFromTemp(installDir string) bool {
	self, err := os.Executable()
	if err != nil {
		return false
	}
	b, err := os.ReadFile(self)
	if err != nil {
		return false
	}
	tmp := filepath.Join(os.TempDir(), "FiveMLauncher-Uninstall.exe")
	if err := os.WriteFile(tmp, b, 0o755); err != nil {
		return false
	}
	attr := &os.ProcAttr{Dir: os.TempDir(), Files: []*os.File{nil, nil, nil}}
	p, err := os.StartProcess(tmp, []string{tmp, "/uninstall", "/dir=" + installDir}, attr)
	if err != nil {
		return false
	}
	_ = p.Release()
	return true
}

// removeInstallDir ลบโฟลเดอร์ติดตั้ง (รอให้ไฟล์ถูกปล่อยสักครู่)
func removeInstallDir(dir string) {
	if dir == "" || !strings.EqualFold(filepath.Base(dir), appName) && !fileExists(filepath.Join(dir, exeName)) && !fileExists(filepath.Join(dir, "Uninstall.exe")) {
		return // ป้องกันลบโฟลเดอร์ผิด
	}
	for i := 0; i < 10; i++ {
		_ = os.Remove(filepath.Join(dir, exeName))
		_ = os.Remove(filepath.Join(dir, "Uninstall.exe"))
		if err := os.Remove(dir); err == nil || os.IsNotExist(err) {
			return
		}
		time.Sleep(300 * time.Millisecond)
	}
}

func fileExists(p string) bool { _, err := os.Stat(p); return err == nil }
