from api.src.models import Color, LedstripState, ranged_float
from api.src.modes.ledstrip_mode import LedstripMode
import colorsys


class Rainbow(LedstripMode):
    def __init__(
        self,
        led_count: int,
        frequency=ranged_float(0.5, 3.0)(value=1.0),
        speed=ranged_float(0.0, 2.0)(value=0.1),
    ) -> None:
        self.led_count = led_count
        self.t = 0
        self.frequency = frequency
        self.speed = speed

        self.f = frequency.value
        self.s = speed.value

        self.time_to_target = 0.05
        self.target_t = self.time_to_target

    def update_state(self, dt: float) -> LedstripState:
        if self.target_t < self.time_to_target:
            self.target_t += dt
            self.target_t = min(self.target_t, self.time_to_target)
            self.f = (
                self.f
                + (self.frequency.value - self.f) * self.target_t / self.time_to_target
            )
            self.s = (
                self.s
                + (self.speed.value - self.s) * self.target_t / self.time_to_target
            )

        self.t += dt * self.s

        f = self.f / self.led_count
        colors = [None] * self.led_count
        for i in range(len(colors)):
            h = (f * i + self.t) % 1
            r, g, b = colorsys.hsv_to_rgb(h, 1, 1)
            colors[i] = Color(
                r=round(r * 255),
                g=round(g * 255),
                b=round(b * 255),
            )
        return LedstripState(colors=colors)

    def update_kwargs(self, frequency: float = None, speed: float = None):
        if frequency is not None:
            self.frequency = frequency
        if speed is not None:
            self.speed = speed
        self.target_t = 0
