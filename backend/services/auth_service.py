from database import db
from passlib.context import CryptContext
from utils.jwt_handler import create_access_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

users_collection = db["users"]


def create_user(name, email, password):

    existing_user = users_collection.find_one({"email": email})

    if existing_user:
        return {"error": "User already exists"}

    hashed_password = pwd_context.hash(password)

    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password
    })

    return {"message": "User registered successfully"}

def login_user(email, password):

    user = users_collection.find_one({"email": email})

    if not user:
        return {"error": "User not found"}

    if not pwd_context.verify(password, user["password"]):
        return {"error": "Invalid password"}

    token = create_access_token({
    "email": user["email"]
})

    return {
    "access_token": token,
    "token_type": "bearer"
}
