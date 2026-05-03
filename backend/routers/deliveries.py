from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from sqlalchemy.orm import Session
import models, schemas, auth

router=APIRouter(prefix="/deliveries",tags=["deliveries"])

@router.get("/ready",response_model=list[schemas.OrderOut])
def ready_orders(
    db: Session=Depends(get_db),
    _=Depends(auth.require_role("delivery_staff"))
):
   return db.query(models.Order).filter_by(status="ready").all()
@router.patch("/{order_id}/deliver")
def mark_delivered(
    order_id: int,
    db: Session=Depends(get_db),
    current_user=Depends(auth.require_role("delivery_staff"))
):
    order=db.query(models.Order).get(order_id)
    if not order or order.status != "ready":
        raise HTTPException(400, "Order not ready")
    order.status="delivered"
    delivery=models.Delivery(order_id=order.id,delivery_user_id=current_user.id,status="delivered")
    db.add(delivery); db.commit()
    return {"message":"Marked as delivered"}