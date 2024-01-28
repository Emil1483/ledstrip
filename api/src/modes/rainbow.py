from time import sleep
from src.lights_service.lights_service import LightsService
from src.modes.lights_mode import LightsMode


class Rainbow(LightsMode):
    def __init__(self, pixels: LightsService) -> None:
        super().__init__(pixels)

    def wheel(self, pos):
        if pos < 85:
            return (pos * 3, 255 - pos * 3, 0)
        elif pos < 170:
            pos -= 85
            return (255 - pos * 3, 0, pos * 3)
        else:
            pos -= 170
            return (0, pos * 3, 255 - pos * 3)

    def rainbow_cycle(self, wait):
        for j in range(255):
            for i in range(len(self.pixels)):
                pixel_index = (i * 256 // len(self.pixels)) + j
                self.pixels[i] = self.wheel(pixel_index & 255)
            self.pixels.show()
            sleep(wait)

    def __call__(self) -> None:
        self.rainbow_cycle(0)
