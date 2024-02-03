from src.lights_service.lights_service import LightsService
from src.modes.lights_mode import LightsMode
import colorsys


class Rainbow(LightsMode):
    def __init__(self, pixels: LightsService, frequency=0.001, speed=1.0) -> None:
        super().__init__(pixels)
        self.t = 0
        self.frequency = frequency
        self.speed = speed

    def __call__(self, dt: float) -> None:
        self.t += dt
        for i in range(len(self.pixels)):
            h = (self.frequency * i + self.speed * self.t) % 1
            r, g, b = colorsys.hsv_to_rgb(h, 1, 1)
            self.pixels[i] = (r * 255, g * 255, b * 255)
        self.pixels.show()
