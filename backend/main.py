from fastapi import FastAPI
from routes.auth import router as auth_router
from routes.upload import router as upload_router
from database import db
from routes.search import router as search_router

app = FastAPI()


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ], # Allows dev ports
    allow_credentials=True,
    allow_methods=["*"], # CRITICAL: This allows OPTIONS, POST, GET, etc.
    allow_headers=["*"], # Allows headers like Content-Type and Authorization
)

app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(search_router)

@app.get("/")
def root():
    return {"message": "ILKA Backend Running"}

@app.get("/test-db")
def test_db():
    db.command("ping")
    return {"message": "MongoDB Connected Successfully"}
@app.get("/check-vectors")
def check_vectors():
    import os

    return {
        "faiss_exists": os.path.exists("vectorstore/faiss_index.bin"),
        "chunks_exists": os.path.exists("vectorstore/chunks.pkl")
    }