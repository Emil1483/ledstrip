from src.models import Color, LedstripState
from src.ledstrip_services.ledstrip_service import LedstripService
from src.modes.lights_mode import LightsMode
from src.logging_helper import logger


class Static(LightsMode):
    def __init__(
        self,
        led_count,
        color: Color = Color(r=42, g=31, b=255),
    ) -> None:
        self.led_count = led_count
        self.color = color

        self.current_time = 0.0

        logger.info(f"Static mode initialized with color: {color}")

    def update_state(self, dt: float) -> LedstripState:
        colors = [self.color.model_copy()] * self.led_count
        return LedstripState(colors=colors)
