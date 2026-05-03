#Checking at what stage the order is
from sqlalchemy import Column, Integer, String, Numeric, Boolean, ForeignKey, Enum, Text, DateTime
from sqlalchemy.orm import relationship
from database import Base
import enum, datetime
# there is our role of users admin is a staff of cafe for seeind orders change statys of orders delivery is a staff of deliverys  and customer is a just user who can make orders
class Roles(str,enum.Enum):
    customer = "customer"
    cafe_staff= "cafe_staff"
    delivery_staff= "delivery_staff"

# there is status of orders like pending confirmed by admin preparating ready delivered if is needed and cancelled if user drop order or admin drop it for some reasons happens
class OrderStatus(str,enum.Enum):
    pending="pending"
    confirmed="confirmed"
    preparing="preparing"
    ready="ready"
    delivered ="delivered"
    cancelled ="cancelled"
#our delivery table    
class Delivery(Base):
    __tablename__="deliveries"

    id=Column(Integer, primary_key=True)
    order_id=Column(Integer, ForeignKey("orders.id"), unique=True)
    delivery_user_id =Column(Integer, ForeignKey("users.id"))
    status=Column(String(50), default="assigned")
    order=relationship("Order", back_populates="delivery")
    delivery_user =relationship("User", back_populates="deliveries")
 #tracking through the user he can see his orders and courier   
class User(Base):
    __tablename__="users"

    id=Column(Integer, primary_key=True)
    full_name=Column(String(100),nullable=True)
    email=Column(String(150), unique=True, nullable=False)
    password=Column(String(255), nullable=False)
    role=Column(Enum(Roles, name="user_role"), default=Roles.customer)
    orders=relationship("Order", back_populates="user")
    deliveries=relationship("Delivery", back_populates="delivery_user")
#categories where we can choose our food and drink
class Category(Base):
    __tablename__="categories"
    id=Column(Integer, primary_key=True)
    name=Column(String(100), unique=True, nullable=False)
menu_items=relationship("MenuItem", back_populates="category")
#Menu with our table of food names, photos, and prices
class MenuItem(Base):
    __tablename__="menu_items"

    id=Column(Integer, primary_key=True)
    category_id=Column(Integer, ForeignKey("categories.id"))

    name=Column(String(100))
    description=Column(Text)
    price= Column(Numeric(8, 2))
    is_available =Column(Boolean, default=True)
    image_url=Column(String(255))
    category = relationship("Category", back_populates="menu_items")
    order_items = relationship("OrderItem", back_populates="menu_item")
#information about delivery details is saved
class Order(Base):
    __tablename__="orders"

    id=Column(Integer, primary_key=True)
    user_id=Column(Integer, ForeignKey("users.id"))
    status=Column(Enum(OrderStatus, name="order_status"), default=OrderStatus.pending)
    pickup_time=Column(DateTime) #pickup time if person want pick it up myself
    total_price =Column(Numeric(8, 2))
    note= Column(Text)
    created_at=Column(DateTime, default=datetime.datetime.utcnow)

    user=relationship("User", back_populates="orders")
    items=relationship("OrderItem", back_populates="order")
    delivery=relationship("Delivery", back_populates="order", uselist=False)

class OrderItem(Base):
    __tablename__="order_items"

    id=Column(Integer, primary_key=True)
    order_id =Column(Integer, ForeignKey("orders.id"))
    menu_item_id=Column(Integer, ForeignKey("menu_items.id"))
    quantity=Column(Integer)
    unit_price=Column(Numeric(8, 2))
    order =relationship("Order", back_populates="items")
    menu_ite =relationship("MenuItem", back_populates="order_items")

