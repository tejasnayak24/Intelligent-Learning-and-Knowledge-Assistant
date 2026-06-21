<<<<<<< HEAD
from fastapi import APIRouter
=======
from fastapi import APIRouter, HTTPException, status
>>>>>>> frontend
from models.user import UserSignup, UserLogin
from services.auth_service import create_user, login_user

router = APIRouter()

@router.post("/signup")
def signup(user: UserSignup):
<<<<<<< HEAD

    return create_user(
=======
    # 1. Execute the registration database logic
    result = create_user(
>>>>>>> frontend
        user.name,
        user.email,
        user.password
    )
<<<<<<< HEAD

@router.post("/login")
def login(user: UserLogin):

    return login_user(
        user.email,
        user.password
    )
=======
    
    # 2. Safety Net: Check if the service returned a failure string or dictionary
    if isinstance(result, str) and "error" in result.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=result
        )
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=result["error"]
        )

    return result

@router.post("/login")
def login(user: UserLogin):
    # 1. Execute the credential validation logic
    result = login_user(
        user.email,
        user.password
    )
    
    # 2. Safety Net: Intercept the "error user not found" strings or objects
    if isinstance(result, str) and "error" in result.lower():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail=result
        )
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail=result["error"]
        )

    # 3. If no errors are detected, return the valid plain token payload safely
    return result
>>>>>>> frontend
