import uuid
from datetime import datetime
from fastapi import APIRouter
from backend.app.models.schemas import ScoreSubmit, ScoreRecord, LeaderboardResponse, GameStats

router = APIRouter(prefix="/api", tags=["Scores & Stats"])

# In-memory storage with default benchmark records
SCORES_DB: list[ScoreRecord] = [
    ScoreRecord(
        id=str(uuid.uuid4()),
        levelId=1,
        playerName="SpeedRunner99",
        fruitsCollected=15,
        totalFruits=15,
        timeElapsed=18.42,
        deaths=0,
        timestamp=datetime.now().isoformat()
    ),
    ScoreRecord(
        id=str(uuid.uuid4()),
        levelId=2,
        playerName="PixelMaster",
        fruitsCollected=13,
        totalFruits=13,
        timeElapsed=22.15,
        deaths=1,
        timestamp=datetime.now().isoformat()
    )
]

STATS = {
    "totalPlays": 14,
    "totalCompletions": 8,
    "totalFruitsCollected": 120,
    "totalDeaths": 23
}

@router.post("/scores", response_model=ScoreRecord)
def submit_score(score_in: ScoreSubmit):
    record = ScoreRecord(
        id=str(uuid.uuid4()),
        levelId=score_in.levelId,
        playerName=score_in.playerName.strip() or "Anonymous",
        fruitsCollected=score_in.fruitsCollected,
        totalFruits=score_in.totalFruits,
        timeElapsed=round(score_in.timeElapsed, 2),
        deaths=score_in.deaths,
        timestamp=datetime.now().isoformat()
    )
    SCORES_DB.append(record)
    
    # Update stats
    STATS["totalPlays"] += 1
    if score_in.fruitsCollected >= score_in.totalFruits:
        STATS["totalCompletions"] += 1
    STATS["totalFruitsCollected"] += score_in.fruitsCollected
    STATS["totalDeaths"] += score_in.deaths
    
    return record

@router.get("/leaderboard/{level_id}", response_model=LeaderboardResponse)
def get_leaderboard(level_id: int):
    # Filter by level and sort by fruits (desc), deaths (asc), time (asc)
    level_scores = [s for s in SCORES_DB if s.levelId == level_id]
    sorted_scores = sorted(
        level_scores,
        key=lambda s: (-s.fruitsCollected, s.deaths, s.timeElapsed)
    )[:10]
    return LeaderboardResponse(levelId=level_id, scores=sorted_scores)

@router.get("/stats", response_model=GameStats)
def get_game_stats():
    return GameStats(**STATS)
