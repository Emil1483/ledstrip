from abc import ABC, abstractmethod

from api.src.models import LedstripState

#! Each impmementation of LightsMode should have publicly available
#! attributes with same names as the custom kwargs of the __init__ method
#! Their __init__ function should take the form of:
#! def __init__(self, led_count, **kwargs) -> None:

#! Optionally, it may implement an update_kwargs with
#! Same kwargs as __init__ to allow for dynamic updates


class LedstripMode(ABC):
    @abstractmethod
    def update_state(self, dt: float) -> LedstripState:
        raise NotImplementedError()
