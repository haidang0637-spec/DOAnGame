import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
ASSETS_DIR = BASE_DIR / "Pixel Adventure 1" / "Free"
DATA_DIR = Path(__file__).resolve().parent / "data"

# Server configuration
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", 2222))
TITLE = "Pixel Adventure Web"
VERSION = "1.0.0"
