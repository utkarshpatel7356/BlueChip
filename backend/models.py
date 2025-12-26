from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

# --- User Model (DB Table) ---
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    password_hash: str
    balance: float = Field(default=1000.0) 
    
    # Relationships
    posts: List["Post"] = Relationship(back_populates="creator")
    transactions: List["Transaction"] = Relationship(back_populates="user")
    portfolio_items: List["Portfolio"] = Relationship(back_populates="user")

# --- Post Model (DB Table) ---
class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str = Field(max_length=280)
    creator_id: int = Field(foreign_key="user.id")
    
    shares_sold: int = Field(default=0)
    current_price: float = Field(default=10.0) 
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    creator: User = Relationship(back_populates="posts")
    transactions: List["Transaction"] = Relationship(back_populates="post")
    portfolio_entries: List["Portfolio"] = Relationship(back_populates="post")

# --- Portfolio Model (DB Table) ---
class Portfolio(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    post_id: int = Field(foreign_key="post.id")
    shares_owned: int = Field(default=0)
    avg_buy_price: float = Field(default=0.0) 

    # Relationships
    user: User = Relationship(back_populates="portfolio_items")
    post: Post = Relationship(back_populates="portfolio_entries")

# --- Transaction Model (DB Table) ---
class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    post_id: int = Field(foreign_key="post.id")
    type: str # "buy" or "sell"
    amount: int 
    price_at_transaction: float 
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    user: User = Relationship(back_populates="transactions")
    post: Post = Relationship(back_populates="transactions")

# --- Schemas (For API Responses) ---
# THIS IS THE FIX: Ensure balance is included!
class UserRead(SQLModel):
    id: int
    username: str
    balance: float

class PortfolioRead(SQLModel):
    """
    Schema for sending Portfolio data to frontend.
    Excludes relationships to prevent infinite loops.
    """
    id: int
    user_id: int
    post_id: int
    shares_owned: int
    avg_buy_price: float