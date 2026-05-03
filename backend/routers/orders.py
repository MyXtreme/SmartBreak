from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from auth_utils import get_current_user, require_admin
import aiosqlite

router = APIRouter()

VALID_PICKUP_TIMES = [
    "9:20 - 9:30", "10:20 - 10:30", "11:20 - 11:30",
    "12:20 - 12:30", "13:20 - 13:30", "14:20 - 14:30",
    "15:20 - 15:30", "16:20 - 16:30"
]

class OrderItemInput(BaseModel):
    menu_item_id: int
    quantity: int

class CreateOrderRequest(BaseModel):
    pickup_time: str
    items: List[OrderItemInput]

@router.post("/")
async def create_order(req: CreateOrderRequest, db: aiosqlite.Connection = Depends(get_db), user=Depends(get_current_user)):
    if req.pickup_time not in VALID_PICKUP_TIMES:
        raise HTTPException(status_code=400, detail="Invalid pickup time")
    if not req.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    total = 0.0
    order_items = []

    for oi in req.items:
        async with db.execute("""
            SELECT mi.*, c.is_countable FROM menu_items mi
            JOIN categories c ON mi.category_id=c.id
            WHERE mi.id=? AND mi.is_active=1
        """, (oi.menu_item_id,)) as cur:
            item = await cur.fetchone()
        if not item:
            raise HTTPException(status_code=404, detail=f"Menu item {oi.menu_item_id} not found")
        item = dict(item)

        if item["is_countable"] and item["available_amount"] is not None:
            if item["available_amount"] < oi.quantity:
                raise HTTPException(status_code=400, detail=f"Not enough stock for {item['name']}")

        total += item["price"] * oi.quantity
        order_items.append((oi.menu_item_id, oi.quantity, item["price"], item["is_countable"]))

    # Create order
    cur = await db.execute(
        "INSERT INTO orders (user_id, pickup_time, total_price) VALUES (?,?,?)",
        (user["id"], req.pickup_time, total)
    )
    order_id = cur.lastrowid

    for menu_item_id, quantity, price, is_countable in order_items:
        await db.execute(
            "INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_order) VALUES (?,?,?,?)",
            (order_id, menu_item_id, quantity, price)
        )
        if is_countable:
            await db.execute(
                "UPDATE menu_items SET available_amount = MAX(0, available_amount - ?) WHERE id=?",
                (quantity, menu_item_id)
            )

    await db.commit()
    return await _get_order_detail(order_id, db)

@router.get("/my")
async def get_my_orders(db: aiosqlite.Connection = Depends(get_db), user=Depends(get_current_user)):
    async with db.execute("SELECT id FROM orders WHERE user_id=? ORDER BY created_at DESC", (user["id"],)) as cur:
        order_ids = [r["id"] for r in await cur.fetchall()]
    return [await _get_order_detail(oid, db) for oid in order_ids]

@router.get("/all")
async def get_all_orders(db: aiosqlite.Connection = Depends(get_db), admin=Depends(require_admin)):
    async with db.execute("SELECT id FROM orders ORDER BY created_at DESC") as cur:
        order_ids = [r["id"] for r in await cur.fetchall()]
    return [await _get_order_detail(oid, db) for oid in order_ids]

@router.patch("/{order_id}/status")
async def update_order_status(order_id: int, body: dict, db: aiosqlite.Connection = Depends(get_db), admin=Depends(require_admin)):
    new_status = body.get("status")
    if new_status not in ("pending", "in_process", "ready", "declined"):
        raise HTTPException(status_code=400, detail="Invalid status")
    
    async with db.execute("SELECT id FROM orders WHERE id=?", (order_id,)) as cur:
        if not await cur.fetchone():
            raise HTTPException(status_code=404, detail="Order not found")
    
    # If declining, restore stock
    if new_status == "declined":
        async with db.execute("SELECT o.status FROM orders o WHERE o.id=?", (order_id,)) as cur:
            order = await cur.fetchone()
        if order and order["status"] not in ("declined",):
            async with db.execute("""
                SELECT oi.menu_item_id, oi.quantity, c.is_countable
                FROM order_items oi
                JOIN menu_items mi ON oi.menu_item_id=mi.id
                JOIN categories c ON mi.category_id=c.id
                WHERE oi.order_id=?
            """, (order_id,)) as cur:
                items = await cur.fetchall()
            for it in items:
                if it["is_countable"]:
                    await db.execute(
                        "UPDATE menu_items SET available_amount = available_amount + ? WHERE id=?",
                        (it["quantity"], it["menu_item_id"])
                    )

    await db.execute("UPDATE orders SET status=? WHERE id=?", (new_status, order_id))
    await db.commit()
    return await _get_order_detail(order_id, db)

async def _get_order_detail(order_id: int, db: aiosqlite.Connection):
    async with db.execute("""
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o JOIN users u ON o.user_id=u.id
        WHERE o.id=?
    """, (order_id,)) as cur:
        order = await cur.fetchone()
    if not order:
        return None
    order = dict(order)
    async with db.execute("""
        SELECT oi.*, mi.name as item_name, mi.price, mi.photo_url
        FROM order_items oi JOIN menu_items mi ON oi.menu_item_id=mi.id
        WHERE oi.order_id=?
    """, (order_id,)) as cur:
        items = [dict(r) for r in await cur.fetchall()]
    order["items"] = items
    return order
