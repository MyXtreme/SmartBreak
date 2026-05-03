# This part controls incoming and outgoing data.
from pydantic import BaseModel, EmailStr
import datetime
from typing import List, Optional
import enum

class UserRole(str,enum.Enum):
    customer="customer"
    cafe_staff="cafe_staff"
    delivery_staff="delivery_staff"

class OrderStatus(str,enum.Enum):
    pending="pending"
    confirmed="confirmed"
    preparing="preparing"
    ready="ready"
    delivered="delivered"
    cancelled="cancelled"

class UserCreate(BaseModel):
    full_name:str
    email:EmailStr
    password:str
    role:UserRole
#data that is sent to the user without a password
class UserOut(BaseModel):
    id:int
    full_name:str
    email:EmailStr
    role:UserRole

    class Config:
        from_attributes=True

class Token(BaseModel):
    access_token:str
    token_type:str
    role:UserRole

class LoginData(BaseModel):
    email:EmailStr
    password:str
#information about the menus that are displayed to the client
class MenuItemOut(BaseModel):
    id:int
    name:str
    description:Optional[str]
    price:float
    is_available:bool

    class Config:
        from_attributes=True

class MenuItemCreate(BaseModel):
    name: str
    description: Optional[str]
    price: float

class OrderItemCreate(BaseModel):
    menu_item_id:int
    quantity:int

class OrderItemOut(BaseModel):
    menu_item_id:int
    quantity:int
    unit_price:float

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    pickup_time: datetime.datetime #when delivery  will pick up the order 
    note: Optional[str] = None
    items: List[OrderItemCreate]

class OrderOut(BaseModel):
    id: int
    user_id:int
    status: OrderStatus
    pickup_time:datetime.datetime
    total_price:float
    note:Optional[str]

    class Config:
        from_attributes=True

class StatusUpdate(BaseModel):
    status:OrderStatus
#When a user submits data, the system checks that the email address is correct, that all required fields are filled in, and that the data format is correct.
