from api.src.models import Color, LedstripState
from api.src.modes.ledstrip_mode import LedstripMode


class Off(LedstripMode):
    def __init__(self, led_count: int) -> None:
        self.led_count = led_count

    def update_state(self, _: float) -> LedstripState:
        return LedstripState(colors=[Color.black()] * self.led_count)
