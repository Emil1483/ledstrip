from src.models import Color, LedstripState
from src.ledstrip_services.ledstrip_service import LedstripService
from src.modes.lights_mode import LightsMode


class Transitioner:
    def __init__(
        self,
        prev_mode: LightsMode,
        new_mode: LightsMode,
    ) -> None:
        self.prev_mode = prev_mode
        self.new_mode = new_mode

        self.current_time = 0.0
        self.startup_time = 0.6

    def update_lights(self, ledstrip_service: LedstripService, dt: float) -> None:
        if self.prev_mode:
            prev_state = self.prev_mode.update_state(dt)
        else:
            prev_state = LedstripState(colors=[Color.black()] * len(ledstrip_service))

        new_state = self.new_mode.update_state(dt)

        assert len(prev_state.colors) == len(new_state.colors) == len(ledstrip_service)
        led_count = len(ledstrip_service)

        def curve(t):
            return -t * (t - 2)

        if self.current_time < self.startup_time:
            self.current_time += dt

        colors = []
        last_led = round(led_count * curve(self.current_time / self.startup_time))

        for i in range(led_count):
            if i < last_led:
                colors.append(new_state.colors[i])
            else:
                colors.append(prev_state.colors[i])

        ledstrip_service.set_state(LedstripState(colors=colors))
        ledstrip_service.show()
