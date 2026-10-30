package main

// ดึงข้อมูลเซิร์ฟเวอร์ FiveM: ชื่อ, ผู้เล่น, ping, โลโก้, แบนเนอร์
// รองรับ: โดเมน, IP:Port, ลิงก์แบบ path, "connect xxx" จาก F8, cfx.re/join/xxxx

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

var httpClient = &http.Client{
	Timeout: 8 * time.Second,
	Transport: &http.Transport{
		Proxy:               http.ProxyFromEnvironment,
		DialContext:         (&net.Dialer{Timeout: 4 * time.Second}).DialContext,
		TLSHandshakeTimeout: 4 * time.Second,
		MaxIdleConnsPerHost: 4,
		IdleConnTimeout:     30 * time.Second,
	},
}

type addrInfo struct {
	Kind    string
	Code    string
	Bases   []string
	Connect string
	Display string
}

var (
	reColor   = regexp.MustCompile(`\^[0-9]|~[a-zA-Z]~`)
	reSpace   = regexp.MustCompile(`\s+`)
	reCfx     = regexp.MustCompile(`(?i)(?:https?://)?cfx\.re/join/([a-z0-9]+)`)
	reHostPrt = regexp.MustCompile(`^\[?([^\]\s/]+?)\]?(?::(\d{1,5}))?$`)
	reIPv4    = regexp.MustCompile(`^\d{1,3}(\.\d{1,3}){3}$`)
	reConnect = regexp.MustCompile(`(?i)^connect\s+`)
	reFivem   = regexp.MustCompile(`(?i)^fivem://connect/`)
)

func stripColors(s string) string {
	s = reColor.ReplaceAllString(s, "")
	return strings.TrimSpace(reSpace.ReplaceAllString(s, " "))
}

func hostPort(host, port, scheme string) *addrInfo {
	if port != "" {
		if scheme == "" {
			scheme = "http"
		}
		disp := host + ":" + port
		if port == "30120" {
			disp = host
		}
		return &addrInfo{Kind: "host", Bases: []string{fmt.Sprintf("%s://%s:%s", scheme, host, port)}, Connect: host + ":" + port, Display: disp}
	}
	if reIPv4.MatchString(host) || strings.Contains(host, ":") {
		return &addrInfo{Kind: "host", Bases: []string{"http://" + host + ":30120"}, Connect: host + ":30120", Display: host}
	}
	// โดเมนไม่ใส่พอร์ต: ให้ FiveM resolve เอง
	return &addrInfo{Kind: "host", Bases: []string{"https://" + host, "http://" + host + ":30120", "http://" + host}, Connect: host, Display: host}
}

func parseAddress(raw string) *addrInfo {
	s := strings.TrimSpace(raw)
	if s == "" {
		return nil
	}
	s = reConnect.ReplaceAllString(s, "")
	s = strings.Trim(s, `"' `)
	s = reFivem.ReplaceAllString(s, "")

	if m := reCfx.FindStringSubmatch(s); m != nil {
		return &addrInfo{Kind: "cfx", Code: m[1], Connect: "cfx.re/join/" + m[1], Display: "cfx.re/join/" + m[1]}
	}
	low := strings.ToLower(s)
	if strings.HasPrefix(low, "http://") || strings.HasPrefix(low, "https://") {
		u, err := url.Parse(s)
		if err != nil || u.Host == "" {
			return nil
		}
		path := strings.TrimRight(u.Path, "/")
		if path == "" {
			return hostPort(u.Hostname(), u.Port(), u.Scheme)
		}
		base := u.Scheme + "://" + u.Host + path
		return &addrInfo{Kind: "url", Bases: []string{base}, Connect: base, Display: base}
	}
	if i := strings.Index(s, "/"); i > 0 && i < len(s)-1 {
		t := strings.TrimRight(s, "/")
		return &addrInfo{Kind: "url", Bases: []string{"https://" + t}, Connect: "https://" + t, Display: t}
	}
	m := reHostPrt.FindStringSubmatch(strings.TrimRight(s, "/"))
	if m == nil {
		return nil
	}
	return hostPort(m[1], m[2], "")
}

type timedResult struct {
	data map[string]any
	ms   int64
	err  error
}

func getJSON(ctx context.Context, u string, timeout time.Duration) timedResult {
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	req, _ := http.NewRequestWithContext(ctx, "GET", u, nil)
	req.Header.Set("User-Agent", "FiveM-Launcher/2.0")
	t0 := time.Now()
	res, err := httpClient.Do(req)
	if err != nil {
		return timedResult{err: err}
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		return timedResult{err: fmt.Errorf("HTTP %d", res.StatusCode)}
	}
	body, err := io.ReadAll(io.LimitReader(res.Body, 8<<20))
	if err != nil {
		return timedResult{err: err}
	}
	ms := time.Since(t0).Milliseconds()
	var v any
	if err := json.Unmarshal(body, &v); err != nil {
		return timedResult{err: err}
	}
	switch t := v.(type) {
	case map[string]any:
		return timedResult{data: t, ms: ms}
	case []any:
		return timedResult{data: map[string]any{"__list": t}, ms: ms}
	}
	return timedResult{err: errors.New("unexpected json")}
}

func fetchDataURI(u string) string {
	if u == "" {
		return ""
	}
	if strings.HasPrefix(u, "data:") {
		return u
	}
	req, err := http.NewRequest("GET", u, nil)
	if err != nil {
		return ""
	}
	req.Header.Set("User-Agent", "FiveM-Launcher/2.0")
	res, err := httpClient.Do(req)
	if err != nil {
		return ""
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		return ""
	}
	b, err := io.ReadAll(io.LimitReader(res.Body, 4<<20+1))
	if err != nil || len(b) > 4<<20 {
		return u
	}
	ct := res.Header.Get("Content-Type")
	if ct == "" {
		ct = http.DetectContentType(b)
	}
	return "data:" + ct + ";base64," + base64.StdEncoding.EncodeToString(b)
}

func str(m map[string]any, k string) string {
	if m == nil {
		return ""
	}
	switch v := m[k].(type) {
	case string:
		return v
	case float64:
		return strconv.FormatFloat(v, 'f', -1, 64)
	}
	return ""
}

func num(m map[string]any, keys ...string) (float64, bool) {
	for _, k := range keys {
		switch v := m[k].(type) {
		case float64:
			return v, true
		case string:
			if f, err := strconv.ParseFloat(v, 64); err == nil {
				return f, true
			}
		}
	}
	return 0, false
}

func vars(m map[string]any) map[string]any {
	if v, ok := m["vars"].(map[string]any); ok {
		return v
	}
	return map[string]any{}
}

func pickBanner(v map[string]any) any {
	b := str(v, "banner_detail")
	if b == "" {
		b = str(v, "banner_connecting")
	}
	if strings.HasPrefix(b, "http://") || strings.HasPrefix(b, "https://") {
		return b
	}
	return nil
}

func tags(v map[string]any) []string {
	out := []string{}
	for _, t := range strings.Split(str(v, "tags"), ",") {
		if t = strings.TrimSpace(t); t != "" {
			out = append(out, t)
		}
	}
	return out
}

func orNil(s string) any {
	if s == "" {
		return nil
	}
	return s
}

// queryServer คืนค่ารูปแบบเดียวกับเวอร์ชัน Node เดิม
func queryServer(raw string, withImages bool) map[string]any {
	a := parseAddress(raw)
	if a == nil {
		return map[string]any{"ok": false, "online": false, "error": "รูปแบบที่อยู่ไม่ถูกต้อง"}
	}
	offline := func(msg string) map[string]any {
		return map[string]any{"ok": true, "online": false, "connect": a.Connect, "display": a.Display, "players": 0, "max": 0, "ping": nil, "error": msg}
	}
	ctx := context.Background()

	if a.Kind == "cfx" {
		// ที่อยู่ใหม่ของ Cfx.re (ที่อยู่เดิม servers-frontend.fivem.net ใช้เป็นตัวสำรอง)
		r := getJSON(ctx, "https://frontend.cfx-services.net/api/servers/single/"+a.Code, 7*time.Second)
		if r.err != nil {
			r = getJSON(ctx, "https://servers-frontend.fivem.net/api/servers/single/"+a.Code, 7*time.Second)
		}
		if r.err != nil {
			return offline(errText(r.err))
		}
		d, _ := r.data["Data"].(map[string]any)
		if d == nil {
			d, _ = r.data["data"].(map[string]any)
		}
		if d == nil {
			return offline("ไม่พบเซิร์ฟเวอร์")
		}
		v := vars(d)
		name := stripColors(str(v, "sv_projectName"))
		if name == "" {
			name = stripColors(str(d, "hostname"))
		}
		if name == "" {
			name = a.Display
		}
		players, _ := num(d, "clients")
		max, _ := num(d, "sv_maxclients", "svMaxclients")
		if max == 0 {
			max, _ = num(v, "sv_maxClients")
		}
		var logo any
		if iv, ok := num(d, "iconVersion"); ok && withImages {
			icon := fetchDataURI(fmt.Sprintf("https://frontend.cfx-services.net/api/servers/icon/%s/%d.png", a.Code, int32(iv)))
			if icon == "" {
				icon = fetchDataURI(fmt.Sprintf("https://servers-live.fivem.net/servers/icon/%s/%d.png", a.Code, int32(iv)))
			}
			logo = orNil(icon)
		}
		return map[string]any{
			"ok": true, "online": true, "connect": a.Connect, "display": a.Display,
			"name": name, "desc": stripColors(str(v, "sv_projectDesc")),
			"players": players, "max": max, "ping": r.ms,
			"logo": logo, "banner": pickBanner(v), "tags": tags(v),
		}
	}

	var dyn, info timedResult
	var base string
	for _, b := range a.Bases {
		var wg sync.WaitGroup
		wg.Add(2)
		go func() { defer wg.Done(); dyn = getJSON(ctx, b+"/dynamic.json", 4500*time.Millisecond) }()
		go func() { defer wg.Done(); info = getJSON(ctx, b+"/info.json", 4500*time.Millisecond) }()
		wg.Wait()
		if dyn.err == nil || info.err == nil {
			base = b
			break
		}
	}
	if base == "" {
		return offline("เชื่อมต่อไม่ได้ (ออฟไลน์หรือปิด info)")
	}
	d, i := dyn.data, info.data
	if d == nil {
		d = map[string]any{}
	}
	if i == nil {
		i = map[string]any{}
	}
	v := vars(i)
	players, ok := num(d, "clients")
	if !ok {
		if p := getJSON(ctx, base+"/players.json", 4*time.Second); p.err == nil {
			if l, ok := p.data["__list"].([]any); ok {
				players = float64(len(l))
			}
		}
	}
	max, _ := num(d, "sv_maxclients")
	if max == 0 {
		max, _ = num(v, "sv_maxClients")
	}
	ping := dyn.ms
	if dyn.err != nil {
		ping = info.ms
	}
	var logo any
	if ic := str(i, "icon"); ic != "" && withImages {
		logo = "data:image/png;base64," + ic
	}
	name := stripColors(str(v, "sv_projectName"))
	if name == "" {
		name = stripColors(str(d, "hostname"))
	}
	if name == "" {
		name = a.Display
	}
	return map[string]any{
		"ok": true, "online": true, "connect": a.Connect, "display": a.Display,
		"name": name, "desc": stripColors(str(v, "sv_projectDesc")),
		"players": players, "max": max, "ping": ping,
		"logo": logo, "banner": pickBanner(v), "tags": tags(v),
	}
}

func errText(err error) string {
	if errors.Is(err, context.DeadlineExceeded) {
		return "หมดเวลาเชื่อมต่อ"
	}
	return err.Error()
}
