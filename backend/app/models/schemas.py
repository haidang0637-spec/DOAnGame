from pydantic import BaseModel, Field
from typing import List, Optional

class Point(BaseModel):
    x: float
    y: float

class Box(BaseModel):
    x: float
    y: float
    w: float
    h: float

class FruitItem(BaseModel):
    type: str
    x: float
    y: float

class TrapSaw(BaseModel):
    type: str = "saw"
    startX: float
    startY: float
    endX: float
    endY: float
    speed: float = 40.0
    axis: str = "x"

class FallingPlatformItem(BaseModel):
    x: float
    y: float
    w: float = 32.0
    h: float = 10.0

class LevelDetail(BaseModel):
    id: int
    name: str
    backdrop: str
    bgTheme: str
    character: str
    playerSpawn: Point
    solids: List[Box] = []
    oneWayPlatforms: List[Box] = []
    traps: List[TrapSaw] = []
    fallingPlatforms: List[FallingPlatformItem] = []
    fruits: List[FruitItem] = []

class LevelSummary(BaseModel):
    id: int
    name: str
    totalFruits: int
    bgTheme: str
    character: str

class ScoreSubmit(BaseModel):
    levelId: int
    playerName: str = "Player"
    fruitsCollected: int
    totalFruits: int
    timeElapsed: float
    deaths: int

class ScoreRecord(ScoreSubmit):
    id: str
    timestamp: str

class LeaderboardResponse(BaseModel):
    levelId: int
    scores: List[ScoreRecord]

class GameStats(BaseModel):
    totalPlays: int
    totalCompletions: int
    totalFruitsCollected: int
    totalDeaths: int
