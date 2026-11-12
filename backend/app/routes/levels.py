import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from backend.app.config import DATA_DIR
from backend.app.models.schemas import LevelDetail, LevelSummary

router = APIRouter(prefix="/api/levels", tags=["Levels"])

def load_level_file(level_id: int) -> dict:
    file_path = DATA_DIR / f"level{level_id}.json"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Level {level_id} not found")
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("", response_model=list[LevelSummary])
def get_levels_list():
    summaries = []
    for level_id in [1, 2]:
        file_path = DATA_DIR / f"level{level_id}.json"
        if file_path.exists():
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                summaries.append(
                    LevelSummary(
                        id=data["id"],
                        name=data["name"],
                        totalFruits=len(data.get("fruits", [])),
                        bgTheme=data.get("bgTheme", "Gray"),
                        character=data.get("character", "Virtual Guy")
                    )
                )
    return summaries

@router.get("/{level_id}", response_model=LevelDetail)
def get_level_by_id(level_id: int):
    data = load_level_file(level_id)
    return LevelDetail(**data)

@router.get("/characters/available")
def get_available_characters():
    return [
        {
            "name": "Virtual Guy",
            "theme": "Blue Visor",
            "defaultLevel": 1,
            "preview": "/assets/Main Characters/Virtual Guy/Idle (32x32).png"
        },
        {
            "name": "Mask Dude",
            "theme": "Feather Mask",
            "defaultLevel": 2,
            "preview": "/assets/Main Characters/Mask Dude/Idle (32x32).png"
        },
        {
            "name": "Ninja Frog",
            "theme": "Shinobi",
            "defaultLevel": None,
            "preview": "/assets/Main Characters/Ninja Frog/Idle (32x32).png"
        },
        {
            "name": "Pink Man",
            "theme": "Retro Hero",
            "defaultLevel": None,
            "preview": "/assets/Main Characters/Pink Man/Idle (32x32).png"
        }
    ]
