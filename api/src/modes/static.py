from src.lights_service.lights_service import LightsService
from src.modes.lights_mode import LightsMode


class Static(LightsMode):
    def __init__(self, pixels: LightsService, color_hex: str = "#5677d1") -> None:
        super().__init__(pixels)
        self.color_hex = color_hex
        h = self.color_hex.lstrip("#")
        self.r, self.g, self.b = tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))

    def __call__(self, dt: float) -> None:
        for i in range(len(self.pixels)):
            self.pixels[i] = self.r, self.g, self.b
        self.pixels.show()
