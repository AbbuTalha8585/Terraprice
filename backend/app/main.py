from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.routes import router
import uvicorn


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("TerraPrice backend starting up...")
    try:
        from app.models.database import create_tables
        create_tables()
        print("Database tables created successfully")
    except Exception as e:
        print(f"Database not available: {e} — running without DB")
    yield
    print("TerraPrice backend shutting down...")


app = FastAPI(
    title="TerraPrice API",
    description="Multi-cloud infrastructure cost estimator using Terraform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
def root():
    return {"message": "TerraPrice API is running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
