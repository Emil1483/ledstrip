from api.src.models import Color, LedstripState
from api.src.ledstrip_services.ledstrip_service import LedstripService
from api.src.modes.ledstrip_mode import LedstripMode
from api.src.logging_helper import logger


class Debug(LedstripMode):
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
