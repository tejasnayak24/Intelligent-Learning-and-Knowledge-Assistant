from fastapi import APIRouter
from models.user import UserSignup, UserLogin
from services.auth_service import create_user, login_user

router = APIRouter()

@router.post("/signup")
def signup(user: UserSignup):

    return create_user(
        user.name,
        user.email,
        user.password
    )

@router.post("/login")
def login(user: UserLogin):

    return login_user(
        user.email,
        user.password
    )