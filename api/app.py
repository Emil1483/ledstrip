from http.server import SimpleHTTPRequestHandler
import json
from os import getenv
import socketserver
import threading
from time import time

from src.modes.mode_service import ModeService
from src.lights_service.lights_service import lights_serivce

mode_service = ModeService()


class LightsHTTPHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "*")
        self.send_header("Access-Control-Allow-Headers", "*")
        SimpleHTTPRequestHandler.end_headers(self)

    def do_OPTIONS(self) -> None:
        self.send_response(200)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self) -> None:
        self.send_response(200)

        self.send_header("Content-type", "application/json")
        self.end_headers()

        json_response = mode_service.status()

        self.wfile.write(json.dumps(json_response).encode("utf-8"))

    def do_POST(self):
        content_length = int(self.headers["Content-Length"])
        post_data = self.rfile.read(content_length)
        post_body = json.loads(post_data.decode("utf-8"))

        if "mode" not in post_body:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'Missing "mode" field in JSON body')
            return

        mode = post_body["mode"]
        kwargs = post_body.get("kwargs", {})

        mode_service.set_mode(mode, **kwargs)
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(f"Set mode to {mode}".encode("utf-8"))


if __name__ == "__main__":
    PORT = int(getenv("PORT", "8080"))
    with socketserver.TCPServer(("", PORT), LightsHTTPHandler) as httpd:
        print("Server running at port", PORT)

        server_thread = threading.Thread(target=httpd.serve_forever)

        server_thread.daemon = True

        server_thread.start()

        try:
            t = time()
            while True:
                now = time()
                dt = now - t
                t = now
                mode_service.mode(dt)
        finally:
            print("\nServer stopped")
            lights_serivce.fill((0, 0, 0))
            lights_serivce.show()
            lights_serivce.teardown()
