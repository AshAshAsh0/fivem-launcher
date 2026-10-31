//go:build windows

package main

import (
	_ "embed"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	webview2 "github.com/jchv/go-webview2"
)

//go:embed fonts/Kanit-Regular.woff
var fontRegular []byte

//go:embed fonts/Kanit-SemiBold.woff
var fontSemiBold []byte

// ใส่ฟอนต์ Kanit ลงในหน้า (SetHtml โหลดไฟล์ภายนอกไม่ได้)
func withFonts(h string) string {
	css := "@font-face{font-family:'Kanit';font-weight:400;src:url(data:font/woff;base64," + base64.StdEncoding.EncodeToString(fontRegular) + ") format('woff')}" +
		"@font-face{font-family:'Kanit';font-weight:500 700;src:url(data:font/woff;base64," + base64.StdEncoding.EncodeToString(fontSemiBold) + ") format('woff')}"
	return strings.Replace(h, "/*FONTS*/", css, 1)
}

//go:embed ui.html
var uiHTML string

var (
	wv   webview2.WebView
	hwnd uintptr
	busy bool
)

func runUI(uninst bool, selfDir string) (ok bool) {
	defer func() {
		if r := recover(); r != nil {
			ok = false
		}
	}()
	webview2.FramelessPopup = false
	webview2.WindowStyle = 0x00C00000 | 0x00080000 | 0x00020000 | 0x02000000 // CAPTION|SYSMENU|MINIMIZEBOX|CLIPCHILDREN
	tmp := filepath.Join(os.TempDir(), "FiveMLauncherSetup-WebView2")
	wv = webview2.NewWithOptions(webview2.WebViewOptions{
		AutoFocus: true,
		DataPath:  tmp,
		WindowOptions: webview2.WindowOptions{
			Title:  appName + " Setup",
			Width:  600,
			Height: 460,
			IconId: 1,
			Center: true,
		},
	})
	if wv == nil {
		return false
	}
	defer wv.Destroy()
	hwnd = uintptr(wv.Window())
	placeClient(hwnd, 600, 440)

	eval := func(js string) { wv.Dispatch(func() { wv.Eval(js) }) }
	progress := func(p int, t string) {
		b, _ := json.Marshal(t)
		eval(fmt.Sprintf("window.__progress(%d,%s)", p, b))
		time.Sleep(260 * time.Millisecond) // ให้เห็นแต่ละขั้นตอน
	}
	var installed string
	finished := false
	uninstDone := false
	webview2.OnClose = func() bool {
		if busy {
			return false // กำลังติดตั้งอยู่ ห้ามปิด
		}
		if finished || installed != "" {
			return true
		}
		return msgOwner(hwnd, L("ต้องการยกเลิกการติดตั้ง "+appName+" หรือไม่?", "Are you sure you want to cancel "+appName+" Setup?"), mbYesNo|mbIconQ) == idYes
	}

	_ = wv.Bind("goCall", func(id int, method string, raw string) {
		go func() {
			var args []json.RawMessage
			_ = json.Unmarshal([]byte(raw), &args)
			var res any
			var errStr string
			switch method {
			case "info":
				mode := "install"
				if uninst {
					mode = "uninstall"
				}
				res = map[string]any{"lang": uiLang, "mode": mode, "version": version, "publisher": publisher, "dir": defaultDir(), "installed": isInstalled(), "required": 8 * 1024 * 1024, "free": freeSpace(defaultDir())}
			case "free":
				var d string
				if len(args) > 0 {
					_ = json.Unmarshal(args[0], &d)
				}
				res = freeSpace(d)
			case "confirmCancel":
				ch := make(chan bool, 1)
				text := L("ต้องการยกเลิกการติดตั้ง "+appName+" หรือไม่?", "Are you sure you want to cancel "+appName+" Setup?")
				if uninst {
					text = L("ต้องการยกเลิกการถอนการติดตั้ง "+appName+" หรือไม่?", "Are you sure you want to cancel the uninstall?")
				}
				wv.Dispatch(func() { ch <- msgOwner(hwnd, text, mbYesNo|mbIconQ) == idYes })
				if <-ch {
					finished = true
					wv.Dispatch(func() { closeWindow(hwnd) })
				}
			case "minimize":
				wv.Dispatch(func() { minimizeWindow(hwnd) })
			case "close":
				if !busy {
					finished = true
					wv.Dispatch(func() { closeWindow(hwnd) })
				}
			case "startDrag":
				wv.Dispatch(func() { startDrag(hwnd) })
			case "pickFolder":
				ch := make(chan string, 1)
				wv.Dispatch(func() { ch <- pickFolder(hwnd) })
				res = <-ch
			case "install":
				var o installOpts
				if len(args) > 0 {
					_ = json.Unmarshal(args[0], &o)
				}
				busy = true
				t, err := doInstall(o, progress)
				busy = false
				if err != nil {
					errStr = err.Error()
				} else {
					installed = t
					res = t
				}
			case "launch":
				finished = true
				if installed != "" {
					launchApp(installed)
				}
				wv.Dispatch(func() { closeWindow(hwnd) })
			case "uninstall":
				var also bool
				if len(args) > 0 {
					_ = json.Unmarshal(args[0], &also)
				}
				busy = true
				doUninstall(selfDir, also, progress)
				busy = false
				finished = true
				uninstDone = true
				res = true
			case "finishUninstall":
				finished = true
				wv.Dispatch(func() { closeWindow(hwnd) })
			}
			ok := errStr == ""
			var payload []byte
			if ok {
				payload, _ = json.Marshal(res)
			} else {
				payload, _ = json.Marshal(errStr)
			}
			eval(fmt.Sprintf("window.__goResolve(%d,%v,%s)", id, ok, payload))
		}()
	})
	wv.SetHtml(withFonts(uiHTML))
	wv.Run()
	if uninstDone {
		removeInstallDir(selfDir)
	}
	return true
}
