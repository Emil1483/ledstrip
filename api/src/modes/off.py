from src.models import Color, LedstripState
from src.modes.lights_mode import LightsMode


class Off(LightsMode):
    def __init__(self, led_count: int) -> None:
        self.led_count = led_count

    def update_state(self, _: float) -> LedstripState:
        return LedstripState(colors=[Color.black()] * self.led_count)
