from fastapi import FastAPI
from routes.auth import router as auth_router
from routes.upload import router as upload_router
from database import db

app = FastAPI()

app.include_router(auth_router)
app.include_router(upload_router)

@app.get("/")
def root():
    return {"message": "ILKA Backend Running"}

@app.get("/test-db")
def test_db():
    db.command("ping")
    return {"message": "MongoDB Connected Successfully"}