from abc import ABC

from pydantic import BaseModel


class KwargType(ABC):
    @classmethod
    def label(self) -> str:
        raise NotImplementedError()

    @classmethod
    def decode(cls, value) -> "KwargType":
        raise NotImplementedError()

    def encode(self):
        raise NotImplementedError()


class Color(KwargType, BaseModel):
    r: int
    g: int
    b: int

    @classmethod
    def label(self) -> str:
        return "color"

    @classmethod
    def decode(cls, value: dict) -> "Color":
        return Color(r=value["r"], g=value["g"], b=value["b"])

    def encode(self):
        return {
            "r": self.r,
            "g": self.g,
            "b": self.b,
        }

    @classmethod
    def black(cls) -> "Color":
        return Color(r=0, g=0, b=0)

    @classmethod
    def white(cls) -> "Color":
        return Color(r=255, g=255, b=255)


class LedstripState(BaseModel):
    colors: list[Color]
