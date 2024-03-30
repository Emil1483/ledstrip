from abc import ABC


class KwargType(ABC):
    @classmethod
    def identifier(self) -> str:
        raise NotImplementedError()

    @classmethod
    def decode(cls, value) -> "KwargType":
        raise NotImplementedError()


class Color(KwargType):
    def __init__(self, r: int, g: int, b: int) -> None:
        self.r = r
        self.g = g
        self.b = b

    @classmethod
    def identifier(self) -> str:
        return "color"

    @classmethod
    def decode(cls, value: dict) -> "Color":
        return Color(value["r"], value["g"], value["b"])


kwarg_types = [Color]
