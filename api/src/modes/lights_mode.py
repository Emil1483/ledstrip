from abc import ABC, abstractmethod

from src.models import LedstripState

#! Each impmementation of LightsMode should have publicly available
#! attributes with same names as the custom kwargs of the __init__ method
#! Their __init__ function should take the form of:
#! def __init__(self, led_count, **kwargs) -> None:


class LightsMode(ABC):
    @abstractmethod
    def update_state(self, dt: float) -> LedstripState:
        raise NotImplementedError()
