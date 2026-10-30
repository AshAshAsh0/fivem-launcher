# เปิดหน้า Launcher บนเบราว์เซอร์เพื่อทดสอบหน้าตา: python3 cmd/launcher/dev/serve.py แล้วเปิด http://localhost:8770/index.html
# ใส่ demo-bridge.js (ข้อมูลตัวอย่าง) ให้เอง — ไฟล์นี้ไม่ได้รวมอยู่ในตัวโปรแกรมจริง
import http.server, os, sys
WEB = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'web')
DEV = os.path.dirname(os.path.abspath(__file__))

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=WEB, **k)
    def log_message(self, *a): pass
    def do_GET(self):
        path = self.path.split('?')[0]
        if path == '/demo-bridge.js':
            return self._send(open(os.path.join(DEV, 'demo-bridge.js'), 'rb').read(), 'text/javascript')
        if path in ('/', '/index.html'):
            html = open(os.path.join(WEB, 'index.html'), encoding='utf-8').read()
            html = html.replace('<script src="app.js"></script>', '<script src="demo-bridge.js"></script>\n  <script src="app.js"></script>')
            return self._send(html.encode(), 'text/html; charset=utf-8')
        return super().do_GET()
    def _send(self, b, t):
        self.send_response(200); self.send_header('Content-Type', t); self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b)

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8770
http.server.ThreadingHTTPServer(('127.0.0.1', port), H).serve_forever()
