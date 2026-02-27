import sys
import os
import uvicorn

# Ensure backend directory is on the path and is the working directory
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(BACKEND_DIR)
sys.path.insert(0, BACKEND_DIR)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        reload_dirs=[BACKEND_DIR],
        app_dir=BACKEND_DIR,
    )
