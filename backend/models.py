from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

# --- User Model ---
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    password_hash: str
    balance: float = Field(default=1000.0) # Users start with 1000 credits
    
    # Relationships
    posts: List["Post"] = Relationship(back_populates="creator")
    transactions: List["Transaction"] = Relationship(back_populates="user")
    portfolio_items: List["Portfolio"] = Relationship(back_populates="user")

# --- Post Model (The "Stock") ---
class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str = Field(max_length=280)
    creator_id: int = Field(foreign_key="user.id")
    
    shares_sold: int = Field(default=0)
    current_price: float = Field(default=10.0) # Helper field for sorting
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    creator: User = Relationship(back_populates="posts")
    transactions: List["Transaction"] = Relationship(back_populates="post")
    portfolio_entries: List["Portfolio"] = Relationship(back_populates="post")

# --- Portfolio Model (Holdings) ---
class Portfolio(SQLModel, table=True):
    """Link table: Tracks how many shares of Post X are owned by User Y"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    post_id: int = Field(foreign_key="post.id")
    shares_owned: int = Field(default=0)

    # NEW FIELD
    avg_buy_price: float = Field(default=0.0)

    # Relationships
    user: User = Relationship(back_populates="portfolio_items")
    post: Post = Relationship(back_populates="portfolio_entries")

# --- Transaction Model (History) ---
class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    post_id: int = Field(foreign_key="post.id")
    type: str # "buy" or "sell"
    amount: int # How many shares involved
    price_at_transaction: float # Price per share at that moment
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: User = Relationship(back_populates="transactions")
    post: Post = Relationship(back_populates="transactions")

class UserRead(SQLModel):
    """
    A specific model for sending user data to the frontend.
    It EXCLUDES relationships (posts, portfolio) to prevent crashes.
    """
    id: int
    username: str
    balance: float