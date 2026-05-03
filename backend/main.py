# main part 
from fastapi import FastAPI
from routers import users, menu, orders, deliveries
from database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
#we create tables in database
Base.metadata.create_all(bind=engine) 
#we create app
app=FastAPI(title="SmartBreak API", version="1.0.0")
#we give permission to the connet the fornted
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
#we include our accounts
app.include_router(users.router)
app.include_router(menu.router)
app.include_router(orders.router)
app.include_router(deliveries.router)

@app.get("/")
def health():
    return {"status":" API running"}
