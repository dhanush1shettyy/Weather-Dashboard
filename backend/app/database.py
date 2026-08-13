from sqlmodel import SQLModel, Session, create_engine
from app.config import settings

# echo=True is handy while developing; turn off before your demo if the console gets noisy
engine = create_engine(settings.database_url, echo=False)


def init_db() -> None:
    """Create tables if they don't exist. Called once on startup."""
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session