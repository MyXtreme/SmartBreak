# routers/menu.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth

router=APIRouter(prefix="/menu",tags=["menu"])

@router.get("/",response_model=list[schemas.MenuItemOut])
def get_menu(db: Session=Depends(get_db)):
    return db.query(models.MenuItem).all()

@router.post("/",response_model=schemas.MenuItemOut)
def create_item(
    data: schemas.MenuItemCreate,
    db: Session=Depends(get_db),
    _=Depends(auth.require_role("cafe_staff"))
):
    item=models.MenuItem(**data.dict())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.patch("/{item_id}/toggle")
def toggle_item(
    item_id: int,
    db: Session=Depends(get_db),
    _=Depends(auth.require_role("cafe_staff"))
):
    item=db.get(models.MenuItem,item_id)
    if not item:
        raise HTTPException(404,"Item not found")
    item.is_available=not item.is_available
    db.commit()
    return {"message":"updated","is_available": item.is_available}