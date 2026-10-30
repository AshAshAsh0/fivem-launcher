package main

// รายชื่อเซิร์ฟสาธารณะของ FiveM (master list)
// รูปแบบ: ซ้ำไปเรื่อย ๆ [ความยาว uint32 little-endian][ข้อความ protobuf master.Server]
//   Server     { 1: EndPoint string, 2: Data ServerData }
//   ServerData { 1: svMaxclients, 2: clients, 4: hostname, 11: iconVersion, 12: vars map<string,string>, ... }

import (
	"bufio"
	"runtime/debug"
	"encoding/binary"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"sync"
	"time"
)

const serverListURL = "https://frontend.cfx-services.net/api/servers/streamRedir/"

type listServer struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Desc     string `json:"desc"`
	Players  int    `json:"players"`
	Max      int    `json:"max"`
	Locale   string `json:"locale"`
	Tags     string `json:"tags"`
	Icon     string `json:"icon"`
	Banner   string `json:"banner"`
	Private  bool   `json:"private"`  // เซิร์ฟส่วนตัว: เข้าจากรายชื่อไม่ได้ ต้องเข้าผ่านช่องทางของเซิร์ฟเอง
	Endpoint string `json:"endpoint"` // ที่อยู่ตรงสำหรับเชื่อมต่อ (ว่าง = เซิร์ฟซ่อน IP ต้องใช้ cfx.re/join)
	Discord  string `json:"discord"`
	Website  string `json:"website"`
	search   string
	isThai   bool
}

var serverList struct {
	sync.Mutex
	items   []*listServer
	fetched time.Time
	loading bool
	err     error
	done    chan struct{}
	used    time.Time
}

// serverListJanitor คืน RAM ของรายชื่อเซิร์ฟ ถ้าไม่ได้ใช้หน้าค้นหาเกิน 10 นาที
func serverListJanitor() {
	for range time.Tick(time.Minute) {
		serverList.Lock()
		if serverList.items != nil && !serverList.loading && time.Since(serverList.used) > 10*time.Minute {
			serverList.items = nil
			serverList.fetched = time.Time{}
			serverList.Unlock()
			debug.FreeOSMemory()
			continue
		}
		serverList.Unlock()
	}
}

// ---------- protobuf (เฉพาะที่ต้องใช้) ----------

func pbVarint(b []byte, i int) (uint64, int, error) {
	var v uint64
	for s := uint(0); s < 64; s += 7 {
		if i >= len(b) {
			return 0, i, io.ErrUnexpectedEOF
		}
		c := b[i]
		i++
		v |= uint64(c&0x7f) << s
		if c < 0x80 {
			return v, i, nil
		}
	}
	return 0, i, errors.New("varint overflow")
}

// pbFields เรียก fn กับทุก field ในข้อความ (val = ค่าตัวเลข, data = ข้อมูลแบบ length-delimited)
func pbFields(b []byte, fn func(field int, wt int, val uint64, data []byte)) error {
	i := 0
	for i < len(b) {
		key, n, err := pbVarint(b, i)
		if err != nil {
			return err
		}
		i = n
		field, wt := int(key>>3), int(key&7)
		switch wt {
		case 0:
			v, n, err := pbVarint(b, i)
			if err != nil {
				return err
			}
			i = n
			fn(field, wt, v, nil)
		case 1:
			if i+8 > len(b) {
				return io.ErrUnexpectedEOF
			}
			fn(field, wt, binary.LittleEndian.Uint64(b[i:]), nil)
			i += 8
		case 2:
			l, n, err := pbVarint(b, i)
			if err != nil {
				return err
			}
			i = n
			if l > uint64(len(b)-i) {
				return io.ErrUnexpectedEOF
			}
			fn(field, wt, 0, b[i:i+int(l)])
			i += int(l)
		case 5:
			if i+4 > len(b) {
				return io.ErrUnexpectedEOF
			}
			fn(field, wt, uint64(binary.LittleEndian.Uint32(b[i:])), nil)
			i += 4
		default:
			return fmt.Errorf("unsupported wire type %d", wt)
		}
	}
	return nil
}

func decodeListServer(msg []byte) *listServer {
	s := &listServer{}
	var data []byte
	_ = pbFields(msg, func(f, wt int, v uint64, d []byte) {
		switch {
		case f == 1 && wt == 2:
			s.ID = string(d)
		case f == 2 && wt == 2:
			data = d
		}
	})
	if s.ID == "" || data == nil {
		return nil
	}
	var hostname string
	iconVer, hasIcon := int32(0), false
	vars := map[string]string{}
	_ = pbFields(data, func(f, wt int, v uint64, d []byte) {
		switch {
		case f == 1 && wt == 0:
			s.Max = int(int32(v))
		case f == 2 && wt == 0:
			s.Players = int(int32(v))
		case f == 4 && wt == 2:
			hostname = string(d)
		case f == 11 && wt == 0:
			iconVer, hasIcon = int32(v), true
		case f == 18 && wt == 2:
			if strings.Contains(strings.ToLower(string(d)), "private-placeholder") {
				s.Private = true
			}
			if s.Endpoint == "" {
				s.Endpoint = usableEndpoint(string(d))
			}
		case f == 12 && wt == 2:
			var k, val string
			_ = pbFields(d, func(f2, wt2 int, _ uint64, d2 []byte) {
				if wt2 == 2 && f2 == 1 {
					k = string(d2)
				} else if wt2 == 2 && f2 == 2 {
					val = string(d2)
				}
			})
			switch k {
			case "sv_projectName", "sv_projectDesc", "locale", "tags", "banner_detail", "banner_connecting", "sv_maxClients", "icon_url", "discord_link", "Discord", "discord", "Website", "website":
				vars[k] = val
			}
		}
	})
	s.Name = stripColors(vars["sv_projectName"])
	if s.Name == "" {
		s.Name = stripColors(hostname)
	}
	if s.Name == "" {
		s.Name = s.ID
	}
	s.Name = clip(s.Name, 80)
	s.Desc = stripColors(vars["sv_projectDesc"])
	s.Desc = clip(s.Desc, 140)
	s.Locale = vars["locale"]
	s.Tags = vars["tags"]
	s.Tags = clip(s.Tags, 100)
	// โลโก้: ระบบใหม่ของ Cfx ส่งที่อยู่รูปมาใน vars.icon_url (cfx-server-metadata) — ใช้อันนี้ก่อน
	// ถ้าไม่มี ใช้ระบบเดิม (iconVersion) เฉพาะเซิร์ฟที่ระบุเวอร์ชันมา
	if u := strings.TrimSpace(vars["icon_url"]); strings.HasPrefix(u, "https://") && len(u) < 500 {
		s.Icon = u
	} else if hasIcon && iconVer != 0 {
		s.Icon = fmt.Sprintf("https://frontend.cfx-services.net/api/servers/icon/%s/%d.png", s.ID, iconVer)
	}
	for _, k := range []string{"discord_link", "Discord", "discord"} {
		if d := cleanLink(vars[k], true); d != "" {
			s.Discord = d
			break
		}
	}
	for _, k := range []string{"Website", "website"} {
		if w := cleanLink(vars[k], false); w != "" {
			s.Website = w
			break
		}
	}
	if b := vars["banner_detail"]; strings.HasPrefix(b, "https://") {
		s.Banner = b
	} else if b := vars["banner_connecting"]; strings.HasPrefix(b, "https://") {
		s.Banner = b
	}
	if s.Max == 0 {
		fmt.Sscan(vars["sv_maxClients"], &s.Max)
	}
	s.isThai = strings.HasPrefix(strings.ToLower(s.Locale), "th") || hasThaiRune(s.Name) || hasThaiRune(s.Desc)
	s.search = strings.ToLower(s.Name + " " + s.Desc + " " + s.Tags + " " + s.ID)
	return s
}

// cleanLink รับเฉพาะลิงก์ http(s) ปกติ (discord = ต้องเป็นลิงก์เชิญ discord) — ใส่ https:// ให้ถ้าไม่มี
func cleanLink(v string, discord bool) string {
	v = strings.TrimSpace(v)
	if v == "" || len(v) > 200 || strings.ContainsAny(v, " \t\n\"'<>") {
		return ""
	}
	low := strings.ToLower(v)
	if !strings.HasPrefix(low, "http://") && !strings.HasPrefix(low, "https://") {
		v = "https://" + v
		low = "https://" + low
	}
	if discord && !strings.Contains(low, "discord.gg/") && !strings.Contains(low, "discord.com/invite/") {
		return ""
	}
	if u, err := url.Parse(v); err != nil || !strings.Contains(u.Hostname(), ".") || strings.Contains(u.Hostname(), ":") {
		return ""
	}
	return v
}

// usableEndpoint คืนที่อยู่ที่เชื่อมต่อตรงได้ (IP:Port หรือ https URL) — ตัดค่าที่เซิร์ฟซ่อนไว้ทิ้ง
func usableEndpoint(e string) string {
	e = strings.TrimSpace(e)
	low := strings.ToLower(e)
	if e == "" || strings.Contains(low, "placeholder") || strings.Contains(low, "private") || strings.Contains(low, "cfx.re") {
		return ""
	}
	if strings.HasPrefix(low, "https://") || strings.HasPrefix(low, "http://") {
		return strings.TrimRight(e, "/")
	}
	if host, port, ok := strings.Cut(e, ":"); ok && host != "" && port != "" && !strings.ContainsAny(e, " /") {
		if host == "0.0.0.0" || strings.HasPrefix(host, "127.") || strings.HasPrefix(host, "10.") || strings.HasPrefix(host, "192.168.") {
			return ""
		}
		return e
	}
	return ""
}

// clip ตัดข้อความตามจำนวนตัวอักษร (ไม่ตัดกลางตัวอักษรไทย)
func clip(s string, n int) string {
	r := []rune(s)
	if len(r) <= n {
		return s
	}
	return string(r[:n]) + "…"
}

func hasThaiRune(s string) bool {
	for _, r := range s {
		if r >= 0x0E00 && r <= 0x0E7F {
			return true
		}
	}
	return false
}

// parseServerStream อ่าน stream ทั้งหมด
func parseServerStream(r io.Reader) ([]*listServer, error) {
	br := bufio.NewReaderSize(r, 256<<10)
	out := make([]*listServer, 0, 32000)
	var hdr [4]byte
	buf := make([]byte, 0, 64<<10)
	for {
		if _, err := io.ReadFull(br, hdr[:]); err != nil {
			if err == io.EOF || err == io.ErrUnexpectedEOF {
				break
			}
			return out, err
		}
		n := binary.LittleEndian.Uint32(hdr[:])
		if n == 0 || n > 16<<20 {
			break
		}
		if cap(buf) < int(n) {
			buf = make([]byte, n)
		}
		buf = buf[:n]
		if _, err := io.ReadFull(br, buf); err != nil {
			break
		}
		if s := decodeListServer(buf); s != nil {
			out = append(out, s)
		}
	}
	if len(out) == 0 {
		return nil, errors.New("empty server list")
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Players > out[j].Players })
	return out, nil
}

func fetchServerList() ([]*listServer, error) {
	client := &http.Client{Timeout: 90 * time.Second, Transport: httpClient.Transport}
	req, _ := http.NewRequest("GET", serverListURL, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (FiveM-Launcher)")
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		return nil, fmt.Errorf("HTTP %d", res.StatusCode)
	}
	return parseServerStream(io.LimitReader(res.Body, 200<<20))
}

// loadServerList คืนรายชื่อจากแคช (อายุ 5 นาที) หรือโหลดใหม่ — ถ้ามีการโหลดอยู่แล้วจะรอผลเดียวกัน
func loadServerList(force bool) ([]*listServer, time.Time, error) {
	serverList.Lock()
	serverList.used = time.Now()
	if !force && serverList.items != nil && time.Since(serverList.fetched) < 5*time.Minute {
		items, at := serverList.items, serverList.fetched
		serverList.Unlock()
		return items, at, nil
	}
	if serverList.loading {
		done := serverList.done
		serverList.Unlock()
		<-done
		serverList.Lock()
		defer serverList.Unlock()
		return serverList.items, serverList.fetched, serverList.err
	}
	serverList.loading = true
	serverList.done = make(chan struct{})
	serverList.Unlock()

	items, err := fetchServerList()

	serverList.Lock()
	defer serverList.Unlock()
	if err == nil {
		serverList.items, serverList.fetched = items, time.Now()
	}
	serverList.err = err
	serverList.loading = false
	close(serverList.done)
	if err != nil && serverList.items != nil {
		return serverList.items, serverList.fetched, nil // ใช้ของเดิมไปก่อน
	}
	return serverList.items, serverList.fetched, err
}

// browseServers ค้นหา/กรอง แล้วคืนเป็นหน้า ๆ
type browseOpts struct {
	hidePrivate bool
	hideFull    bool
	sort        string // "players" (ค่าเริ่มต้น) | "name"
}

func browseServers(query, region string, offset, limit int, force bool, opt browseOpts) map[string]any {
	items, at, err := loadServerList(force)
	if err != nil {
		return map[string]any{"error": errText(err)}
	}
	q := strings.Fields(strings.ToLower(strings.TrimSpace(query)))
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if opt.sort == "name" {
		sorted := make([]*listServer, len(items))
		copy(sorted, items)
		sort.SliceStable(sorted, func(i, j int) bool { return strings.ToLower(sorted[i].Name) < strings.ToLower(sorted[j].Name) })
		items = sorted
	}
	total, players := 0, 0
	page := make([]*listServer, 0, limit)
	for _, s := range items {
		if region == "th" && !s.isThai {
			continue
		}
		if opt.hidePrivate && s.Private {
			continue
		}
		if opt.hideFull && s.Max > 0 && s.Players >= s.Max {
			continue
		}
		ok := true
		for _, w := range q {
			if !strings.Contains(s.search, w) {
				ok = false
				break
			}
		}
		if !ok {
			continue
		}
		if total >= offset && len(page) < limit {
			page = append(page, s)
		}
		total++
		players += s.Players
	}
	return map[string]any{
		"items":   page,
		"total":   total,
		"players": players,
		"all":     len(items),
		"updated": at.Unix(),
	}
}
