import inspect
from src.modes.lights_mode import LightsMode
from src.lights_service.lights_service import lights_serivce
from src.modes.off import Off
from src.modes.rainbow import Rainbow


class ModeService:
    def __init__(self) -> None:
        self.modes: dict[str, type[LightsMode]] = {
            "rainbow": Rainbow,
            "off": Off,
        }

        self.mode = Rainbow(lights_serivce, frequency=0.001, speed=0.1)

    def set_mode(self, mode: str, **kwargs) -> None:
        if mode not in self.modes:
            raise ValueError("Mode not found")

        self.mode = self.modes[mode](lights_serivce, **kwargs)

    def status(self) -> list[str]:
        def gen():
            for mode in self.modes:
                init_signature = inspect.signature(self.modes[mode].__init__)
                params = init_signature.parameters
                kwargs_info = {}

                for param_name, param in params.items():
                    if param.default is not inspect.Parameter.empty:
                        kwargs_info[param_name] = type(param.default).__name__

                yield mode, {
                    "kwargs": kwargs_info,
                    "on": isinstance(self.mode, self.modes[mode]),
                }

        return {mode: data for mode, data in gen()}
