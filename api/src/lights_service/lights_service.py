from abc import ABC, abstractmethod
from os import getenv

from dotenv import load_dotenv

from src.logging_helper import logger


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
led_count = int(getenv("LED_COUNT", "1081"))

if target_service == "canvas":
    from src.lights_service.canvas_service import CanvasService

    lights_serivce = CanvasService(led_count)
elif target_service == "pygame":
    from src.lights_service.pygame_service import PygameService

    lights_serivce = PygameService(led_count)
elif target_service == "neopixel":
    from src.lights_service.neopixel_service import NeopixelService

    lights_serivce = NeopixelService(led_count)
else:
    raise ValueError(f'Invalid lights service: "{target_service}"')

logger.info(f"Using lights service: {target_service} with {len(lights_serivce)} pixels")
