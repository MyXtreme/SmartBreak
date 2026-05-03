import jwt
import bcrypt
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_db
import aiosqlite

SECRET_KEY = "smartbreak-super-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_token(user_id: int, email: str, is_admin: bool) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "is_admin": is_admin,
        "exp": datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: aiosqlite.Connection = Depends(get_db)
):
    payload = decode_token(credentials.credentials)
    user_id = int(payload["sub"])
    async with db.execute("SELECT * FROM users WHERE id=?", (user_id,)) as cur:
        user = await cur.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return dict(user)

async def require_admin(current_user: dict = Depends(get_current_user)):
    if not current_user["is_admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
