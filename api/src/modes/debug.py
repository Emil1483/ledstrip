from src.modes.models import Color
from src.lights_service.lights_service import LightsService
from src.modes.lights_mode import LightsMode
from src.logging_helper import logger


class Debug(LightsMode):
    def __init__(
        self,
        pixels: LightsService,
        previous_mode: LightsMode | None,
        index: int = 0,
    ) -> None:
        super().__init__(pixels)
        self.index = index
        logger.info(f"Debug mode initialized with index: {index}")

    def __call__(self, dt: float) -> None:
        for i in range(len(self.pixels)):
            if i == self.index:
                self.pixels[i] = 255, 255, 255
            else:
                self.pixels[i] = 0, 0, 0
