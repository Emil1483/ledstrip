from src.modes.models import Color
from src.lights_service.lights_service import LightsService
from src.modes.lights_mode import LightsMode
from src.logging_helper import logger


class Static(LightsMode):
    def __init__(
        self,
        pixels: LightsService,
        color: Color = Color(42, 31, 255),
        startup_time: float = 0.6,
    ) -> None:
        super().__init__(pixels)
        self.color = color

        self.startup_time = startup_time
        self.current_time = 0.0

        logger.info(
            f"Static mode initialized with color: {color} and startup_time: {startup_time}"
        )

    def __call__(self, dt: float) -> None:
        def curve(t):
            return -t * (t - 2)

        if self.current_time < self.startup_time:
            self.current_time += dt
            logger.info(f"current_time: {self.current_time}")

            last_pixel = int(
                len(self.pixels) * curve(self.current_time / self.startup_time)
            )
            for i in range(len(self.pixels)):
                if i < last_pixel:
                    self.pixels[i] = self.color.r, self.color.g, self.color.b
                else:
                    self.pixels[i] = 0, 0, 0
            self.pixels.show()

        else:
            for i in range(len(self.pixels)):
                self.pixels[i] = self.color.r, self.color.g, self.color.b
            self.pixels.show()
