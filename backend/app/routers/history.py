from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.database import get_session
from app.models import SearchHistory, User
from app.schemas import SearchHistoryRead
from app.auth import get_current_user

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/", response_model=List[SearchHistoryRead])
def list_history(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    limit: int = 20,
):
    return session.exec(
        select(SearchHistory)
        .where(SearchHistory.user_id == current_user.id)
        .order_by(SearchHistory.searched_at.desc())
        .limit(limit)
    ).all()


@router.delete("/", status_code=204)
def clear_history(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    entries = session.exec(
        select(SearchHistory).where(SearchHistory.user_id == current_user.id)
    ).all()
    for entry in entries:
        session.delete(entry)
    session.commit()