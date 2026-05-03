from fastapi import APIRouter, Depends
from database import get_db
from auth_utils import require_admin
import aiosqlite

router = APIRouter()

@router.get("/stats")
async def get_stats(db: aiosqlite.Connection = Depends(get_db), admin=Depends(require_admin)):
    async with db.execute("SELECT COUNT(*) as total FROM orders") as cur:
        total_orders = (await cur.fetchone())["total"]
    async with db.execute("SELECT COUNT(*) as total FROM orders WHERE status='pending'") as cur:
        pending = (await cur.fetchone())["total"]
    async with db.execute("SELECT COUNT(*) as total FROM orders WHERE status='in_process'") as cur:
        in_process = (await cur.fetchone())["total"]
    async with db.execute("SELECT COUNT(*) as total FROM users WHERE is_admin=0") as cur:
        users = (await cur.fetchone())["total"]
    async with db.execute("SELECT SUM(total_price) as revenue FROM orders WHERE status != 'declined'") as cur:
        revenue = (await cur.fetchone())["revenue"] or 0
    async with db.execute("SELECT COUNT(*) as total FROM menu_items WHERE is_active=1") as cur:
        menu_count = (await cur.fetchone())["total"]
    return {
        "total_orders": total_orders,
        "pending_orders": pending,
        "in_process_orders": in_process,
        "total_users": users,
        "total_revenue": revenue,
        "menu_items": menu_count
    }
