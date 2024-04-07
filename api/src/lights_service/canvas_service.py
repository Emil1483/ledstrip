import threading
from flask import Flask, render_template
import logging

from src.lights_service.lights_service import LightsService

log = logging.getLogger("werkzeug")
log.setLevel(logging.ERROR)


class CanvasService(LightsService):
    def __init__(self, num_pixels: int = 109) -> None:
        self._pixels = [(0, 0, 0)] * num_pixels
        self._num_pixels = num_pixels

        self.app = Flask(__name__)

        @self.app.route("/")
        def index():
            return render_template(f"index.html")

        @self.app.route("/pixels")
        def pixels():
            return [{"r": r, "g": g, "b": b} for r, g, b in self._pixels]

        self.thread = threading.Thread(
            target=lambda: self.app.run(host="0.0.0.0", port=3001)
        )

        self.thread.daemon = True
        self.thread.start()
        print("CanvasService running at port 3001")

    def __setitem__(self, key: int, value: tuple[int, int, int]) -> None:
        self._pixels[key] = value

    def __getitem__(self, key: int) -> tuple[int, int, int]:
        return self._pixels[key]

    def show(self) -> None:
        pass

    def fill(self, value: tuple[int, int, int]) -> None:
        self._pixels = [value] * self._num_pixels

    def __len__(self) -> int:
        return self._num_pixels

    def teardown(self) -> None:
        pass
