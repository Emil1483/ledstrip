import board  # type: ignore
import neopixel  # type: ignore

from api.src.ledstrip_services.ledstrip_service import LedstripService


class NeopixelService(LedstripService):
    def __init__(self, num_pixels: int = 109) -> None:
        self._pixels = neopixel.NeoPixel(board.D18, num_pixels, auto_write=False)
        self._num_pixels = num_pixels

    def __setitem__(self, key: int, value: tuple[int, int, int]) -> None:
        self._pixels[key] = value

    def __getitem__(self, key: int) -> tuple[int, int, int]:
        return self._pixels[key]

    def show(self) -> None:
        self._pixels.show()

    def fill(self, value: tuple[int, int, int]) -> None:
        self._pixels.fill(value)

    def __len__(self) -> int:
        return self._num_pixels

    def teardown(self) -> None:
        pass
