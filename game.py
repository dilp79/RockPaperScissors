"""
Десктопная версия на Pygame: шестиугольное поле (offset, как в веб-версии).
Запуск: pip install -r requirements.txt && python game.py
"""

from __future__ import annotations

import math
import random
from typing import List, Optional, Tuple

import pygame

OBJECTS = ("камень", "ножницы", "бумага")


def beats(a: str, b: str) -> bool:
    return (
        (a == "ножницы" and b == "бумага")
        or (a == "бумага" and b == "камень")
        or (a == "камень" and b == "ножницы")
    )


def hex_vertices(cx: float, cy: float, r: float) -> List[Tuple[float, float]]:
    pts = []
    for i in range(6):
        ang = math.radians(60 * i - 90)
        pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    return pts


def point_in_polygon(x: float, y: float, poly: List[Tuple[float, float]]) -> bool:
    n = len(poly)
    c = False
    for i in range(n):
        j = (i + 1) % n
        xi, yi = poly[i]
        xj, yj = poly[j]
        denom = (yj - yi) if (yj - yi) != 0 else 1e-12
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / denom + xi):
            c = not c
    return c


def point_in_hex(px: float, py: float, cx: float, cy: float, r: float) -> bool:
    return point_in_polygon(px, py, hex_vertices(cx, cy, r))


def hex_disk_neighbors(col: int, row: int, n: int) -> List[Tuple[int, int]]:
    """6 соседей в той же offset-сетке, что и веб-версия (чётные ряды без сдвига)."""
    even = row % 2 == 0
    cand = [
        (col - 1 if even else col, row - 1),
        (col if even else col + 1, row - 1),
        (col - 1, row),
        (col + 1, row),
        (col - 1 if even else col, row + 1),
        (col if even else col + 1, row + 1),
    ]
    out: List[Tuple[int, int]] = []
    for c, r in cand:
        if 0 <= c < n and 0 <= r < n:
            out.append((c, r))
    return out


class Game:
    """Шестиугольная сетка: чётные строки без сдвига, нечётные — со сдвигом (как в CSS)."""

    def __init__(self, size: int = 10) -> None:
        self.size = size
        self.field: List[List[Optional[str]]] = [[None] * size for _ in range(size)]
        self.player_moves: List[Tuple[int, int]] = []
        self.rule_similar_ignore = True
        self.score = 0
        self.running = True

        self.hex_r = 18.0
        self.margin = 28
        self.hud_h = 52

        pygame.init()
        pygame.display.set_caption("Камень-Ножницы-Бумага — шестиугольное поле")
        self.font_small = pygame.font.SysFont(None, 19)
        self.font_score = pygame.font.SysFont(None, 26)

        w, h = self._compute_window_size()
        self.screen = pygame.display.set_mode((w, h + self.hud_h))

    def _cell_center(self, col: int, row: int) -> Tuple[float, float]:
        r = self.hex_r
        x = self.margin + r * math.sqrt(3) * (col + 0.5 * (row % 2))
        y = self.margin + r * 1.5 * row
        return x, y

    def _compute_window_size(self) -> Tuple[int, int]:
        max_x = 0.0
        max_y = 0.0
        r = self.hex_r
        for row in range(self.size):
            for col in range(self.size):
                cx, cy = self._cell_center(col, row)
                for vx, vy in hex_vertices(cx, cy, r):
                    max_x = max(max_x, vx)
                    max_y = max(max_y, vy)
        return int(max_x + self.margin + 4), int(max_y + self.margin + 4)

    def screen_to_cell(self, mx: int, my: int) -> Optional[Tuple[int, int]]:
        if my >= self.screen.get_height() - self.hud_h:
            return None
        for row in range(self.size):
            for col in range(self.size):
                cx, cy = self._cell_center(col, row)
                if point_in_hex(float(mx), float(my), cx, cy, self.hex_r * 0.98):
                    return col, row
        return None

    def empty_cells(self) -> List[Tuple[int, int]]:
        return [
            (x, y)
            for y in range(self.size)
            for x in range(self.size)
            if self.field[x][y] is None
        ]

    def computer_turn(self) -> None:
        free = self.empty_cells()
        if len(free) < 3:
            self.running = False
            return
        for _ in range(3):
            free = self.empty_cells()
            if not free:
                self.running = False
                return
            x, y = random.choice(free)
            self.field[x][y] = random.choice(OBJECTS)

    def player_turn(self, x: int, y: int, obj: str) -> None:
        if 0 <= x < self.size and 0 <= y < self.size and self.field[x][y] is None:
            self.field[x][y] = obj
            self.clear_nearby(x, y)

    def clear_nearby(self, x: int, y: int) -> None:
        all_beaten = True
        to_remove: List[Tuple[int, int]] = []
        current = self.field[x][y]
        if current is None:
            return

        for nx, ny in hex_disk_neighbors(x, y, self.size):
            neighbor = self.field[nx][ny]
            if neighbor is None:
                continue
            if beats(current, neighbor):
                to_remove.append((nx, ny))
            elif not (self.rule_similar_ignore and current == neighbor):
                all_beaten = False

        if all_beaten and to_remove:
            for nx, ny in to_remove:
                self.field[nx][ny] = None
                self.score += 1
                if (nx, ny) in self.player_moves:
                    self.player_moves.remove((nx, ny))
            self.field[x][y] = None
        else:
            self.player_moves.append((x, y))

    def draw_field(self) -> None:
        bg = (18, 22, 32)
        empty_fill = (42, 54, 78)
        empty_edge = (110, 130, 170)
        self.screen.fill(bg)

        grid_h = self.screen.get_height() - self.hud_h
        border_rect = pygame.Rect(8, 8, self.screen.get_width() - 16, grid_h - 16)
        pygame.draw.rect(self.screen, (14, 18, 28), border_rect, border_radius=10)
        pygame.draw.rect(self.screen, (80, 100, 140), border_rect, 1, border_radius=10)

        for row in range(self.size):
            for col in range(self.size):
                cx, cy = self._cell_center(col, row)
                pts = hex_vertices(cx, cy, self.hex_r)
                cell = self.field[col][row]

                pygame.draw.polygon(self.screen, empty_fill, pts)
                pygame.draw.polygon(self.screen, empty_edge, pts, 2)

                if cell is not None:
                    is_player = (col, row) in self.player_moves
                    inner = hex_vertices(cx, cy, self.hex_r * 0.82)
                    fill = (220, 90, 90) if is_player else (45, 48, 55)
                    pygame.draw.polygon(self.screen, fill, inner)
                    label = cell[0].upper()
                    text = self.font_small.render(label, True, (245, 245, 250))
                    tw, th = text.get_size()
                    self.screen.blit(text, (cx - tw // 2, cy - th // 2))

        score_surf = self.font_score.render(f"Счёт: {self.score}", True, (230, 235, 245))
        self.screen.blit(score_surf, (14, grid_h + 10))
        hint = self.font_small.render(
            "ЛКМ — камень · ПКМ — бумага · колёсико — ножницы · клик по шестиугольнику",
            True,
            (140, 155, 185),
        )
        self.screen.blit(hint, (14, grid_h + 34))
        pygame.display.flip()

    def run(self) -> None:
        clock = pygame.time.Clock()
        self.draw_field()
        while self.running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    cell = self.screen_to_cell(*event.pos)
                    if cell is None:
                        continue
                    cx, cy = cell
                    if event.button == 1:
                        obj = "камень"
                    elif event.button == 3:
                        obj = "бумага"
                    elif event.button == 2:
                        obj = "ножницы"
                    else:
                        continue
                    self.player_turn(cx, cy, obj)
                    self.computer_turn()
                    self.draw_field()
            clock.tick(60)
        pygame.quit()


def main() -> None:
    Game().run()


if __name__ == "__main__":
    main()
