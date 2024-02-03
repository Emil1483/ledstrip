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

if getenv("DEV", "").lower() == "true":
    from src.lights_service.mock_service import MockService

    lights_serivce = MockService()
else:
    from src.lights_service.neopixel_service import NeopixelService

    lights_serivce = NeopixelService()
