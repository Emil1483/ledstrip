import os


class DjupPath(os.PathLike):
    def __init__(self, path: str):
        self.__path = path

    @classmethod
    def to_path_parent(cls, file: str):
        return cls.to_path(file).parent()

    @classmethod
    def to_path(cls, file: str):
        return cls(os.path.abspath(file))

    def filename(self):
        return os.path.basename(self.__path)

    def parent(self):
        return DjupPath(os.path.dirname(self.__path))

    def child(self, child: str):
        return DjupPath(os.path.join(self.__path, child))

    def sibling(self, sibling: str):
        return self.parent().child(sibling)

    def __str__(self):
        return self.__path

    def path(self):
        return self.__path

    def relative_to(self, other: "DjupPath"):
        return DjupPath(os.path.relpath(self.__path, other.__path))

    def __truediv__(self, other):
        return self.child(other)

    def __fspath__(self):
        return self.__path
