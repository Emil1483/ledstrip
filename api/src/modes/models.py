from abc import ABC


class KwargType(ABC):
    @classmethod
    def label(self) -> str:
        raise NotImplementedError()

    @classmethod
    def decode(cls, value) -> "KwargType":
        raise NotImplementedError()

    def encode(self):
        raise NotImplementedError()


class Color(KwargType):
    def __init__(self, r: int, g: int, b: int) -> None:
        self.r = r
        self.g = g
        self.b = b

    @classmethod
    def label(self) -> str:
        return "color"

    @classmethod
    def decode(cls, value: dict) -> "Color":
        return Color(value["r"], value["g"], value["b"])

    def encode(self):
        return {
            "r": self.r,
            "g": self.g,
            "b": self.b,
        }

    def __str__(self) -> str:
        return f"Color(r={self.r}, g={self.g}, b={self.b})"

    def __repr__(self) -> str:
        return str(self)
