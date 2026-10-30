//go:build windows

package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
)

var reRepo = regexp.MustCompile(`^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$`)

// เทียบเวอร์ชันแบบ 1.2.3 คืน true ถ้า a ใหม่กว่า b
func newerThan(a, b string) bool {
	pa, pb := verParts(a), verParts(b)
	for i := 0; i < 3; i++ {
		if pa[i] != pb[i] {
			return pa[i] > pb[i]
		}
	}
	return false
}

func verParts(v string) [3]int {
	v = strings.TrimPrefix(strings.TrimPrefix(strings.TrimSpace(v), "v"), "V")
	if i := strings.IndexAny(v, "-+ "); i >= 0 {
		v = v[:i]
	}
	var out [3]int
	for i, p := range strings.SplitN(v, ".", 3) {
		n, _ := strconv.Atoi(p)
		out[i] = n
	}
	return out
}

func checkUpdate(repo string) (map[string]any, error) {
	if !reRepo.MatchString(repo) {
		return map[string]any{"error": "invalid repo"}, nil
	}
	req, _ := http.NewRequest("GET", "https://api.github.com/repos/"+repo+"/releases/latest", nil)
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "FiveM-Launcher/"+version)
	res, err := httpClient.Do(req)
	if err != nil {
		return map[string]any{"error": err.Error()}, nil
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		return map[string]any{"error": fmt.Sprintf("HTTP %d", res.StatusCode)}, nil
	}
	var rel struct {
		Tag    string `json:"tag_name"`
		Body   string `json:"body"`
		Assets []struct {
			Name string `json:"name"`
			URL  string `json:"browser_download_url"`
		} `json:"assets"`
	}
	if err := json.NewDecoder(io.LimitReader(res.Body, 2<<20)).Decode(&rel); err != nil {
		return map[string]any{"error": err.Error()}, nil
	}
	url := ""
	prefix := "https://github.com/" + repo + "/releases/download/"
	for _, a := range rel.Assets {
		n := strings.ToLower(a.Name)
		if strings.HasSuffix(n, ".exe") && strings.Contains(n, "setup") && strings.HasPrefix(a.URL, prefix) {
			url = a.URL
			break
		}
	}
	latest := strings.TrimPrefix(rel.Tag, "v")
	return map[string]any{
		"available": url != "" && newerThan(latest, version),
		"version":   latest,
		"current":   version,
		"url":       url,
		"notes":     rel.Body,
	}, nil
}

func installUpdate(url, ver string) error {
	if !strings.HasPrefix(url, "https://github.com/") || !strings.Contains(url, "/releases/download/") {
		return errors.New("invalid update url")
	}
	client := &http.Client{Timeout: 5 * time.Minute, Transport: httpClient.Transport}
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "FiveM-Launcher/"+version)
	res, err := client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		return fmt.Errorf("HTTP %d", res.StatusCode)
	}
	data, err := io.ReadAll(io.LimitReader(res.Body, 200<<20))
	if err != nil {
		return err
	}
	if len(data) < 1<<20 || data[0] != 'M' || data[1] != 'Z' {
		return errors.New("downloaded file is not a valid installer")
	}
	safe := regexp.MustCompile(`[^0-9A-Za-z.]`).ReplaceAllString(ver, "")
	p := filepath.Join(os.TempDir(), "FiveM-Launcher-Setup-"+safe+".exe")
	if err := os.WriteFile(p, data, 0o755); err != nil {
		return err
	}
	cmd := exec.Command(p, "/silent")
	if err := cmd.Start(); err != nil {
		return err
	}
	time.AfterFunc(400*time.Millisecond, func() { wv.Dispatch(func() { closeWindow(hwnd) }) })
	return nil
}
