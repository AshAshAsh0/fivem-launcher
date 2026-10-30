package main

// กันข้อมูลหาย: ทุกครั้งที่การบันทึกจะทำให้จำนวนเซิร์ฟลดลง
// จะสำรองไฟล์เดิมไว้ในโฟลเดอร์ backups (เก็บล่าสุด 10 ไฟล์) และจดบันทึกว่าเกิดจากอะไร (data-log.txt)

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"
)

var writeMu sync.Mutex

const keepBackups = 10

var backupName = regexp.MustCompile(`^launcher-data-\d{8}-\d{6}(-\d+)?\.json$`)

func backupDir() string { return filepath.Join(dataDir, "backups") }

func countServers(v map[string]any) int {
	if a, ok := v["servers"].([]any); ok {
		return len(a)
	}
	return 0
}

func guardShrink(path string, next map[string]any, why string) {
	old, err := os.ReadFile(path)
	if err != nil {
		return
	}
	var prev map[string]any
	if json.Unmarshal(old, &prev) != nil {
		return
	}
	before, after := countServers(prev), countServers(next)
	if after >= before {
		return
	}
	_ = os.MkdirAll(backupDir(), 0o755)
	name := "launcher-data-" + time.Now().Format("20060102-150405") + ".json"
	for i := 2; fileExists(filepath.Join(backupDir(), name)); i++ {
		name = fmt.Sprintf("launcher-data-%s-%d.json", time.Now().Format("20060102-150405"), i)
	}
	_ = os.WriteFile(filepath.Join(backupDir(), name), old, 0o644)
	pruneBackups()
	if why == "" {
		why = "unknown"
	}
	why = strings.NewReplacer("\n", " ", "\r", " ").Replace(why)
	if len(why) > 600 {
		why = why[:600]
	}
	line := fmt.Sprintf("%s v%s servers %d -> %d backup=%s why=%s\r\n", time.Now().Format("2006-01-02 15:04:05"), version, before, after, name, why)
	if f, err := os.OpenFile(filepath.Join(dataDir, "data-log.txt"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644); err == nil {
		_, _ = f.WriteString(line)
		_ = f.Close()
	}
}

func fileExists(p string) bool { _, err := os.Stat(p); return err == nil }

func backupFiles() []os.DirEntry {
	ents, _ := os.ReadDir(backupDir())
	out := ents[:0]
	for _, e := range ents {
		if !e.IsDir() && backupName.MatchString(e.Name()) {
			out = append(out, e)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name() > out[j].Name() }) // ใหม่สุดก่อน
	return out
}

func pruneBackups() {
	for i, e := range backupFiles() {
		if i >= keepBackups {
			_ = os.Remove(filepath.Join(backupDir(), e.Name()))
		}
	}
}

func listBackups() []map[string]any {
	out := []map[string]any{}
	for _, e := range backupFiles() {
		b, err := os.ReadFile(filepath.Join(backupDir(), e.Name()))
		if err != nil {
			continue
		}
		var v map[string]any
		if json.Unmarshal(b, &v) != nil {
			continue
		}
		info, _ := e.Info()
		t := int64(0)
		if info != nil {
			t = info.ModTime().UnixMilli()
		}
		names := []string{}
		if a, ok := v["servers"].([]any); ok {
			for _, s := range a {
				if m, ok := s.(map[string]any); ok {
					if n, ok := m["name"].(string); ok && len(names) < 4 {
						names = append(names, clip(n, 30))
					}
				}
			}
		}
		out = append(out, map[string]any{"name": e.Name(), "time": t, "servers": countServers(v), "names": names})
	}
	return out
}

func readBackup(name string) any {
	if !backupName.MatchString(name) {
		return nil
	}
	b, err := os.ReadFile(filepath.Join(backupDir(), name))
	if err != nil || !json.Valid(b) {
		return nil
	}
	return json.RawMessage(b)
}
