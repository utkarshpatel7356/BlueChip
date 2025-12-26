# backend/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from database import create_db_and_tables, get_session
from models import User, Post, Transaction, Portfolio
from trading import get_current_price, calculate_buy_cost, calculate_sell_value

app = FastAPI(title="BlueChip Text Exchange")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Allow your Frontend
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (POST, GET, OPTIONS, etc.)
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# --- User & Setup Endpoints ---

@app.post("/users/", response_model=User)
def create_user(user: User, session: Session = Depends(get_session)):
    existing_user = session.exec(select(User).where(User.username == user.username)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username taken")
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: int, session: Session = Depends(get_session)):
    # We use .options(selectinload(...)) to force the DB to load the lists
    statement = select(User).where(User.id == user_id).options(
        selectinload(User.portfolio_items),
        selectinload(User.posts)
    )
    user = session.exec(statement).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# --- IPO Endpoint (Create Post) ---

@app.post("/posts/", response_model=Post)
def create_post(post: Post, session: Session = Depends(get_session)):
    # 1. Verify creator exists
    user = session.get(User, post.creator_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 2. Initialize post
    post.shares_sold = 0
    post.current_price = get_current_price(0)
    
    session.add(post)
    session.commit()
    session.refresh(post)
    return post

@app.get("/posts/", response_model=list[Post])
def read_posts(session: Session = Depends(get_session)):
    """Returns all posts with their live price."""
    posts = session.exec(select(Post)).all()
    # Update display price just in case
    for p in posts:
        p.current_price = get_current_price(p.shares_sold)
    return posts

# --- Trading Endpoints ---

# backend/main.py 

@app.post("/trade/buy")
def buy_shares(user_id: int, post_id: int, amount: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    post = session.get(Post, post_id)
    if not user or not post:
        raise HTTPException(status_code=404, detail="User or Post not found")
    
    if post.shares_sold + amount > 100:
        raise HTTPException(status_code=400, detail="Not enough shares available")

    # 1. Calculate Cost
    cost = calculate_buy_cost(post.shares_sold, amount)
    
    if user.balance < cost:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    # 2. Update User & Post
    user.balance -= cost
    post.shares_sold += amount
    post.current_price = get_current_price(post.shares_sold)
    
    # 3. Update Portfolio (Weighted Average Logic)
    portfolio_stmt = select(Portfolio).where(Portfolio.user_id == user_id, Portfolio.post_id == post_id)
    portfolio_item = session.exec(portfolio_stmt).first()
    
    if portfolio_item:
        # Calculate new weighted average
        total_value_old = portfolio_item.shares_owned * portfolio_item.avg_buy_price
        total_value_new = total_value_old + cost
        new_total_shares = portfolio_item.shares_owned + amount
        
        portfolio_item.avg_buy_price = total_value_new / new_total_shares
        portfolio_item.shares_owned = new_total_shares
    else:
        # First buy
        avg_price = cost / amount
        portfolio_item = Portfolio(
            user_id=user_id, 
            post_id=post_id, 
            shares_owned=amount, 
            avg_buy_price=avg_price
        )
        session.add(portfolio_item)
    
    # 4. Log Transaction
    txn = Transaction(
        user_id=user_id, post_id=post_id, type="buy", 
        amount=amount, price_at_transaction=post.current_price
    )
    session.add(txn)
    session.add(user)
    session.add(post)
    session.commit()
    
    return {"status": "success"}

@app.post("/trade/sell")
def sell_shares(user_id: int, post_id: int, amount: int, session: Session = Depends(get_session)):
    # 1. Get User, Post, Portfolio
    user = session.get(User, user_id)
    post = session.get(Post, post_id)
    
    portfolio_stmt = select(Portfolio).where(Portfolio.user_id == user_id, Portfolio.post_id == post_id)
    portfolio_item = session.exec(portfolio_stmt).first()

    if not user or not post or not portfolio_item:
        raise HTTPException(status_code=404, detail="User, Post, or Holdings not found")

    # 2. Check Ownership
    if portfolio_item.shares_owned < amount:
        raise HTTPException(status_code=400, detail="You do not own enough shares")

    # 3. Calculate Sell Value
    payout = calculate_sell_value(post.shares_sold, amount)

    # 4. EXECUTE TRANSACTION
    
    # A. Add Money
    user.balance += payout
    
    # B. Update Post Supply
    post.shares_sold -= amount
    post.current_price = get_current_price(post.shares_sold)
    
    # C. Update Portfolio
    portfolio_item.shares_owned -= amount
    if portfolio_item.shares_owned == 0:
        session.delete(portfolio_item)
    else:
        session.add(portfolio_item)
        
    # D. Log Transaction
    txn = Transaction(
        user_id=user_id, post_id=post_id, type="sell", 
        amount=amount, price_at_transaction=post.current_price
    )
    session.add(txn)

    session.add(user)
    session.add(post)
    session.commit()

    return {"status": "success", "new_balance": user.balance, "payout": payout}

@app.get("/portfolio/{user_id}", response_model=list[Portfolio])
def get_portfolio(user_id: int, session: Session = Depends(get_session)):
    """Fetches just the portfolio items for a user."""
    statement = select(Portfolio).where(Portfolio.user_id == user_id)
    results = session.exec(statement).all()
    return results