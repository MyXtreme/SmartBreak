# auth.py this is authentication nd authorization
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import models, os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db


SECRET_KEY=os.getenv("SECRET_KEY","change-me-in-production")
ALGORITHM="HS256"
TOKEN_EXPIRE_HOURS=8

pwd_context=CryptContext(schemes=["bcrypt"],deprecated="auto")
oauth2_scheme=OAuth2PasswordBearer(tokenUrl="/users/login")

def hash_password(plain:str)->str:
    return pwd_context.hash(plain)
#checking the entered and saved password
def verify_password(plain:str,hashed:str)->bool:
    return pwd_context.verify(plain,hashed)

def create_token(data:dict)->str:
    payload=data.copy()
    payload["exp"]=datetime.utcnow()+timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode(payload,SECRET_KEY, algorithm=ALGORITHM)
#getting current user
def get_current_user(token:str=Depends(oauth2_scheme),db:Session=Depends(get_db)):
#displays if there is an error
    credentials_error=HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate token",
        headers={"WWW-Authenticate":"Bearer"},
    )
    try:
        payload=jwt.decode(token, SECRET_KEY,algorithms=[ALGORITHM])
        user_id: int=payload.get("sub")
        if user_id is None:
            raise credentials_error
    except JWTError:
        raise credentials_error
#code searches for for a user i the database
    user=db.query(models.User).filter(models.User.id==user_id).first()
    if not user:
        raise credentials_error
    return user
#check if an admin, user or delivery person has logge in
def require_role(*roles):
    def checker(current_user=Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403,detail="Access denied")
        return current_user
    return checker
