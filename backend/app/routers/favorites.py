from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import FavoriteCity, User
from app.schemas import FavoriteCityCreate, FavoriteCityRead
from app.auth import get_current_user

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("/", response_model=List[FavoriteCityRead])
def list_favorites(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return session.exec(
        select(FavoriteCity).where(FavoriteCity.user_id == current_user.id)
    ).all()


@router.post("/", response_model=FavoriteCityRead, status_code=201)
def add_favorite(
    favorite: FavoriteCityCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    existing = session.exec(
        select(FavoriteCity).where(
            FavoriteCity.user_id == current_user.id,
            FavoriteCity.city_name == favorite.city_name,
        )
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="City already in favorites")

    entry = FavoriteCity(user_id=current_user.id, **favorite.model_dump())
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry


@router.delete("/{favorite_id}", status_code=204)
def remove_favorite(
    favorite_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    entry = session.get(FavoriteCity, favorite_id)
    if not entry or entry.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Favorite not found")
    session.delete(entry)
    session.commit()