from fastapi import APIRouter
from models.user import UserSignup
from services.auth_service import create_user

router = APIRouter()

@router.post("/signup")
def signup(user: UserSignup):

    return create_user(
        user.name,
        user.email,
        user.password
    )