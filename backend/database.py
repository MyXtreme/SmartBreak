#our database
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os
#the string connects to the database and tries to take it form the variable and if it doesnt exist it user the dafeult value
DATABASE_URL=os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:1234@localhost:5432/smartbreak"
)
engine=create_engine(
    DATABASE_URL,
    echo=True  
)
#we create a location from which we will take a connection to the database
SessionLocal=sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
class Base(DeclarativeBase):
    pass
#provides access to the database
def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()
