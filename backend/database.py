import os
from sqlmodel import SQLModel, create_engine, Session

# 1. Get DB URL from environment, or use local SQLite
database_url = os.environ.get("DATABASE_URL")

if database_url:
    # Fix for Render: They use 'postgres://' but Python needs 'postgresql://'
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    # Production (PostgreSQL)
    engine = create_engine(database_url, echo=False)
else:
    # Local (SQLite)
    sqlite_file_name = "bluechip.db"
    sqlite_url = f"sqlite:///{sqlite_file_name}"
    engine = create_engine(sqlite_url, echo=True, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session