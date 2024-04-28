from src.models import Color, LedstripState
from src.ledstrip_services.ledstrip_service import LedstripService
from src.modes.ledstrip_mode import LedstripMode
import colorsys


class Rainbow(LedstripMode):
    def __init__(self, led_count: int, frequency=1.0, speed=0.1) -> None:
        self.led_count = led_count
        self.t = 0
        self.frequency = frequency
        self.speed = speed

        self.target_frequency = frequency
        self.target_speed = speed
        self.time_to_target = 0.5
        self.target_t = self.time_to_target

    def update_state(self, dt: float) -> LedstripState:
        if self.target_t < self.time_to_target:
            self.target_t += dt
            self.frequency = (
                self.frequency
                + (self.target_frequency - self.frequency)
                * self.target_t
                / self.time_to_target
            )
            self.speed = (
                self.speed
                + (self.target_speed - self.speed) * self.target_t / self.time_to_target
            )

        self.t += dt * self.speed

        f = self.frequency / self.led_count
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

    def update_kwargs(self, frequency: float, speed: float):
        if frequency is not None:
            self.target_frequency = frequency
        if speed is not None:
            self.target_speed = speed
        self.target_t = 0
