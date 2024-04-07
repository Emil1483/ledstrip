import inspect

from src.modes.models import KwargType
from src.modes.lights_mode import LightsMode
from src.lights_service.lights_service import lights_serivce

from src.modes.off import Off
from src.modes.rainbow import Rainbow
from src.modes.static import Static

from src.logging_helper import logger


class UnexpectedKwarg(Exception):
    def __init__(self, unexpected_kwarg: str) -> None:
        self.unexpected_kwarg = unexpected_kwarg


class ModeService:
    def __init__(self) -> None:
        self.modes: dict[str, type[LightsMode]] = {
            "rainbow": Rainbow,
            "static": Static,
            "off": Off,
        }

        self.mode = Static(lights_serivce)

    def set_mode(self, mode: str, decode_kwargs=True, **kwargs) -> None:
        if mode not in self.modes:
            raise ValueError("Mode not found")

        def gen_kwargs():
            mode_signature = inspect.signature(self.modes[mode].__init__)
            mode_params = mode_signature.parameters

            for key, value in kwargs.items():
                if key not in mode_params:
                    raise UnexpectedKwarg(key)

                if not decode_kwargs:
                    yield key, value
                    continue

                corresponding_type = mode_params[key]
                if issubclass(corresponding_type.annotation, KwargType):
                    yield key, corresponding_type.annotation.decode(value)
                elif isinstance(corresponding_type.default, KwargType):
                    yield key, corresponding_type.default.decode(value)
                else:
                    yield key, value

        genned_kwargs = {k: v for k, v in gen_kwargs()}

        logger.info(f"Setting mode to {mode} with kwargs: {genned_kwargs}")

        self.mode = self.modes[mode](lights_serivce, **genned_kwargs)

    def status(self):
        def gen_status():
            for mode in self.modes:
                init_signature = inspect.signature(self.modes[mode].__init__)
                params = init_signature.parameters

                kwargs_info = {}
                for param_name, param in params.items():
                    if param.default is not inspect.Parameter.empty:
                        if isinstance(param.default, KwargType):
                            kwargs_info[param_name] = param.default.label()
                        else:
                            kwargs_info[param_name] = type(param.default).__name__

                on = isinstance(self.mode, self.modes[mode])

                state = {}
                if on:
                    for key in kwargs_info.keys():
                        assert hasattr(self.mode, key)

                        value = getattr(self.mode, key)
                        if isinstance(value, KwargType):
                            state[key] = value.encode()
                        else:
                            state[key] = value

                yield mode, {
                    "kwargs": kwargs_info,
                    "on": on,
                    "state": state,
                }

        return {k: v for k, v in gen_status()}
