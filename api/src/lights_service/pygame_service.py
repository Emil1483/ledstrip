from random import randrange
import pygame

from src.lights_service.lights_service import LightsService


class PygameQuit(Exception):
    pass


class PygameService(LightsService):
    def __init__(self, num_pixels: int = 1081) -> None:
        self.WINDOW_WIDTH = 1500
        self.WINDOW_HEIGHT = 200
        self.NUM_PIXELS = num_pixels
        self.CIRCLE_RADIUS = 5

        pygame.init()

        self.window = pygame.display.set_mode((self.WINDOW_WIDTH, self.WINDOW_HEIGHT))
        pygame.display.set_caption("Mock Lights Service")

        self._pixels = [
            (randrange(0, 255), randrange(0, 255), randrange(0, 255))
            for _ in range(self.NUM_PIXELS)
        ]

    def __setitem__(self, key: int, value: tuple[int, int, int]) -> None:
        self._pixels[key] = value

    def __getitem__(self, key: int) -> tuple[int, int, int]:
        return self._pixels[key]

    def show(self) -> None:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                raise PygameQuit()

        self.window.fill((0, 0, 0))
        for i, color in enumerate(self._pixels):
            x = int((i + 0.5) * (self.WINDOW_WIDTH / self.NUM_PIXELS))
            y = self.WINDOW_HEIGHT // 2
            pygame.draw.circle(self.window, color, (x, y), self.CIRCLE_RADIUS)
        pygame.display.flip()

    def __len__(self) -> int:
        return self.NUM_PIXELS

    def fill(self, color: tuple[int, int, int]) -> None:
        self._pixels = [color for _ in range(self.NUM_PIXELS)]

    def teardown(self) -> None:
        pygame.quit()
