from abc import ABC, abstractmethod

from src.lights_service.lights_service import LightsService

#! Each impmementation of LightsMode should have publicly available
#! attributes with same names as the custom kwargs of the __init__ method


class LightsMode(ABC):
    @abstractmethod
    def __init__(self, lights_service: LightsService) -> None:
        self.pixels = lights_service

    @abstractmethod
    def __call__(self, dt: float) -> None:
        raise NotImplementedError()
