import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.chapter import Chapter as ChapterModel
from app.schemas.chapter import Chapter, ChapterCreate, ChapterUpdate, ChapterList, CategoryStats
from app.services.auth import get_current_active_user, get_current_admin_user
from app.models.user import User

router = APIRouter()


def chapter_to_dict(chapter: ChapterModel) -> dict:
    """将数据库模型转换为字典，解析 JSON 字段"""
    data = {
        "id": chapter.id,
        "chapter_id": chapter.chapter_id,
        "title": chapter.title,
        "description": chapter.description,
        "content": chapter.content,
        "simple_explanation": chapter.simple_explanation,
        "category": chapter.category,
        "difficulty": chapter.difficulty,
        "order": chapter.order,
        "examples": json.loads(chapter.examples) if chapter.examples else [],
        "related_charts": json.loads(chapter.related_charts) if chapter.related_charts else [],
        "is_published": chapter.is_published,
        "created_at": chapter.created_at,
        "updated_at": chapter.updated_at,
    }
    return data


@router.get("", response_model=ChapterList)
async def get_chapters(
    category: str | None = Query(None, description="按分类筛选"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(50, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db),
):
    """
    获取章节列表

    - **category**: 可选，按分类筛选 (micro/macro/finance)
    - **page**: 页码，从 1 开始
    - **page_size**: 每页数量，1-100
    """
    query = db.query(ChapterModel)

    if category:
        query = query.filter(ChapterModel.category == category)

    query = query.filter(ChapterModel.is_published == True)
    query = query.order_by(ChapterModel.order)

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return ChapterList(
        items=[Chapter(**chapter_to_dict(item)) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/stats", response_model=List[CategoryStats])
async def get_category_stats(db: Session = Depends(get_db)):
    """获取分类统计"""
    category_names = {
        "micro": "微观经济学",
        "macro": "宏观经济学",
        "finance": "金融学",
    }

    stats = []
    for cat_id, cat_name in category_names.items():
        count = (
            db.query(ChapterModel)
            .filter(ChapterModel.category == cat_id, ChapterModel.is_published == True)
            .count()
        )
        stats.append(CategoryStats(category=cat_id, name=cat_name, count=count))

    return stats


@router.get("/{chapter_id}", response_model=Chapter)
async def get_chapter(
    chapter_id: str,
    db: Session = Depends(get_db),
):
    """获取单个章节详情"""
    chapter = (
        db.query(ChapterModel)
        .filter(ChapterModel.chapter_id == chapter_id, ChapterModel.is_published == True)
        .first()
    )

    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="章节不存在"
        )

    return Chapter(**chapter_to_dict(chapter))


@router.post("", response_model=Chapter, status_code=status.HTTP_201_CREATED)
async def create_chapter(
    chapter_data: ChapterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    创建新章节（管理员）

    - **chapter_id**: 章节唯一标识（如 supply-demand）
    - **title**: 章节标题
    - **content**: 详细内容
    - **simple_explanation**: 通俗解释
    - **examples**: 案例列表（JSON 数组）
    - **related_charts**: 相关图表 ID 列表（JSON 数组）
    """
    # 检查 chapter_id 是否已存在
    existing = db.query(ChapterModel).filter(ChapterModel.chapter_id == chapter_data.chapter_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="章节 ID 已存在"
        )

    chapter = ChapterModel(
        chapter_id=chapter_data.chapter_id,
        title=chapter_data.title,
        description=chapter_data.description,
        content=chapter_data.content,
        simple_explanation=chapter_data.simple_explanation,
        examples=json.dumps(chapter_data.examples) if chapter_data.examples else None,
        category=chapter_data.category,
        difficulty=chapter_data.difficulty,
        order=chapter_data.order,
        related_charts=json.dumps(chapter_data.related_charts) if chapter_data.related_charts else None,
        is_published=chapter_data.is_published,
    )

    db.add(chapter)
    db.commit()
    db.refresh(chapter)

    return Chapter(**chapter_to_dict(chapter))


@router.put("/{chapter_id}", response_model=Chapter)
async def update_chapter(
    chapter_id: str,
    chapter_data: ChapterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """更新章节（管理员）"""
    chapter = db.query(ChapterModel).filter(ChapterModel.chapter_id == chapter_id).first()

    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="章节不存在"
        )

    # 更新字段
    update_data = chapter_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key in ["examples", "related_charts"] and value is not None:
            setattr(chapter, key, json.dumps(value))
        else:
            setattr(chapter, key, value)

    db.commit()
    db.refresh(chapter)

    return Chapter(**chapter_to_dict(chapter))


@router.delete("/{chapter_id}")
async def delete_chapter(
    chapter_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """删除章节（管理员）"""
    chapter = db.query(ChapterModel).filter(ChapterModel.chapter_id == chapter_id).first()

    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="章节不存在"
        )

    db.delete(chapter)
    db.commit()

    return {"message": "章节已删除", "success": True}
