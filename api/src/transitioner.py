from api.src.models import Color, LedstripState
from api.src.ledstrip_services.ledstrip_service import LedstripService
from api.src.modes.ledstrip_mode import LedstripMode


class Transitioner:
    def __init__(self) -> None:
        self.stack: list[tuple] = []
        self.startup_time = 0.6

    def add_to_stack(self, mode: LedstripMode) -> None:
        self.stack.append((mode, 0.0))

    def update_lights(self, ledstrip_service: LedstripService, dt: float) -> None:
        led_count = len(ledstrip_service)

        for i, (mode, time) in enumerate(self.stack):
            if time < self.startup_time:
                self.stack[i] = (mode, min(time + dt, self.startup_time))

        while len(self.stack) > 1 and self.stack[1][1] == self.startup_time:
            self.stack.pop(0)

        def curve(t):
            return -t * (t - 2)

        colors = [Color.black()] * len(ledstrip_service)
        for mode, t in self.stack:
            last_led = round(led_count * curve(t / self.startup_time))
            state = mode.update_state(dt)
            for i, color in enumerate(state.colors):
                if i > last_led:
                    break
                colors[i] = color

        ledstrip_service.set_state(LedstripState(colors=colors))
        ledstrip_service.show()
