import os
import sys
import time
import socket
import tempfile
import threading
import subprocess
import webbrowser
from http.server import SimpleHTTPRequestHandler, HTTPServer

def get_base_path():
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))

def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]

def run_server(port, base_path):
    class QuietHandler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=base_path, **kwargs)
        def log_message(self, format, *args):
            pass # Suppress server logging

    server = HTTPServer(('127.0.0.1', port), QuietHandler)
    server.serve_forever()

def find_browser():
    candidates = [
        os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%LocalAppData%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%LocalAppData%\Google\Chrome\Application\chrome.exe")
    ]
    for path in candidates:
        if os.path.isfile(path):
            return path
    return None

def main():
    base_path = get_base_path()
    port = find_free_port()

    # Start local HTTP server in background thread
    t = threading.Thread(target=run_server, args=(port, base_path), daemon=True)
    t.start()
    time.sleep(0.3)

    url = f"http://127.0.0.1:{port}/index.html"
    browser_exe = find_browser()

    if browser_exe:
        temp_dir = tempfile.mkdtemp(prefix="offline_chess_profile_")
        cmd = [
            browser_exe,
            f"--app={url}",
            "--window-size=1220,860",
            f"--user-data-dir={temp_dir}",
            "--disable-extensions",
            "--no-first-run",
            "--no-default-browser-check"
        ]
        try:
            proc = subprocess.Popen(cmd)
            proc.wait()
        finally:
            import shutil
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception:
                pass
    else:
        webbrowser.open(url)
        # Keep alive in fallback mode
        while True:
            time.sleep(1)

if __name__ == '__main__':
    main()
