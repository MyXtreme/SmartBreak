from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from database import get_db
from auth_utils import hash_password, verify_password, create_token, get_current_user
import aiosqlite

router = APIRouter()

class RegisterRequest(BaseModel):
    email: str
    name: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(req: RegisterRequest, db: aiosqlite.Connection = Depends(get_db)):
    if not req.email or "@" not in req.email:
        raise HTTPException(status_code=400, detail="Invalid email")
    async with db.execute("SELECT id FROM users WHERE email=?", (req.email,)) as cur:
        if await cur.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(req.password)
    await db.execute(
        "INSERT INTO users (email, name, password_hash) VALUES (?,?,?)",
        (req.email, req.name, hashed)
    )
    await db.commit()
    async with db.execute("SELECT * FROM users WHERE email=?", (req.email,)) as cur:
        user = dict(await cur.fetchone())
    token = create_token(user["id"], user["email"], bool(user["is_admin"]))
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user["name"], "is_admin": user["is_admin"]}}

@router.post("/login")
async def login(req: LoginRequest, db: aiosqlite.Connection = Depends(get_db)):
    async with db.execute("SELECT * FROM users WHERE email=?", (req.email,)) as cur:
        user = await cur.fetchone()
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = dict(user)
    token = create_token(user["id"], user["email"], bool(user["is_admin"]))
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user["name"], "is_admin": user["is_admin"]}}

@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["id"], "email": current_user["email"], "name": current_user["name"], "is_admin": current_user["is_admin"]}
