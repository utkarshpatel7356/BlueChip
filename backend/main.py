# backend/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from database import create_db_and_tables, get_session
from models import User, Post, Transaction, Portfolio
from trading import get_current_price, calculate_buy_cost, calculate_sell_value
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from auth import verify_password, get_password_hash, create_access_token, SECRET_KEY, ALGORITHM
from jose import JWTError, jwt
from models import User, Post, UserRead

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

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


def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=401, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = session.exec(select(User).where(User.username == username)).first()
    if user is None:
        raise credentials_exception
    return user


# --- Auth Endpoints ---

@app.post("/register", response_model=User)
def register(user: User, session: Session = Depends(get_session)):
    # Check existing
    if session.exec(select(User).where(User.username == user.username)).first():
        raise HTTPException(status_code=400, detail="Username taken")
    
    # Hash password
    user.password_hash = get_password_hash(user.password_hash)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# --- Leaderboard Endpoint ---

@app.get("/leaderboard")
def get_leaderboard(session: Session = Depends(get_session)):
    """
    Calculates Net Worth for all users.
    Note: In a real app, you would cache this or calculate it periodically.
    """
    users = session.exec(select(User)).all()
    posts = session.exec(select(Post)).all()
    
    # Create price map
    price_map = {p.id: p.current_price for p in posts}
    
    leaderboard = []
    for u in users:
        # Load portfolio
        statement = select(Portfolio).where(Portfolio.user_id == u.id)
        portfolio = session.exec(statement).all()
        
        assets_value = sum([item.shares_owned * price_map.get(item.post_id, 0) for item in portfolio])
        net_worth = u.balance + assets_value
        
        leaderboard.append({
            "username": u.username,
            "net_worth": net_worth,
            "balance": u.balance
        })
    
    # Sort by Net Worth descending
    leaderboard.sort(key=lambda x: x['net_worth'], reverse=True)
    return leaderboard

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

# backend/main.py

# --- IPO Endpoint (Create Post) ---

@app.post("/posts/", response_model=Post)
def create_post(post: Post, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    post.creator_id = current_user.id # <--- Correct
    post.shares_sold = 0
    post.current_price = 10.0
    session.add(post)
    session.commit()
    session.refresh(post)
    return post

@app.get("/posts/", response_model=list[Post])
def read_posts(session: Session = Depends(get_session)):
    posts = session.exec(select(Post)).all()
    for p in posts:
        p.current_price = get_current_price(p.shares_sold)
    return posts

# --- Trading Endpoints ---

@app.post("/trade/buy")
def buy_shares(post_id: int, amount: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    user = current_user
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
    # FIX: Use 'current_user.id' instead of 'current_user'
    portfolio_stmt = select(Portfolio).where(Portfolio.user_id == current_user.id, Portfolio.post_id == post_id)
    portfolio_item = session.exec(portfolio_stmt).first()
    
    if portfolio_item:
        total_value_old = portfolio_item.shares_owned * portfolio_item.avg_buy_price
        total_value_new = total_value_old + cost
        new_total_shares = portfolio_item.shares_owned + amount
        
        portfolio_item.avg_buy_price = total_value_new / new_total_shares
        portfolio_item.shares_owned = new_total_shares
    else:
        # First buy
        avg_price = cost / amount
        portfolio_item = Portfolio(
            user_id=current_user.id, # <--- FIX
            post_id=post_id, 
            shares_owned=amount, 
            avg_buy_price=avg_price
        )
        session.add(portfolio_item)
    
    # 4. Log Transaction
    txn = Transaction(
        user_id=current_user.id, # <--- FIX
        post_id=post_id, type="buy", 
        amount=amount, price_at_transaction=post.current_price
    )
    session.add(txn)
    session.add(user)
    session.add(post)
    session.commit()
    
    return {"status": "success"}

@app.post("/trade/sell")
def sell_shares(post_id: int, amount: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    user = current_user
    post = session.get(Post, post_id)
    
    # FIX: Use 'current_user.id'
    portfolio_stmt = select(Portfolio).where(Portfolio.user_id == current_user.id, Portfolio.post_id == post_id)
    portfolio_item = session.exec(portfolio_stmt).first()

    if not user or not post or not portfolio_item:
        raise HTTPException(status_code=404, detail="User, Post, or Holdings not found")

    if portfolio_item.shares_owned < amount:
        raise HTTPException(status_code=400, detail="You do not own enough shares")

    payout = calculate_sell_value(post.shares_sold, amount)

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
        user_id=current_user.id, # <--- FIX
        post_id=post_id, type="sell", 
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


@app.get("/users/me", response_model=UserRead) # <--- Change this
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user