from src.models import Color, LedstripState
from src.ledstrip_services.ledstrip_service import LedstripService
from src.modes.lights_mode import LightsMode
from src.logging_helper import logger


class Debug(LightsMode):
    def __init__(
        self,
        led_count: int,
        index: int,
    ) -> None:
        self.led_count = led_count
        self.index = index
        logger.info(f"Debug mode initialized with index: {index}")

    def update_state(self, _: float) -> LedstripState:
        return LedstripState(
            colors=[
                Color.black() if i != self.index else Color.white()
                for i in range(self.led_count)
            ]
        )
