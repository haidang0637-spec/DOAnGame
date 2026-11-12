from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import FRONTEND_DIR, ASSETS_DIR, TITLE, VERSION
from backend.app.routes import levels, scores

app = FastAPI(title=TITLE, version=VERSION)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(levels.router)
app.include_router(scores.router)

# Mount Assets Directory (Pixel Adventure 1)
if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")

# Mount Frontend Static Directory
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "game": TITLE,
        "version": VERSION
    }

@app.get("/")
def serve_index():
    index_file = FRONTEND_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "Pixel Adventure Web Server Running"}
