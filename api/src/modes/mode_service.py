import inspect

from api.src.transitioner import Transitioner
from api.src.modes.debug import Debug
from api.src.models import KwargType
from api.src.modes.ledstrip_mode import LedstripMode
from api.src.ledstrip_services.ledstrip_service import ledstrip_service

from api.src.modes.off import Off
from api.src.modes.rainbow import Rainbow
from api.src.modes.static import Static

from api.src.logging_helper import logger


class UnexpectedKwarg(Exception):
    def __init__(self, unexpected_kwarg: str) -> None:
        self.unexpected_kwarg = unexpected_kwarg


class ModeService:
    def __init__(self) -> None:
        self.modes: dict[str, type[LedstripMode]] = {
            "debug": Debug,
            "rainbow": Rainbow,
            "static": Static,
            "off": Off,
        }

        self.mode = Static(len(ledstrip_service))
        self.transitioner = Transitioner()
        self.transitioner.add_to_stack(self.mode)

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

        if self.modes[mode] == type(self.mode) and hasattr(self.mode, "update_kwargs"):
            self.mode.update_kwargs(**genned_kwargs)
            return

        self.mode = self.modes[mode](len(ledstrip_service), **genned_kwargs)

        self.transitioner.add_to_stack(self.mode)

    def status(self):
        def gen_status():
            for mode in self.modes:
                init_signature = inspect.signature(self.modes[mode].__init__)
                params = init_signature.parameters

                assert (
                    "led_count" in params
                ), "All modes must have a 'led_count' parameter"

                assert (
                    "self" in params
                ), "All modes must have a 'self' parameter (the instance itself)"

                kwargs_info = {}
                for param_name, param in params.items():
                    if param_name in ("self", "led_count"):
                        continue

                    if param.default == inspect.Parameter.empty:
                        if issubclass(param.annotation, KwargType):
                            kwarg_type = param.annotation.label()
                            metadata = param.annotation.metadata()
                        else:
                            kwarg_type = param.annotation.__name__
                            metadata = {}

                        kwargs_info[param_name] = {
                            "type": kwarg_type,
                            "metadata": metadata,
                        }
                        continue

                    if isinstance(param.default, KwargType):
                        kwarg_type = param.default.label()
                        default = param.default.encode()
                        metadata = param.default.metadata()
                    else:
                        kwarg_type = type(param.default).__name__
                        default = param.default
                        metadata = {}

                    kwargs_info[param_name] = {
                        "type": kwarg_type,
                        "default": default,
                        "metadata": metadata,
                    }

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
