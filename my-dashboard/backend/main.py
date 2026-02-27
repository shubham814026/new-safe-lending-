"""
FastAPI application entry point.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analytics, prediction


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: preload all CSV data into memory
    from data.lending_loader import preload
    preload()
    yield
    # Shutdown: nothing to clean up


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
