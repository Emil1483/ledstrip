from abc import ABC, abstractmethod


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

    def __len__(self) -> int:
        raise NotImplementedError()
