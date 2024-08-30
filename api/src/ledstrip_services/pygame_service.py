from random import randrange
import random
from time import sleep, time
import pygame

from api.src.ledstrip_services.ledstrip_service import LedstripService


class PygameQuit(Exception):
    pass


class PygameService(LedstripService):
    def __init__(self, num_pixels: int = 109) -> None:
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
        start = time()
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                raise PygameQuit()

        self.window.fill((0, 0, 0))
        for i, color in enumerate(self._pixels):
            x = int((i + 0.5) * (self.WINDOW_WIDTH / self.NUM_PIXELS))
            y = self.WINDOW_HEIGHT // 2
            pygame.draw.circle(self.window, color, (x, y), self.CIRCLE_RADIUS)
        pygame.display.flip()
        end = time()
        current = end - start
        total_time = random.uniform(0.00465, 0.004725)
        if current < total_time:
            sleep(total_time - current)

    def __len__(self) -> int:
        return self.NUM_PIXELS

    def fill(self, color: tuple[int, int, int]) -> None:
        self._pixels = [color for _ in range(self.NUM_PIXELS)]

    def teardown(self) -> None:
        pygame.quit()
