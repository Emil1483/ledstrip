from abc import ABC, abstractmethod
from os import getenv

from dotenv import load_dotenv

from api.src.models import LedstripState
from api.src.logging_helper import logger


class LedstripService(ABC):
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

    def set_state(self, state: LedstripState) -> None:
        for i, color in enumerate(state.colors):
            self[i] = color.r, color.g, color.b


load_dotenv()

target_service = getenv("LEDSTRIP_SERVICE", "neopixel")
led_count = int(getenv("LED_COUNT", "109"))

if target_service == "canvas":
    from api.src.ledstrip_services.canvas_service import CanvasService

    ledstrip_service = CanvasService(led_count)
elif target_service == "pygame":
    from api.src.ledstrip_services.pygame_service import PygameService

    ledstrip_service = PygameService(led_count)
elif target_service == "neopixel":
    from api.src.ledstrip_services.neopixel_service import NeopixelService

    ledstrip_service = NeopixelService(led_count)
else:
    raise ValueError(f'Invalid lights service: "{target_service}"')

logger.info(
    f"Using lights service: {target_service} with {len(ledstrip_service)} pixels"
)
