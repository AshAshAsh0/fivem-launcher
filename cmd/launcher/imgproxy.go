package main

// พร็อกซีรูปภาพ (โลโก้/แบนเนอร์เซิร์ฟ): หน้าเว็บโหลดรูปจากเซิร์ฟภายนอกตรง ๆ ไม่ได้ทุกแหล่ง
// จึงให้ตัวโปรแกรมดาวน์โหลดแทน แล้วเก็บแคชไว้ในเครื่อง (โหลดครั้งเดียว ครั้งต่อไปเปิดทันที)

import (
	"crypto/sha1"
	"encoding/hex"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

const (
	imgMaxBytes   = 6 << 20
	imgCacheFiles = 600
)

var (
	imgSem      = make(chan struct{}, 6)
	imgInflight sync.Map // key -> *sync.Mutex (กันโหลดรูปเดียวกันซ้ำพร้อมกัน)
	imgPruneMu  sync.Mutex
	imgMiss     sync.Map // key -> time: รูปที่โหลดไม่ได้ (เช่นเซิร์ฟไม่มีโลโก้) ไม่ต้องลองซ้ำ 30 นาที
)

func imgCacheDir() string { return filepath.Join(os.Getenv("LOCALAPPDATA"), appTitle, "img-cache") }

// อนุญาตเฉพาะ https ไปยังโฮสต์สาธารณะ (ไม่ให้ใช้ยิงเข้าเครือข่ายในบ้าน)
func imgAllowed(raw string) (*url.URL, bool) {
	u, err := url.Parse(raw)
	if err != nil || u.Scheme != "https" || u.Host == "" || len(raw) > 2000 {
		return nil, false
	}
	host := strings.ToLower(u.Hostname())
	if host == "localhost" || strings.HasSuffix(host, ".local") || strings.HasSuffix(host, ".localhost") {
		return nil, false
	}
	if ip := net.ParseIP(host); ip != nil && (ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() || ip.IsUnspecified()) {
		return nil, false
	}
	return u, true
}

func serveImage(w http.ResponseWriter, r *http.Request) {
	raw := r.URL.Query().Get("u")
	u, ok := imgAllowed(raw)
	if !ok {
		http.Error(w, "bad url", 400)
		return
	}
	sum := sha1.Sum([]byte(u.String()))
	key := hex.EncodeToString(sum[:])
	dir := imgCacheDir()
	file := filepath.Join(dir, key)

	if b, ct, ok := readCached(file); ok {
		writeImg(w, b, ct)
		return
	}
	if t, ok := imgMiss.Load(key); ok && time.Since(t.(time.Time)) < 30*time.Minute {
		http.Error(w, "unavailable", 404)
		return
	}
	m, _ := imgInflight.LoadOrStore(key, &sync.Mutex{})
	mu := m.(*sync.Mutex)
	mu.Lock()
	defer mu.Unlock()
	if b, ct, ok := readCached(file); ok {
		writeImg(w, b, ct)
		return
	}

	imgSem <- struct{}{}
	b, ct, err := downloadImage(u.String())
	<-imgSem
	if err != nil {
		imgMiss.Store(key, time.Now())
		http.Error(w, "unavailable", 404)
		return
	}
	_ = os.MkdirAll(dir, 0o755)
	if os.WriteFile(file+".tmp", b, 0o644) == nil {
		_ = os.WriteFile(file+".ct", []byte(ct), 0o644)
		_ = os.Rename(file+".tmp", file)
	}
	go pruneImgCache()
	writeImg(w, b, ct)
}

func readCached(file string) ([]byte, string, bool) {
	b, err := os.ReadFile(file)
	if err != nil || len(b) == 0 {
		return nil, "", false
	}
	ct, _ := os.ReadFile(file + ".ct")
	return b, string(ct), true
}

func writeImg(w http.ResponseWriter, b []byte, ct string) {
	if !strings.HasPrefix(ct, "image/") {
		ct = http.DetectContentType(b)
	}
	w.Header().Set("Content-Type", ct)
	w.Header().Set("Cache-Control", "max-age=86400")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	_, _ = w.Write(b)
}

func downloadImage(u string) ([]byte, string, error) {
	req, err := http.NewRequest("GET", u, nil)
	if err != nil {
		return nil, "", err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) FiveM-Launcher/"+version)
	req.Header.Set("Accept", "image/avif,image/webp,image/png,image/*;q=0.8")
	client := &http.Client{Timeout: 20 * time.Second, Transport: httpClient.Transport}
	res, err := client.Do(req)
	if err != nil {
		return nil, "", err
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		return nil, "", errStatus
	}
	b, err := io.ReadAll(io.LimitReader(res.Body, imgMaxBytes+1))
	if err != nil || len(b) > imgMaxBytes || len(b) == 0 {
		return nil, "", errStatus
	}
	ct := res.Header.Get("Content-Type")
	if !strings.HasPrefix(ct, "image/") {
		ct = http.DetectContentType(b)
	}
	if !strings.HasPrefix(ct, "image/") {
		return nil, "", errStatus
	}
	return b, ct, nil
}

type statusErr struct{}

func (statusErr) Error() string { return "bad response" }

var errStatus = statusErr{}

// เก็บแคชไม่เกิน imgCacheFiles รูป (ลบรูปที่เก่าที่สุดออก)
func pruneImgCache() {
	if !imgPruneMu.TryLock() {
		return
	}
	defer imgPruneMu.Unlock()
	ents, err := os.ReadDir(imgCacheDir())
	if err != nil {
		return
	}
	type f struct {
		name string
		t    time.Time
	}
	files := []f{}
	for _, e := range ents {
		if e.IsDir() || strings.Contains(e.Name(), ".") {
			continue
		}
		if info, err := e.Info(); err == nil {
			files = append(files, f{e.Name(), info.ModTime()})
		}
	}
	if len(files) <= imgCacheFiles {
		return
	}
	sort.Slice(files, func(i, j int) bool { return files[i].t.After(files[j].t) })
	for _, x := range files[imgCacheFiles:] {
		p := filepath.Join(imgCacheDir(), x.name)
		_ = os.Remove(p)
		_ = os.Remove(p + ".ct")
	}
}
