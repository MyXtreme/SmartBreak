from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from sqlalchemy.orm import Session
import datetime
import models, schemas, auth


router=APIRouter(prefix="/orders",tags=["orders"])

@router.post("/",response_model=schemas.OrderOut)
def place_order(
    data: schemas.OrderCreate,
    db: Session=Depends(get_db),
    current_user=Depends(auth.require_role("customer"))
):
    total=0
    items_to_add=[]
    for item_data in data.items:
        menu_item=db.query(models.MenuItem).get(item_data.menu_item_id)
        if not menu_item or not menu_item.is_available:
            raise HTTPException(400, f"Item {item_data.menu_item_id} unavailable")
        total+= float(menu_item.price) * item_data.quantity
        items_to_add.append((menu_item,item_data.quantity))

    order=models.Order(
        user_id=current_user.id,
        pickup_time=data.pickup_time,
        total_price=total,
        note=data.note,
    )
    db.add(order);db.flush()  

    for menu_item,qty in items_to_add:
        db.add(models.OrderItem(
            order_id=order.id,
            menu_item_id=menu_item.id,
            quantity=qty,
            unit_price=menu_item.price,
        ))
    db.commit();db.refresh(order)
    return order

@router.get("/my",response_model=list[schemas.OrderOut])
def my_orders(
    db: Session = Depends(get_db),
    current_user=Depends(auth.require_role("customer"))
):
    return db.query(models.Order).filter_by(user_id=current_user.id).all()

@router.get("/", response_model=list[schemas.OrderOut])
def all_orders(
    db: Session = Depends(get_db),
    _=Depends(auth.require_role("cafe_staff"))
):
    
    return db.query(models.Order).order_by(models.Order.created_at.desc()).all()

@router.patch("/{order_id}/status")
def update_status(
    order_id: int,
    data: schemas.StatusUpdate,
    db: Session = Depends(get_db),
    _=Depends(auth.require_role("cafe_staff"))
):
    order=db.query(models.Order).get(order_id)
    if not order:
        raise HTTPException(404,"Order not found")
    order.status=data.status
    db.commit()
    return {"message":"Status updated", "new_status": order.status}

