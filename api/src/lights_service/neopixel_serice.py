import board
import neopixel

from src.lights_service.lights_service import LightsService


class NeopixelService(LightsService):
    def __init__(self, num_pixels: int = 1081) -> None:
        self._pixels = neopixel.NeoPixel(board.D18, num_pixels, auto_write=False)
        self._num_pixels = num_pixels

    def __setitem__(self, key: int, value: tuple[int, int, int]) -> None:
        self._pixels[key] = value

    def __getitem__(self, key: int) -> tuple[int, int, int]:
        return self._pixels[key]

    def show(self) -> None:
        self._pixels.show()

    def __len__(self) -> int:
        return self._num_pixels

    def teardown(self) -> None:
        pass
