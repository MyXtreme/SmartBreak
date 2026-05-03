from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=schemas.UserOut)
def register(data: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(email=data.email).first():
        raise HTTPException(400,"Email already registered,try logging in")
    user=models.User(
        full_name=data.full_name,
        email=data.email,
        role=data.role,
        password=auth.hash_password(data.password),
    )
    db.add(user); db.commit(); db.refresh(user)
    return user

@router.post("/login",response_model=schemas.Token)
def login(data: schemas.LoginData, db: Session=Depends(get_db)):
    user=db.query(models.User).filter_by(email=data.email).first()
    if not user or not auth.verify_password(data.password,user.password):
        raise HTTPException(401, "Invalid credentials")
    token=auth.create_token({"sub":user.id,"role":user.role})
    return {"access_token": token, "token_type":"bearer","role":user.role}

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user=Depends(auth.get_current_user)):
    return current_user