from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from database import init_db
from routers import auth, menu, orders, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="SmartBreak API", lifespan=lifespan)

# Allow all origins so both deployed frontends (Vercel etc.) can reach the API.
# Credentials cannot be used with allow_origins=["*"], so the frontends
# send the JWT in the Authorization header instead (already the case).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(menu.router, prefix="/api/menu", tags=["menu"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
