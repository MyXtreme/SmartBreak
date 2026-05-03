from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from database import get_db
from auth_utils import require_admin
import aiosqlite

router = APIRouter()

class MenuItemCreate(BaseModel):
    category_id: int
    name: str
    description: Optional[str] = None
    price: float
    photo_url: Optional[str] = None
    available_amount: Optional[int] = None

class MenuItemUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    photo_url: Optional[str] = None
    available_amount: Optional[int] = None
    is_active: Optional[int] = None

@router.get("/categories")
async def get_categories(db: aiosqlite.Connection = Depends(get_db)):
    async with db.execute("SELECT * FROM categories ORDER BY name") as cur:
        rows = await cur.fetchall()
    return [dict(r) for r in rows]

@router.get("/items")
async def get_menu_items(db: aiosqlite.Connection = Depends(get_db)):
    async with db.execute("""
        SELECT mi.*, c.name as category_name, c.is_countable
        FROM menu_items mi
        JOIN categories c ON mi.category_id = c.id
        WHERE mi.is_active = 1
        ORDER BY c.name, mi.name
    """) as cur:
        rows = await cur.fetchall()
    return [dict(r) for r in rows]

@router.get("/items/all")
async def get_all_menu_items(db: aiosqlite.Connection = Depends(get_db), admin=Depends(require_admin)):
    async with db.execute("""
        SELECT mi.*, c.name as category_name, c.is_countable
        FROM menu_items mi
        JOIN categories c ON mi.category_id = c.id
        ORDER BY c.name, mi.name
    """) as cur:
        rows = await cur.fetchall()
    return [dict(r) for r in rows]

@router.post("/items")
async def create_menu_item(item: MenuItemCreate, db: aiosqlite.Connection = Depends(get_db), admin=Depends(require_admin)):
    # validate category
    async with db.execute("SELECT * FROM categories WHERE id=?", (item.category_id,)) as cur:
        cat = await cur.fetchone()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    cat = dict(cat)
    # only set available_amount for countable categories
    amount = item.available_amount if cat["is_countable"] else None
    await db.execute(
        "INSERT INTO menu_items (category_id, name, description, price, photo_url, available_amount) VALUES (?,?,?,?,?,?)",
        (item.category_id, item.name, item.description, item.price, item.photo_url, amount)
    )
    await db.commit()
    async with db.execute("""
        SELECT mi.*, c.name as category_name, c.is_countable
        FROM menu_items mi JOIN categories c ON mi.category_id=c.id
        WHERE mi.id = last_insert_rowid()
    """) as cur:
        row = await cur.fetchone()
    return dict(row)

@router.put("/items/{item_id}")
async def update_menu_item(item_id: int, item: MenuItemUpdate, db: aiosqlite.Connection = Depends(get_db), admin=Depends(require_admin)):
    async with db.execute("SELECT * FROM menu_items WHERE id=?", (item_id,)) as cur:
        existing = await cur.fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
    
    updates = item.dict(exclude_none=True)
    if not updates:
        return dict(existing)
    
    # check if category is countable
    cat_id = updates.get("category_id", existing["category_id"])
    async with db.execute("SELECT is_countable FROM categories WHERE id=?", (cat_id,)) as cur:
        cat = await cur.fetchone()
    if cat and not cat["is_countable"]:
        updates.pop("available_amount", None)
        # set to null if category changed to non-countable
        if "category_id" in updates:
            updates["available_amount"] = None
    
    set_clause = ", ".join(f"{k}=?" for k in updates)
    values = list(updates.values()) + [item_id]
    await db.execute(f"UPDATE menu_items SET {set_clause} WHERE id=?", values)
    await db.commit()
    async with db.execute("""
        SELECT mi.*, c.name as category_name, c.is_countable
        FROM menu_items mi JOIN categories c ON mi.category_id=c.id
        WHERE mi.id=?
    """, (item_id,)) as cur:
        row = await cur.fetchone()
    return dict(row)

@router.delete("/items/{item_id}")
async def delete_menu_item(item_id: int, db: aiosqlite.Connection = Depends(get_db), admin=Depends(require_admin)):
    async with db.execute("SELECT id FROM menu_items WHERE id=?", (item_id,)) as cur:
        if not await cur.fetchone():
            raise HTTPException(status_code=404, detail="Item not found")
    await db.execute("DELETE FROM menu_items WHERE id=?", (item_id,))
    await db.commit()
    return {"message": "Deleted"}
