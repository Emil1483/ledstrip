from abc import ABC, abstractmethod

from src.lights_service.lights_service import LightsService


class LightsMode(ABC):
    @abstractmethod
    def __init__(self, lights_service: LightsService) -> None:
        self.pixels = lights_service

    @abstractmethod
    def __call__(self, dt: float) -> None:
        raise NotImplementedError()
