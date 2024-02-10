from abc import ABC, abstractmethod
from os import getenv

from dotenv import load_dotenv


class LightsService(ABC):
    @abstractmethod
    def show(self) -> None:
        raise NotImplementedError()

    @abstractmethod
    def fill(self, value: tuple[int, int, int]) -> None:
        raise NotImplementedError()

    @abstractmethod
    def __setitem__(self, key: int, value: tuple[int, int, int]) -> None:
        raise NotImplementedError()

    @abstractmethod
    def __getitem__(self, key: int) -> tuple[int, int, int]:
        raise NotImplementedError()

    @abstractmethod
    def teardown(self) -> None:
        raise NotImplementedError()

    @abstractmethod
    def __len__(self) -> int:
        raise NotImplementedError()


load_dotenv()

target_service = getenv("LIGHTS_SERVICE", "neopixel")

if target_service == "canvas":
    from src.lights_service.canvas_service import CanvasService

    lights_serivce = CanvasService()
elif target_service == "pygame":
    from src.lights_service.pygame_service import PygameService

    lights_serivce = PygameService()
elif target_service == "neopixel":
    from src.lights_service.neopixel_service import NeopixelService

    lights_serivce = NeopixelService()
else:
    raise ValueError(f'Invalid lights service: "{target_service}"')
