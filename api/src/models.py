from abc import ABC

from pydantic import BaseModel


class KwargType(ABC, BaseModel):
    @classmethod
    def label(self) -> str:
        raise NotImplementedError()

    @classmethod
    def decode(cls, value) -> "KwargType":
        return cls.model_validate(value)

    def encode(self):
        return self.model_dump()

    @classmethod
    def metadata(self):
        return {}


class Color(KwargType, BaseModel):
    r: int
    g: int
    b: int

    @classmethod
    def label(self) -> str:
        return "color"

    @classmethod
    def black(cls) -> "Color":
        return Color(r=0, g=0, b=0)

    @classmethod
    def white(cls) -> "Color":
        return Color(r=255, g=255, b=255)


def ranged_float(min_value: float, max_value: float):
    class RangedFloat(KwargType, BaseModel):
        value: float

        @classmethod
        def label(self) -> str:
            return "ranged_float"

        @classmethod
        def metadata(self):
            return {
                "min": min_value,
                "max": max_value,
            }

    return RangedFloat


class LedstripState(BaseModel):
    colors: list[Color]
