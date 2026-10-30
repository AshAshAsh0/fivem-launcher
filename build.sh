#!/bin/bash
# สร้าง FiveM Launcher.exe และ FiveM-Launcher-Setup.exe ไว้ในโฟลเดอร์ out/
#
# ตั้งค่าผ่านตัวแปรสภาพแวดล้อม (ไม่ใส่ = ใช้ค่าใน config.js):
#   VERSION      เวอร์ชัน เช่น 2.2.0       (ค่าเริ่มต้น: อ่านจากไฟล์ VERSION)
#   UPDATE_REPO  GitHub repo สำหรับอัปเดต เช่น yourname/fivem-launcher
#   MADE_BY      ชื่อผู้สร้างที่แสดงท้ายจอ
#   DISCORD_URL  ลิงก์ปุ่ม Discord
set -euo pipefail
cd "$(dirname "$0")"

VERSION="${VERSION:-$(tr -d ' \r\n' < VERSION)}"
VERSION="${VERSION#v}"
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then echo "VERSION ต้องเป็นรูปแบบ 1.2.3 (ได้: $VERSION)"; exit 1; fi
echo "==> Building FiveM Launcher $VERSION"

WINRES="${WINRES:-go-winres}"
command -v "$WINRES" >/dev/null || { echo "ไม่พบ go-winres: go install github.com/tc-hib/go-winres@latest"; exit 1; }

# ค่าตั้งของแบรนด์ (ฝังลงในโปรแกรม)
python3 - "$VERSION" <<'PY'
import json, os, sys
o = {}
for env, key in (("UPDATE_REPO", "updateRepo"), ("MADE_BY", "madeBy"), ("DISCORD_URL", "discordUrl")):
    v = os.environ.get(env, "").strip()
    if v:
        o[key] = v
with open("cmd/launcher/web/build-config.js", "w", encoding="utf-8") as f:
    f.write("// สร้างอัตโนมัติโดย build.sh — อย่าแก้ไฟล์นี้\n")
    f.write("Object.assign(window.LAUNCHER_CONFIG, " + json.dumps(o, ensure_ascii=False) + ");\n")
print("    config:", o or "(ใช้ค่าใน config.js)")
PY

for d in cmd/launcher cmd/setup; do
  (cd "$d" && "$WINRES" make --in winres/winres.json --arch amd64 --out rsrc --file-version "$VERSION.0" --product-version "$VERSION.0")
done

export GOOS=windows GOARCH=amd64 CGO_ENABLED=0 GOFLAGS=-mod=mod
LDF="-s -w -H windowsgui -X main.version=$VERSION"
mkdir -p out cmd/setup/payload
go build -trimpath -ldflags "$LDF" -o "out/FiveM Launcher.exe" ./cmd/launcher
gzip -9 -n -c "out/FiveM Launcher.exe" > cmd/setup/payload/FiveMLauncher.exe.gz
go build -trimpath -ldflags "$LDF" -o "out/FiveM-Launcher-Setup.exe" ./cmd/setup
ls -la out
