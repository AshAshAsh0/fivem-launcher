//go:build windows

package main

import (
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
	"unsafe"

	webview2 "github.com/jchv/go-webview2"
	"golang.org/x/sys/windows"
)

//go:embed web
var webFS embed.FS

// version ถูกแทนค่าตอน build ด้วย -ldflags "-X main.version=..."
var version = "3.16.2"

const (
	appTitle = "FiveM Launcher"
	winW     = 1120
	winH     = 710
)

var (
	wv       webview2.WebView
	hwnd     uintptr
	dataDir  string
	saveMu   sync.Mutex
	saveTmr  *time.Timer
	pending  []byte
	custom   string
	customMu sync.Mutex
	cacheDir = []string{"crashes", "data/cache", "data/server-cache", "data/server-cache-priv"}
)

func main() {
	if !singleInstance(appTitle) {
		return
	}
	dataDir = filepath.Join(os.Getenv("APPDATA"), appTitle)
	_ = os.MkdirAll(dataDir, 0o755)

	// เสิร์ฟหน้าเว็บจาก exe ผ่าน localhost (พอร์ตสุ่ม เปิดเฉพาะเครื่องตัวเอง)
	sub, _ := fs.Sub(webFS, "web")
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		messageBox(0, "เปิดโปรแกรมไม่สำเร็จ: "+err.Error(), appTitle, 0x10)
		return
	}
	mux := http.NewServeMux()
	fileSrv := http.FileServer(http.FS(sub))
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-store")
		fileSrv.ServeHTTP(w, r)
	})
	mux.HandleFunc("/img", serveImage) // โลโก้/แบนเนอร์เซิร์ฟผ่านตัวโปรแกรม + แคช
	go http.Serve(ln, mux)

	webview2.FramelessPopup = true
	lastMin := false
	webview2.OnMessage = func(msg, wp, lp uintptr) bool {
		if msg == 0x02E0 { // WM_DPICHANGED: ย้ายไปจอที่ DPI ต่างกัน ปรับขนาดหน้าต่างตามที่ Windows แนะนำ
			r := (*[4]int32)(unsafe.Pointer(lp))
			pSetWindowPos.Call(hwnd, 0, uintptr(r[0]), uintptr(r[1]), uintptr(r[2]-r[0]), uintptr(r[3]-r[1]), 0x0004|0x0010) // NOZORDER|NOACTIVATE
			return true
		}
		return handleTrayMessage(msg, wp, lp)
	}
	webview2.OnClose = func() bool {
		trayRemove() // ไม่ให้ไอคอนค้างข้างนาฬิกาหลังปิดโปรแกรม
		return true
	}
	go serverListJanitor()
	webview2.OnMinimize = func(min bool) {
		if wv == nil || min == lastMin {
			return
		}
		lastMin = min
		b, _ := json.Marshal(map[string]bool{"visible": !min})
		wv.Eval("window.__goVisibility && window.__goVisibility(" + string(b) + ")")
	}

	// สีพื้นหลังตอนเปิดโปรแกรม ให้ตรงกับธีม (กันจอขาวแวบ)
	bg, startLang := "FF0B0C0E", ""
	_ = os.Remove(filepath.Join(dataDir, "wallpaper.jpg")) // รูปพื้นหลังจากเวอร์ชันเก่า (เลิกใช้แล้ว)
	if b, err := os.ReadFile(filepath.Join(dataDir, "launcher-data.json")); err == nil {
		if strings.Contains(string(b), `"lang": "en"`) {
			startLang = "en"
		} else if strings.Contains(string(b), `"lang": "th"`) {
			startLang = "th"
		}
	}
	os.Setenv("WEBVIEW2_DEFAULT_BACKGROUND_COLOR", bg)

	wv = webview2.NewWithOptions(webview2.WebViewOptions{
		Debug:     os.Getenv("FL_DEBUG") == "1",
		AutoFocus: true,
		DataPath:  filepath.Join(os.Getenv("LOCALAPPDATA"), appTitle, "WebView2"),
		WindowOptions: webview2.WindowOptions{
			Title:  appTitle,
			Width:  winW,
			Height: winH,
			IconId: 1,
			Center: true,
		},
	})
	if wv == nil {
		if messageBox(0, "เครื่องนี้ยังไม่มี Microsoft Edge WebView2 Runtime\nกด OK เพื่อเปิดหน้าดาวน์โหลด (ติดตั้งแล้วเปิดโปรแกรมใหม่)", appTitle, 0x31) == 1 {
			shellOpen("https://go.microsoft.com/fwlink/p/?LinkId=2124703", "")
		}
		return
	}
	defer wv.Destroy()
	hwnd = uintptr(wv.Window())
	placeWindow(hwnd, winW, winH)

	_ = wv.Bind("goCall", func(id int, method string, args string) {
		go func() {
			res, err := handle(method, args)
			var js string
			if err != nil {
				b, _ := json.Marshal(err.Error())
				js = fmt.Sprintf("window.__goResolve(%d,false,%s)", id, b)
			} else {
				b, mErr := json.Marshal(res)
				if mErr != nil {
					b = []byte("null")
				}
				js = fmt.Sprintf("window.__goResolve(%d,true,%s)", id, b)
			}
			wv.Dispatch(func() { wv.Eval(js) })
		}()
	})
	// ส่งธีม/ภาษาไปให้หน้า loading ใช้ได้ตั้งแต่เฟรมแรก
	wv.Navigate(fmt.Sprintf("http://127.0.0.1:%d/index.html?lang=%s&v=%s", ln.Addr().(*net.TCPAddr).Port, startLang, version))
	wv.Run()
	flushSave()
}

// onUI รันฟังก์ชันบน UI thread แล้วรอผล
func onUI[T any](f func() T) T {
	ch := make(chan T, 1)
	wv.Dispatch(func() { ch <- f() })
	return <-ch
}

func arg[T any](args []json.RawMessage, i int) T {
	var v T
	if i < len(args) {
		_ = json.Unmarshal(args[i], &v)
	}
	return v
}

func setCustomPath(p string) {
	customMu.Lock()
	custom = p
	customMu.Unlock()
}

func fivemPath() string {
	customMu.Lock()
	c := custom
	customMu.Unlock()
	if c != "" {
		return c
	}
	return filepath.Join(os.Getenv("LOCALAPPDATA"), "FiveM", "FiveM.exe")
}

func exists(p string) bool { _, err := os.Stat(p); return err == nil }

func handle(method, raw string) (any, error) {
	var args []json.RawMessage
	_ = json.Unmarshal([]byte(raw), &args)

	switch method {
	case "minimize":
		wv.Dispatch(func() { minimizeWindow(hwnd) })
	case "close":
		wv.Dispatch(func() { closeWindow(hwnd) })
	case "startDrag":
		wv.Dispatch(func() { startDrag(hwnd) })
	case "isMinimized":
		return isMinimized(hwnd), nil

	case "load":
		b, err := os.ReadFile(filepath.Join(dataDir, "launcher-data.json"))
		if err != nil {
			return nil, nil
		}
		return json.RawMessage(b), nil
	case "save":
		if len(args) > 0 {
			scheduleSave(args[0])
		}
		return true, nil
	case "listBackups":
		return listBackups(), nil
	case "readBackup":
		return readBackup(arg[string](args, 0)), nil

	case "query":
		opts := arg[map[string]any](args, 1)
		with, _ := opts["withImages"].(bool)
		return queryServer(arg[string](args, 0), with), nil
	case "fetchImage":
		return orNil(fetchDataURI(arg[string](args, 0))), nil

	case "fivemStatus":
		if s := arg[string](args, 0); s != "" && exists(s) {
			setCustomPath(s)
		}
		p := fivemPath()
		return map[string]any{"path": p, "found": exists(p), "custom": p != filepath.Join(os.Getenv("LOCALAPPDATA"), "FiveM", "FiveM.exe")}, nil
	case "pickFiveM":
		p := onUI(func() string { return fileDialog(hwnd, false, "เลือกไฟล์ FiveM.exe", "FiveM (FiveM.exe)", "*.exe", "", "") })
		if p == "" {
			return nil, nil
		}
		setCustomPath(p)
		return map[string]any{"path": p, "found": true, "custom": true}, nil
	case "launch":
		target := strings.TrimSpace(arg[string](args, 0))
		after := arg[string](args, 1)
		// ทำที่อยู่ให้อยู่ในรูปที่ FiveM รับได้ (เช่น ตัด "connect " หรือช่องว่างที่ติดมา)
		if a := parseAddress(target); a != nil {
			target = a.Connect
		}
		if target == "" || strings.ContainsAny(target, " \t\r\n\"'<>|^") {
			return nil, errors.New("รูปแบบที่อยู่ไม่ถูกต้อง")
		}
		if !openViaExplorer("fivem://connect/" + target) {
			return nil, errors.New("เปิด FiveM ไม่สำเร็จ (ติดตั้ง FiveM แล้วหรือยัง?)")
		}
		switch after {
		case "minimize":
			wv.Dispatch(func() { minimizeWindow(hwnd) })
		case "quit":
			time.AfterFunc(1500*time.Millisecond, func() { wv.Dispatch(func() { closeWindow(hwnd) }) })
		}
		return map[string]any{"ok": true}, nil
	case "openFiveM":
		if exists(fivemPath()) && openViaExplorer(fivemPath()) {
			return true, nil
		}
		return openViaExplorer("fivem://"), nil
	case "openExternal":
		u := arg[string](args, 0)
		if strings.HasPrefix(u, "http://") || strings.HasPrefix(u, "https://") || strings.HasPrefix(u, "discord://") {
			shellOpen(u, "")
		}

	case "scanCache":
		app := filepath.Join(filepath.Dir(fivemPath()), "FiveM.app")
		items := []map[string]any{}
		var total int64
		for _, d := range cacheDir {
			sz, ok := dirSize(filepath.Join(app, filepath.FromSlash(d)))
			if ok {
				total += sz
				items = append(items, map[string]any{"name": d, "size": sz})
			} else {
				items = append(items, map[string]any{"name": d, "size": nil})
			}
		}
		return map[string]any{"appDir": app, "exists": exists(app), "running": isFiveMRunning(), "items": items, "total": total}, nil
	case "clearCache":
		if isFiveMRunning() {
			return map[string]any{"ok": false, "error": "กรุณาปิด FiveM ก่อนล้างแคช"}, nil
		}
		app := filepath.Join(filepath.Dir(fivemPath()), "FiveM.app")
		var freed int64
		for _, d := range cacheDir {
			p := filepath.Join(app, filepath.FromSlash(d))
			if sz, ok := dirSize(p); ok {
				if os.RemoveAll(p) == nil {
					freed += sz
				}
			}
		}
		return map[string]any{"ok": true, "freed": freed}, nil

	case "metrics":
		return metrics(), nil
	case "setPerfMode":
		setPriority(arg[string](args, 0))
	case "browse":
		o := arg[map[string]any](args, 0)
		q, _ := o["q"].(string)
		region, _ := o["region"].(string)
		off, _ := o["offset"].(float64)
		lim, _ := o["limit"].(float64)
		force, _ := o["force"].(bool)
		hidePriv, _ := o["hidePrivate"].(bool)
		hideFull, _ := o["hideFull"].(bool)
		sortBy, _ := o["sort"].(string)
		return browseServers(q, region, int(off), int(lim), force, browseOpts{hidePriv, hideFull, sortBy}), nil
	case "checkUpdate":
		return checkUpdate(arg[string](args, 0))
	case "installUpdate":
		return nil, installUpdate(arg[string](args, 0), arg[string](args, 1))
	case "info":
		v := windows.RtlGetVersion()
		return map[string]any{"version": version, "dataDir": dataDir, "os": fmt.Sprintf("Windows %d.%d build %d", v.MajorVersion, v.MinorVersion, v.BuildNumber)}, nil
	case "setLang":
		if l := arg[string](args, 0); l == "en" || l == "th" {
			currentLang = l
		}
	case "watchStart":
		var w watchItem
		if len(args) > 0 && json.Unmarshal(args[0], &w) == nil && w.ID != "" && w.Address != "" {
			if w.Connect == "" {
				w.Connect = w.Address
			}
			if w.Kind != "online" {
				w.Kind = "slot"
			}
			watchStart(&w)
		}
		return watchList(), nil
	case "watchStop":
		watchStop(arg[string](args, 0))
		return watchList(), nil
	case "watchList":
		return watchList(), nil

	case "exportData":
		name := "fivem-launcher-backup-" + time.Now().Format("2006-01-02") + ".json"
		p := onUI(func() string { return fileDialog(hwnd, true, "ส่งออกข้อมูล", "JSON", "*.json", name, "json") })
		if p == "" || len(args) == 0 {
			return false, nil
		}
		var pretty any
		_ = json.Unmarshal(args[0], &pretty)
		b, _ := json.MarshalIndent(pretty, "", "  ")
		return os.WriteFile(p, b, 0o644) == nil, nil
	case "importData":
		p := onUI(func() string { return fileDialog(hwnd, false, "นำเข้าข้อมูล", "JSON", "*.json", "", "") })
		if p == "" {
			return nil, nil
		}
		b, err := os.ReadFile(p)
		if err != nil || !json.Valid(b) {
			return map[string]any{"error": "ไฟล์ไม่ถูกต้อง"}, nil
		}
		return json.RawMessage(b), nil
	default:
		return nil, errors.New("unknown method " + method)
	}
	return nil, nil
}

func dirSize(p string) (int64, bool) {
	st, err := os.Stat(p)
	if err != nil || !st.IsDir() {
		return 0, false
	}
	var total int64
	_ = filepath.WalkDir(p, func(_ string, d fs.DirEntry, err error) error {
		if err == nil && !d.IsDir() {
			if info, e := d.Info(); e == nil {
				total += info.Size()
			}
		}
		return nil
	})
	return total, true
}

func scheduleSave(b []byte) {
	saveMu.Lock()
	defer saveMu.Unlock()
	pending = append([]byte(nil), b...)
	if saveTmr != nil {
		saveTmr.Stop()
	}
	saveTmr = time.AfterFunc(300*time.Millisecond, flushSave)
}

func flushSave() {
	saveMu.Lock()
	b := pending
	pending = nil
	saveMu.Unlock()
	if b == nil {
		return
	}
	writeMu.Lock()
	defer writeMu.Unlock()
	var v map[string]any
	if json.Unmarshal(b, &v) == nil && v != nil {
		why, _ := v["_why"].(string)
		delete(v, "_why")
		p := filepath.Join(dataDir, "launcher-data.json")
		guardShrink(p, v, why) // ถ้าเซิร์ฟลดลง: สำรองไฟล์เดิม + จดบันทึกสาเหตุ
		if pretty, err := json.MarshalIndent(v, "", "  "); err == nil {
			b = pretty
		}
	}
	p := filepath.Join(dataDir, "launcher-data.json")
	_ = os.MkdirAll(dataDir, 0o755)
	if os.WriteFile(p+".tmp", b, 0o644) == nil {
		_ = os.Rename(p+".tmp", p)
	}
}
