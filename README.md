# FiveM Launcher (source)

โค้ดของ FiveM Launcher เวอร์ชัน Go + WebView2

- cmd/launcher  — ตัวโปรแกรม (หน้าจออยู่ใน cmd/launcher/web)
- cmd/setup     — ตัวติดตั้ง (หน้าจออยู่ใน cmd/setup/ui.html)
- third_party/go-webview2 — ไลบรารี WebView2 (MIT) ที่แก้ให้รองรับหน้าต่างแบบไม่มีกรอบ
- build.sh      — สร้างไฟล์ทั้งหมดไว้ใน out/

## ออกเวอร์ชันผ่าน GitHub (แนะนำ)
ดูขั้นตอนใน คู่มือ-GitHub.md — GitHub จะสร้างไฟล์ Setup ให้อัตโนมัติ ไม่ต้องลงโปรแกรมอะไรในเครื่อง

## สร้างไฟล์เองบนเครื่อง
ติดตั้ง Go 1.24+ และ go-winres (go install github.com/tc-hib/go-winres@v0.3.3) แล้วรันใน Git Bash:  ./build.sh

## ตั้งค่า
cmd/launcher/web/config.js — ชื่อผู้สร้าง, ลิงก์ Discord, GitHub repo สำหรับอัปเดตอัตโนมัติ
เวอร์ชันอ่านจากไฟล์ VERSION (หรือตัวแปร VERSION ตอน build)
docs/ — หน้าเว็บสำหรับดาวน์โหลด (GitHub Pages)
