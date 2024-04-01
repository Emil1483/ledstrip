from src.modes.models import Color
from src.lights_service.lights_service import LightsService
from src.modes.lights_mode import LightsMode


class Static(LightsMode):
    def __init__(
        self, pixels: LightsService, color: Color = Color(86, 119, 209)
    ) -> None:
        super().__init__(pixels)
        self.color = color

    def __call__(self, dt: float) -> None:
        for i in range(len(self.pixels)):
            self.pixels[i] = self.color.r, self.color.g, self.color.b
        self.pixels.show()
