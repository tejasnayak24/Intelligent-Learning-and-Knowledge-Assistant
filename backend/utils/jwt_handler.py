from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt
from jose.exceptions import JOSEError
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET")

ALGORITHM = "HS256"

def create_access_token(data):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(days=1)

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user_email(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    """Email of the signed-in user, from the token the frontend sends.

    Used to keep each user's documents separate. Raises 401 when the token
    is missing, invalid or expired.
    """
    claims = {}

    if credentials is not None:
        try:
            claims = jwt.decode(
                credentials.credentials,
                SECRET_KEY,
                algorithms=[ALGORITHM]
            )
        except JOSEError:
            claims = {}

    email = claims.get("email")

    if not isinstance(email, str) or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has expired or you are not logged in. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return email