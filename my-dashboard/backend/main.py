"""
FastAPI application entry point.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analytics, prediction


import threading


def _background_warmup():
    try:
        from data.lending_loader import preload
        preload()
        from data.ml_processor import _train_temporal
        _train_temporal()
    except Exception as e:
        print(f"[FastAPI] Warmup notice: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[FastAPI] Backend server starting up on http://127.0.0.1:8001 ...")
    threading.Thread(target=_background_warmup, daemon=True).start()
    yield
    print("[FastAPI] Backend server shutting down.")


app = FastAPI(
    title="DataSphere Dashboard API",
    version="2.0.0",
    description="Backend API — Lending Club Analytics & ML Prediction Dashboard",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics.router)
app.include_router(prediction.router)


@app.get("/")
def root():
    return {"message": "DataSphere Dashboard API is running", "version": "1.0.0"}
