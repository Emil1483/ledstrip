from time import sleep
from src.lights_service.lights_service import LightsService
from src.modes.lights_mode import LightsMode


class Off(LightsMode):
    def __init__(self, pixels: LightsService) -> None:
        super().__init__(pixels)

    def __call__(self) -> None:
        self.pixels.fill((0, 0, 0))
        self.pixels.show()
