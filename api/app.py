from http.server import SimpleHTTPRequestHandler
import json
from os import getenv
import socketserver
import threading
from dotenv import load_dotenv

from src.modes.off import Off
from src.modes.rainbow import Rainbow

load_dotenv()

if getenv("DEV", "").lower() == "true":
    from src.lights_service.mock_service import MockService

    lights_serivce = MockService()
else:
    from src.lights_service.neopixel_service import NeopixelService

    lights_serivce = NeopixelService()

modes = {
    "rainbow": Rainbow(lights_serivce),
    "off": Off(lights_serivce),
}

activated_mode = "off"


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

        json_response = json.dumps({k: k == activated_mode for k in modes.keys()})

        self.wfile.write(json_response.encode("utf-8"))

    def do_POST(self):
        content_length = int(self.headers["Content-Length"])
        post_data = self.rfile.read(content_length)
        post_body = json.loads(post_data.decode("utf-8"))

        if "set_mode" not in post_body:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'Missing "set_mode" field in JSON body')
            return

        mode = post_body["set_mode"]

        if mode not in modes:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Mode not found")
            return

        global activated_mode
        activated_mode = mode

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
            while True:
                modes[activated_mode]()
        finally:
            print("\nServer stopped")
            print(0)
            lights_serivce.fill((0, 0, 0))
            print(1)
            lights_serivce.show()
            print(2)
            lights_serivce.teardown()
            print(3)
            httpd.shutdown()
