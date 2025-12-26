from sqlmodel import SQLModel, create_engine, Session

# This will create 'bluechip.db' inside the backend folder
sqlite_file_name = "bluechip.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# check_same_thread=False is crucial for SQLite + FastAPI concurrency
engine = create_engine(sqlite_url, echo=False, connect_args={"check_same_thread": False})

def create_db_and_tables():
    """Creates all tables defined in models.py if they don't exist."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency for FastAPI endpoints to access the DB."""
    with Session(engine) as session:
        yield session