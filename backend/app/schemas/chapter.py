from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ChapterBase(BaseModel):
    """章节基础 Schema"""
    chapter_id: str = Field(..., description="章节唯一标识")
    title: str = Field(..., min_length=1, max_length=200, description="标题")
    description: str = Field(..., description="描述")
    content: str = Field(..., description="详细内容")
    simple_explanation: str = Field(..., description="通俗解释")
    category: str = Field(..., pattern="^(micro|macro|finance)$", description="分类")
    difficulty: str = Field(default="beginner", pattern="^(beginner|intermediate|advanced)$")
    order: int = Field(default=0, ge=0, description="排序")
    examples: Optional[List[str]] = Field(default=[], description="案例列表")
    related_charts: Optional[List[str]] = Field(default=[], description="相关图表")
    is_published: bool = Field(default=True, description="是否发布")


class ChapterCreate(ChapterBase):
    """创建章节"""
    pass


class ChapterUpdate(BaseModel):
    """更新章节"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    content: Optional[str] = None
    simple_explanation: Optional[str] = None
    category: Optional[str] = Field(None, pattern="^(micro|macro|finance)$")
    difficulty: Optional[str] = Field(None, pattern="^(beginner|intermediate|advanced)$")
    order: Optional[int] = Field(None, ge=0)
    examples: Optional[List[str]] = None
    related_charts: Optional[List[str]] = None
    is_published: Optional[bool] = None


class Chapter(ChapterBase):
    """章节响应"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChapterList(BaseModel):
    """章节列表响应"""
    items: List[Chapter]
    total: int
    page: int
    page_size: int


# 分类 Schema
class CategoryStats(BaseModel):
    """分类统计"""
    category: str
    name: str
    count: int
