import sys
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import uvicorn
from backend.app.config import HOST, PORT

if __name__ == "__main__":
    print(f"[PIXEL ADVENTURE] Starting Server on http://{HOST}:{PORT}")
    uvicorn.run("backend.app.main:app", host=HOST, port=PORT, reload=False)
