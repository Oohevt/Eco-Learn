from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserProgress as UserProgressModel, Favorite as FavoriteModel
from app.models.chapter import Chapter as ChapterModel
from app.schemas.user import Progress, ProgressCreate, ProgressUpdate, Favorite, FavoriteBase, MessageResponse
from app.services.auth import get_current_active_user

router = APIRouter()


# ===== 学习进度 API =====

@router.get("/progress", response_model=List[Progress])
async def get_user_progress(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """获取用户所有学习进度"""
    progress_records = (
        db.query(UserProgressModel)
        .filter(UserProgressModel.user_id == current_user.id)
        .all()
    )
    return [Progress.model_validate(p) for p in progress_records]


@router.get("/progress/{chapter_id}", response_model=Progress)
async def get_chapter_progress(
    chapter_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """获取指定章节的学习进度"""
    progress = (
        db.query(UserProgressModel)
        .filter(
            UserProgressModel.user_id == current_user.id,
            UserProgressModel.chapter_id == chapter_id
        )
        .first()
    )

    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="进度记录不存在"
        )

    return Progress.model_validate(progress)


@router.post("/progress", response_model=Progress, status_code=status.HTTP_201_CREATED)
async def create_or_update_progress(
    progress_data: ProgressCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """创建或更新学习进度"""
    # 查找现有记录
    progress = (
        db.query(UserProgressModel)
        .filter(
            UserProgressModel.user_id == current_user.id,
            UserProgressModel.chapter_id == progress_data.chapter_id
        )
        .first()
    )

    if progress:
        # 更新现有记录
        progress.status = progress_data.status
        if progress_data.status == "completed":
            progress.completed_at = datetime.utcnow()
    else:
        # 创建新记录
        progress = UserProgressModel(
            user_id=current_user.id,
            chapter_id=progress_data.chapter_id,
            status=progress_data.status,
            completed_at=datetime.utcnow() if progress_data.status == "completed" else None
        )
        db.add(progress)

    db.commit()
    db.refresh(progress)

    return Progress.model_validate(progress)


@router.put("/progress/{chapter_id}", response_model=Progress)
async def update_progress(
    chapter_id: str,
    progress_data: ProgressUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """更新学习进度"""
    progress = (
        db.query(UserProgressModel)
        .filter(
            UserProgressModel.user_id == current_user.id,
            UserProgressModel.chapter_id == chapter_id
        )
        .first()
    )

    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="进度记录不存在"
        )

    progress.status = progress_data.status
    if progress_data.status == "completed":
        progress.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(progress)

    return Progress.model_validate(progress)


@router.delete("/progress", response_model=MessageResponse)
async def clear_all_progress(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """清空所有学习进度"""
    # 删除用户的所有进度记录
    db.query(UserProgressModel).filter(
        UserProgressModel.user_id == current_user.id
    ).delete()

    db.commit()

    return MessageResponse(message="学习进度已清空", success=True)


# ===== 收藏 API =====

@router.get("/favorites", response_model=list[Favorite])
async def get_favorites(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """获取用户收藏列表"""
    favorites = (
        db.query(FavoriteModel)
        .filter(FavoriteModel.user_id == current_user.id)
        .order_by(FavoriteModel.created_at.desc())
        .all()
    )
    return [Favorite.model_validate(f) for f in favorites]


@router.post("/favorites", response_model=Favorite, status_code=status.HTTP_201_CREATED)
async def add_favorite(
    favorite_data: FavoriteBase,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """添加收藏"""
    # 检查是否已收藏
    existing = (
        db.query(FavoriteModel)
        .filter(
            FavoriteModel.user_id == current_user.id,
            FavoriteModel.chapter_id == favorite_data.chapter_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="已收藏该章节"
        )

    favorite = FavoriteModel(
        user_id=current_user.id,
        chapter_id=favorite_data.chapter_id
    )

    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    return Favorite.model_validate(favorite)


@router.delete("/favorites/{chapter_id}")
async def remove_favorite(
    chapter_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """取消收藏"""
    favorite = (
        db.query(FavoriteModel)
        .filter(
            FavoriteModel.user_id == current_user.id,
            FavoriteModel.chapter_id == chapter_id
        )
        .first()
    )

    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="收藏记录不存在"
        )

    db.delete(favorite)
    db.commit()

    return MessageResponse(message="取消收藏成功", success=True)
