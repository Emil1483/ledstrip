from src.models import Color, LedstripState
from src.ledstrip_services.ledstrip_service import LedstripService
from src.modes.lights_mode import LightsMode
import colorsys


class Rainbow(LightsMode):
    def __init__(self, led_count: int, frequency=1.0, speed=0.1) -> None:
        self.led_count = led_count
        self.t = 0
        self.frequency = frequency
        self.speed = speed

        self.f = frequency / led_count

    def update_state(self, dt: float) -> LedstripState:
        colors = [None] * self.led_count
        self.t += dt
        for i in range(len(colors)):
            h = (self.f * i + self.speed * self.t) % 1
            r, g, b = colorsys.hsv_to_rgb(h, 1, 1)
            colors[i] = Color(
                r=round(r * 255),
                g=round(g * 255),
                b=round(b * 255),
            )
        return LedstripState(colors=colors)
