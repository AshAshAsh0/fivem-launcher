//go:build windows

// ตัวติดตั้ง FiveM Launcher แบบไฟล์เดียว (ติดตั้งเฉพาะผู้ใช้นี้ ไม่ต้องใช้สิทธิ์ Admin)
package main

import (
	"bytes"
	"compress/gzip"
	_ "embed"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"golang.org/x/sys/windows/registry"
)

//go:embed payload/FiveMLauncher.exe.gz
var appExeGz []byte

// version ถูกแทนค่าตอน build ด้วย -ldflags "-X main.version=..."
var version = "3.8.0"

const (
	appName   = "FiveM Launcher"
	exeName   = "FiveM Launcher.exe"
	publisher = "FiveM Launcher"
	uninstKey = `Software\Microsoft\Windows\CurrentVersion\Uninstall\FiveMLauncher`
)

func appExe() ([]byte, error) {
	r, err := gzip.NewReader(bytes.NewReader(appExeGz))
	if err != nil {
		return nil, err
	}
	return io.ReadAll(r)
}

func defaultDir() string {
	if k, err := registry.OpenKey(registry.CURRENT_USER, uninstKey, registry.QUERY_VALUE); err == nil {
		defer k.Close()
		if v, _, err := k.GetStringValue("InstallLocation"); err == nil && v != "" {
			return v
		}
	}
	return filepath.Join(os.Getenv("LOCALAPPDATA"), "Programs", appName)
}

func isInstalled() bool {
	_, err := os.Stat(filepath.Join(defaultDir(), exeName))
	return err == nil
}

func hasWebView2() bool {
	const guid = `{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}`
	paths := []struct {
		root registry.Key
		path string
	}{
		{registry.LOCAL_MACHINE, `SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\` + guid},
		{registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\EdgeUpdate\Clients\` + guid},
		{registry.CURRENT_USER, `Software\Microsoft\EdgeUpdate\Clients\` + guid},
	}
	for _, p := range paths {
		k, err := registry.OpenKey(p.root, p.path, registry.QUERY_VALUE)
		if err != nil {
			continue
		}
		v, _, err := k.GetStringValue("pv")
		k.Close()
		if err == nil && v != "" && v != "0.0.0.0" {
			return true
		}
	}
	return false
}

type installOpts struct {
	Dir       string `json:"dir"`
	Desktop   bool   `json:"desktop"`
	StartMenu bool   `json:"startMenu"`
}

// doInstall ติดตั้งจริง พร้อมรายงานความคืบหน้า (0-100)
func doInstall(o installOpts, progress func(pct int, text string)) (string, error) {
	dir := strings.TrimSpace(o.Dir)
	if dir == "" {
		dir = defaultDir()
	}
	if !filepath.IsAbs(dir) {
		return "", errors.New(L("กรุณาเลือกโฟลเดอร์ให้ถูกต้อง", "Please choose a valid folder"))
	}
	progress(8, L("กำลังปิดโปรแกรมเดิม...", "Closing the running launcher..."))
	killApp()

	progress(22, L("กำลังเตรียมโฟลเดอร์...", "Preparing folder..."))
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", fmt.Errorf(L("สร้างโฟลเดอร์ไม่ได้: %v", "Cannot create folder: %v"), err)
	}

	progress(38, L("กำลังแตกไฟล์โปรแกรม...", "Extracting program files..."))
	data, err := appExe()
	if err != nil {
		return "", fmt.Errorf(L("ไฟล์ติดตั้งเสียหาย: %v", "Installer is corrupted: %v"), err)
	}
	target := filepath.Join(dir, exeName)
	for i := 0; i < 6; i++ { // เผื่อไฟล์เดิมยังถูกล็อก
		if err = os.WriteFile(target, data, 0o755); err == nil {
			break
		}
		time.Sleep(600 * time.Millisecond)
	}
	if err != nil {
		return "", fmt.Errorf(L("เขียนไฟล์โปรแกรมไม่ได้ (ปิด FiveM Launcher แล้วลองอีกครั้ง): %v", "Cannot write program files (close FiveM Launcher and try again): %v"), err)
	}

	progress(62, L("กำลังสร้างตัวถอนการติดตั้ง...", "Creating uninstaller..."))
	if self, e := os.Executable(); e == nil {
		if b, e := os.ReadFile(self); e == nil {
			_ = os.WriteFile(filepath.Join(dir, "Uninstall.exe"), b, 0o755)
		}
	}

	progress(76, L("กำลังสร้างทางลัด...", "Creating shortcuts..."))
	shortcuts(o.Desktop, o.StartMenu, target, dir)

	progress(90, L("กำลังลงทะเบียนโปรแกรม...", "Registering application..."))
	if k, _, e := registry.CreateKey(registry.CURRENT_USER, uninstKey, registry.SET_VALUE); e == nil {
		_ = k.SetStringValue("DisplayName", appName)
		_ = k.SetStringValue("DisplayVersion", version)
		_ = k.SetStringValue("Publisher", publisher)
		_ = k.SetStringValue("DisplayIcon", target+",0")
		_ = k.SetStringValue("InstallLocation", dir)
		_ = k.SetStringValue("UninstallString", `"`+filepath.Join(dir, "Uninstall.exe")+`" /uninstall`)
		_ = k.SetDWordValue("EstimatedSize", uint32(len(data)*2/1024))
		_ = k.SetDWordValue("NoModify", 1)
		_ = k.SetDWordValue("NoRepair", 1)
		k.Close()
	}
	progress(100, L("ติดตั้งเสร็จแล้ว", "Installation complete"))
	return target, nil
}

func doUninstall(dir string, alsoData bool, progress func(int, string)) {
	progress(15, L("กำลังปิดโปรแกรม...", "Closing the launcher..."))
	killApp()
	progress(40, L("กำลังลบทางลัด...", "Removing shortcuts..."))
	removeShortcuts()
	_ = registry.DeleteKey(registry.CURRENT_USER, uninstKey)
	progress(65, L("กำลังลบไฟล์โปรแกรม...", "Removing program files..."))
	_ = os.Remove(filepath.Join(dir, exeName))
	_ = os.RemoveAll(filepath.Join(os.Getenv("LOCALAPPDATA"), appName))
	if alsoData {
		progress(85, L("กำลังลบข้อมูลที่บันทึกไว้...", "Removing saved data..."))
		_ = os.RemoveAll(filepath.Join(os.Getenv("APPDATA"), appName))
	}
	progress(100, L("ถอนการติดตั้งเรียบร้อย", "Uninstall complete"))
}

func launchApp(target string) {
	c := exec.Command(target)
	c.Dir = filepath.Dir(target)
	_ = c.Start()
}

// silentUpdate ใช้ตอนอัปเดตอัตโนมัติจากในโปรแกรม: ติดตั้งทับที่เดิม ไม่แตะทางลัด แล้วเปิดโปรแกรมใหม่
func silentUpdate() {
	time.Sleep(800 * time.Millisecond) // รอให้ Launcher ปิดตัวเอง
	target, err := doInstall(installOpts{Dir: defaultDir()}, func(int, string) {})
	if err != nil {
		msg(L("อัปเดตไม่สำเร็จ: ", "Update failed: ")+err.Error(), mbIconErr)
		return
	}
	launchApp(target)
}

func main() {
	uninst := false
	for _, a := range os.Args[1:] {
		if strings.EqualFold(a, "/uninstall") || strings.EqualFold(a, "--uninstall") {
			uninst = true
		}
	}
	self, _ := os.Executable()
	if strings.EqualFold(filepath.Base(self), "Uninstall.exe") {
		uninst = true
	}
	// โฟลเดอร์ที่จะถอนการติดตั้ง: ส่งมาทาง /dir= (ตอนรันจาก TEMP) หรือโฟลเดอร์ของ Uninstall.exe เอง
	instDir := filepath.Dir(self)
	fromTemp := false
	for _, a := range os.Args[1:] {
		if strings.HasPrefix(strings.ToLower(a), "/dir=") {
			instDir = a[5:]
			fromTemp = true
		}
	}
	if uninst && !fromTemp && relaunchFromTemp(instDir) {
		return
	}
	for _, a := range os.Args[1:] {
		if strings.EqualFold(a, "/silent") || strings.EqualFold(a, "--silent") {
			silentUpdate()
			return
		}
	}

	if hasWebView2() {
		if runUI(uninst, instDir) {
			return
		}
	}
	fallback(uninst, instDir)
}
